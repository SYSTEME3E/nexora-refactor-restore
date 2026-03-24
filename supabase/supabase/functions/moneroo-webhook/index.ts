// supabase/functions/moneroo-webhook/index.ts
// ─────────────────────────────────────────────────────────────────
// Edge Function : Recevoir les webhooks Moneroo
// Configure l'URL dans ton dashboard Moneroo :
//   https://YOUR_PROJECT.supabase.co/functions/v1/moneroo-webhook
// ─────────────────────────────────────────────────────────────────
// Deploy : supabase functions deploy moneroo-webhook
// ─────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log("Webhook reçu:", JSON.stringify(payload));

    const { event, data } = payload;

    // ── PAIEMENT COMPLÉTÉ
    if (event === "payment.completed" || event === "payment.success") {
      const paymentId   = data?.id;
      const metadata    = data?.metadata ?? {};
      const userId      = metadata?.user_id;
      const paymentType = metadata?.payment_type;
      const amount      = data?.amount;

      if (!userId || !paymentType) {
        return new Response("Missing metadata", { status: 400 });
      }

      // Mettre à jour le statut de la transaction
      await supabase.from("nexora_transactions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("moneroo_id", paymentId);

      // ── Actions selon le type de paiement
      if (paymentType === "abonnement_premium") {
        // Activer le plan premium
        const expireAt = new Date();
        expireAt.setMonth(expireAt.getMonth() + 1);
        await supabase.from("nexora_users")
          .update({
            plan: "premium",
            plan_expire_at: expireAt.toISOString(),
            badge_premium: true,
          })
          .eq("id", userId);

      } else if (paymentType === "recharge_transfert") {
        // Créditer le solde transfert
        const { data: user } = await supabase
          .from("nexora_transfert_comptes")
          .select("solde")
          .eq("user_id", userId)
          .single();

        if (user) {
          await supabase.from("nexora_transfert_comptes")
            .update({ solde: (user.solde ?? 0) + amount })
            .eq("user_id", userId);
        } else {
          await supabase.from("nexora_transfert_comptes")
            .insert({ user_id: userId, solde: amount });
        }

      } else if (paymentType === "depot_epargne") {
        // Créditer l'épargne
        const planEpargne = metadata?.plan_epargne ?? "libre";
        await supabase.from("nexora_epargne").insert({
          user_id:     userId,
          moneroo_id:  paymentId,
          type:        "depot",
          montant:     amount,
          plan:        planEpargne,
          status:      "completed",
        });
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── PAIEMENT ÉCHOUÉ
    if (event === "payment.failed") {
      const paymentId = data?.id;
      await supabase.from("nexora_transactions")
        .update({ status: "failed" })
        .eq("moneroo_id", paymentId);

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // ── PAYOUT COMPLÉTÉ
    if (event === "payout.completed" || event === "payout.success") {
      const payoutId   = data?.id;
      const metadata   = data?.metadata ?? {};
      const userId     = metadata?.user_id;
      const payoutType = metadata?.payout_type;
      const amount     = data?.amount;

      await supabase.from("nexora_payouts")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("moneroo_id", payoutId);

      // Déduire du solde selon le type
      if (payoutType === "retrait_transfert") {
        const { data: compte } = await supabase
          .from("nexora_transfert_comptes")
          .select("solde")
          .eq("user_id", userId)
          .single();

        if (compte) {
          await supabase.from("nexora_transfert_comptes")
            .update({ solde: Math.max(0, (compte.solde ?? 0) - amount) })
            .eq("user_id", userId);
        }
      }

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // ── PAYOUT ÉCHOUÉ
    if (event === "payout.failed") {
      const payoutId = data?.id;
      await supabase.from("nexora_payouts")
        .update({ status: "failed" })
        .eq("moneroo_id", payoutId);

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // Événement non géré
    return new Response(JSON.stringify({ received: true, note: "event_ignored" }), { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Webhook error" }), { status: 500 });
  }
});
