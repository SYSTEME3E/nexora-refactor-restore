import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WEBHOOK_SECRET       = Deno.env.get("GENIUSPAY_WEBHOOK_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
    }
  }

  try {
    const payload  = JSON.parse(rawBody);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const eventType = payload.event ?? eventHdr;
    const data      = payload.data ?? {};

    // ── PAIEMENT RÉUSSI
    if (eventType === "payment.success" || eventType === "payment.completed") {
      const transaction = data.transaction ?? data;
      const reference   = transaction.reference ?? transaction.id;
      const metadata    = transaction.metadata ?? {};
      const userId      = metadata.user_id;
      const paymentType = metadata.payment_type;
      const amountNet   = parseInt(metadata.amount_net ?? "0", 10);

      if (!userId || !paymentType) return new Response("Missing metadata", { status: 400 });

      const { data: existing } = await supabase.from("nexora_transactions").select("status").eq("moneroo_id", reference).maybeSingle();
      if (existing?.status === "completed") return new Response(JSON.stringify({ received: true }), { status: 200 });

      await supabase.from("nexora_transactions").update({ status: "completed", completed_at: new Date().toISOString() }).eq("moneroo_id", reference);

      if (paymentType === "abonnement_premium") {
        const expireAt = new Date();
        expireAt.setMonth(expireAt.getMonth() + 1);
        await supabase.from("nexora_users").update({ plan: "boss", badge_premium: true, premium_since: new Date().toISOString(), premium_expires_at: expireAt.toISOString() }).eq("id", userId);

        // Notification
        await supabase.from("nexora_notifications").insert({ user_id: userId, titre: "Abonnement activé !", message: "Votre plan Premium est maintenant actif pour 30 jours.", type: "success" });

      } else if (paymentType === "recharge_transfert") {
        const { data: compte } = await supabase.from("nexora_transfert_comptes").select("solde").eq("user_id", userId).maybeSingle();
        if (compte) {
          await supabase.from("nexora_transfert_comptes").update({ solde: (compte.solde ?? 0) + amountNet, updated_at: new Date().toISOString() }).eq("user_id", userId);
        } else {
          await supabase.from("nexora_transfert_comptes").insert({ user_id: userId, solde: amountNet });
        }
        await supabase.from("nexora_notifications").insert({ user_id: userId, titre: "Recharge réussie", message: `Votre compte a été rechargé de ${amountNet} FCFA.`, type: "success" });
      }

      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── PAIEMENT ÉCHOUÉ
    if (eventType === "payment.failed" || eventType === "payment.cancelled") {
      const transaction = data.transaction ?? data;
      await supabase.from("nexora_transactions").update({ status: "failed" }).eq("moneroo_id", transaction.reference ?? transaction.id);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // ── RETRAIT COMPLÉTÉ
    if (eventType === "cashout.completed" || eventType === "payout.completed") {
      const payout    = data.payout ?? data;
      const reference = payout.reference ?? payout.id;
      await supabase.from("nexora_payouts").update({ status: "completed", completed_at: new Date().toISOString() }).eq("moneroo_id", reference);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // ── RETRAIT ÉCHOUÉ — rembourser
    if (eventType === "cashout.failed" || eventType === "payout.failed") {
      const payout      = data.payout ?? data;
      const reference   = payout.reference ?? payout.id;
      const metadata    = payout.metadata ?? {};
      const userId      = metadata.user_id;
      const montantBrut = parseInt(metadata.montant_brut ?? "0", 10);

      await supabase.from("nexora_payouts").update({ status: "failed" }).eq("moneroo_id", reference);

      if (metadata.payout_type === "retrait_transfert" && userId && montantBrut > 0) {
        const { data: compte } = await supabase.from("nexora_transfert_comptes").select("solde").eq("user_id", userId).maybeSingle();
        if (compte) {
          await supabase.from("nexora_transfert_comptes").update({ solde: (compte.solde ?? 0) + montantBrut }).eq("user_id", userId);
        }
        await supabase.from("nexora_notifications").insert({ user_id: userId, titre: "Transfert échoué", message: `Le transfert de ${montantBrut} FCFA a échoué. Votre solde a été recrédité.`, type: "warning" });
      }
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ received: true, note: "event_ignored" }), { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Webhook processing error" }), { status: 500 });
  }
});
