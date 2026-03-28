// supabase/supabase/functions/moneroo-webhook/index.ts
// Deploy : supabase functions deploy moneroo-webhook
// Env var : GENIUSPAY_WEBHOOK_SECRET=whsec_xxxxxxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WEBHOOK_SECRET       = Deno.env.get("GENIUSPAY_WEBHOOK_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifySignature(rawBody: string, signature: string, timestamp: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const message = encoder.encode(timestamp + "." + rawBody);
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, message);
    const expectedHex = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
    return expectedHex === signature;
  } catch { return false; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const rawBody   = await req.text();
  const signature = req.headers.get("X-Webhook-Signature") ?? "";
  const timestamp = req.headers.get("X-Webhook-Timestamp") ?? "";
  const eventHdr  = req.headers.get("X-Webhook-Event") ?? "";

  if (WEBHOOK_SECRET) {
    const valid = await verifySignature(rawBody, signature, timestamp, WEBHOOK_SECRET);
    if (!valid) {
      console.error("Signature webhook invalide");
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    console.log("Signature valide ✓");
  }

  try {
    const payload  = JSON.parse(rawBody);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const eventType = payload.event ?? eventHdr;
    const data      = payload.data ?? {};
    console.log("Événement:", eventType);

    // ── PAIEMENT RÉUSSI
    if (eventType === "payment.success" || eventType === "payment.completed") {
      const transaction = data.transaction ?? data;
      const reference   = transaction.reference ?? transaction.id;
      const metadata    = transaction.metadata ?? {};
      const userId      = metadata.user_id;
      const paymentType = metadata.payment_type;
      const amountNet   = parseInt(metadata.amount_net ?? transaction.net_amount ?? transaction.amount ?? "0", 10);

      if (!userId || !paymentType) return new Response("Missing metadata", { status: 400 });

      // Idempotence
      const { data: existing } = await supabase.from("nexora_transactions").select("status").eq("moneroo_id", reference).single();
      if (existing?.status === "completed") return new Response(JSON.stringify({ received: true, note: "already_processed" }), { status: 200 });

      await supabase.from("nexora_transactions").update({ status: "completed", completed_at: new Date().toISOString() }).eq("moneroo_id", reference);

      if (paymentType === "abonnement_premium") {
        const expireAt = new Date();
        expireAt.setMonth(expireAt.getMonth() + 1);
        await supabase.from("nexora_users").update({ plan: "premium", plan_expire_at: expireAt.toISOString(), badge_premium: true }).eq("id", userId);

      } else if (paymentType === "recharge_transfert") {
        const { data: compte } = await supabase.from("nexora_transfert_comptes").select("solde").eq("user_id", userId).single();
        if (compte) {
          await supabase.from("nexora_transfert_comptes").update({ solde: (compte.solde ?? 0) + amountNet }).eq("user_id", userId);
        } else {
          await supabase.from("nexora_transfert_comptes").insert({ user_id: userId, solde: amountNet });
        }
        console.log(`Transfert crédité +${amountNet} FCFA pour:`, userId);

      } else if (paymentType === "depot_epargne") {
        await supabase.from("nexora_epargne").insert({ user_id: userId, moneroo_id: reference, type: "depot", montant: amountNet, plan: metadata.plan_epargne ?? "libre", status: "completed" });
      }

      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── PAIEMENT ÉCHOUÉ / ANNULÉ
    if (eventType === "payment.failed" || eventType === "payment.cancelled") {
      const transaction = data.transaction ?? data;
      await supabase.from("nexora_transactions").update({ status: "failed" }).eq("moneroo_id", transaction.reference ?? transaction.id);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // ── RETRAIT COMPLÉTÉ
    if (eventType === "cashout.completed" || eventType === "payout.completed") {
      const payout    = data.payout ?? data;
      const reference = payout.reference ?? payout.id;
      const { data: existingPayout } = await supabase.from("nexora_payouts").select("status").eq("moneroo_id", reference).single();
      if (existingPayout?.status === "completed") return new Response(JSON.stringify({ received: true, note: "already_processed" }), { status: 200 });
      await supabase.from("nexora_payouts").update({ status: "completed", completed_at: new Date().toISOString() }).eq("moneroo_id", reference);
      console.log("Payout complété:", reference);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // ── RETRAIT ÉCHOUÉ — rembourser l'utilisateur
    if (eventType === "cashout.failed" || eventType === "payout.failed") {
      const payout      = data.payout ?? data;
      const reference   = payout.reference ?? payout.id;
      const metadata    = payout.metadata ?? {};
      const userId      = metadata.user_id;
      const payoutType  = metadata.payout_type;
      const montantBrut = parseInt(metadata.montant_brut ?? payout.amount ?? "0", 10);

      await supabase.from("nexora_payouts").update({ status: "failed" }).eq("moneroo_id", reference);

      // Rembourser si retrait_transfert
      if (payoutType === "retrait_transfert" && userId && montantBrut > 0) {
        const { data: compte } = await supabase.from("nexora_transfert_comptes").select("solde").eq("user_id", userId).single();
        if (compte) {
          await supabase.from("nexora_transfert_comptes").update({ solde: (compte.solde ?? 0) + montantBrut }).eq("user_id", userId);
          console.log(`Remboursement +${montantBrut} FCFA pour:`, userId);
        }
      }
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ received: true, note: "event_ignored" }), { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Webhook processing error" }), { status: 500 });
  }
});
