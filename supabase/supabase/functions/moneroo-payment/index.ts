// supabase/supabase/functions/moneroo-payment/index.ts
// ─────────────────────────────────────────────────────────────────
// Edge Function : Initialiser un paiement GeniusPay
// Utilisé pour : Abonnement Premium, Recharge Transfert, Dépôt Épargne
// ─────────────────────────────────────────────────────────────────
// Deploy : supabase functions deploy moneroo-payment
// Env vars à configurer dans Supabase Dashboard > Settings > Edge Functions :
//   GENIUSPAY_API_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxx
//   GENIUSPAY_API_SECRET=sk_live_xxxxxxxxxxxxxxxxxxxxxxxx
//   APP_URL=https://votre-app.vercel.app
// ─────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GENIUSPAY_API       = "https://pay.geniuspay.io/api/v1/merchant/payments";
const GENIUSPAY_API_KEY   = Deno.env.get("GENIUSPAY_API_KEY") ?? "";
const GENIUSPAY_API_SECRET = Deno.env.get("GENIUSPAY_API_SECRET") ?? "";
const APP_URL             = Deno.env.get("APP_URL") ?? "http://localhost:5173";
const SUPABASE_URL        = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Types de paiement supportés
type PaymentType =
  | "abonnement_premium"   // Achat abonnement Premium
  | "recharge_transfert"   // Recharge compte NEXORA TRANSFERT
  | "depot_epargne";       // Dépôt épargne NEXORA

interface PaymentRequest {
  type: PaymentType;
  amount: number;           // Montant total (montant_net + 100 FCFA frais) en XOF
  amount_net: number;       // Montant net sans les frais
  currency?: string;
  payment_method?: string;  // "wave" | "orange_money" | "mtn_money" | "moov_money"
  user_id: string;
  user_email: string;
  user_name: string;
  user_phone?: string;
  metadata?: Record<string, string>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: PaymentRequest = await req.json();

    // ── Validation des champs obligatoires
    if (!body.type || !body.amount || !body.user_id || !body.user_email) {
      return new Response(
        JSON.stringify({ success: false, error: "Champs obligatoires manquants" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Montant minimum (100 FCFA net + 100 FCFA frais = 200 minimum)
    if (body.amount < 200) {
      return new Response(
        JSON.stringify({ success: false, error: "Montant minimum : 100 FCFA" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Vérification des clés API
    if (!GENIUSPAY_API_KEY || !GENIUSPAY_API_SECRET) {
      console.error("GENIUSPAY_API_KEY ou GENIUSPAY_API_SECRET manquant");
      return new Response(
        JSON.stringify({ success: false, error: "Configuration API manquante" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Description selon le type
    const descriptions: Record<PaymentType, string> = {
      abonnement_premium: "Abonnement NEXORA Premium",
      recharge_transfert: `Recharge NEXORA Transfert — ${body.amount_net ?? body.amount - 100} FCFA`,
      depot_epargne:      `Dépôt Épargne NEXORA — ${body.amount_net ?? body.amount - 100} FCFA`,
    };

    // ── URL de retour après paiement (success & error séparés)
    const successUrls: Record<PaymentType, string> = {
      abonnement_premium: `${APP_URL}/payment/callback?type=abonnement&status=success`,
      recharge_transfert: `${APP_URL}/payment/callback?type=transfert&status=success`,
      depot_epargne:      `${APP_URL}/payment/callback?type=epargne&status=success`,
    };
    const errorUrls: Record<PaymentType, string> = {
      abonnement_premium: `${APP_URL}/payment/callback?type=abonnement&status=failed`,
      recharge_transfert: `${APP_URL}/payment/callback?type=transfert&status=failed`,
      depot_epargne:      `${APP_URL}/payment/callback?type=epargne&status=failed`,
    };

    // ── Payload GeniusPay
    const geniusPayload: Record<string, unknown> = {
      amount:      body.amount,           // Montant total incluant les 100 FCFA de frais NEXORA
      currency:    body.currency ?? "XOF",
      description: descriptions[body.type],
      success_url: successUrls[body.type],
      error_url:   errorUrls[body.type],
      customer: {
        name:  body.user_name  || "Client NEXORA",
        email: body.user_email,
        phone: body.user_phone ?? "",
      },
      metadata: {
        user_id:      body.user_id,
        payment_type: body.type,
        amount_net:   String(body.amount_net ?? body.amount - 100),
        frais_nexora: "100",
        ...body.metadata,
      },
    };

    // ── Ajouter la méthode de paiement si spécifiée
    if (body.payment_method) {
      geniusPayload.payment_method = body.payment_method;
    }

    // ── Appel API GeniusPay
    const gpRes = await fetch(GENIUSPAY_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept":        "application/json",
        "X-API-Key":     GENIUSPAY_API_KEY,
        "X-API-Secret":  GENIUSPAY_API_SECRET,
      },
      body: JSON.stringify(geniusPayload),
    });

    const gpData = await gpRes.json();

    // ── Vérification réponse GeniusPay
    if (!gpRes.ok || !gpData.success || !gpData.data?.payment_url) {
      console.error("GeniusPay payment error:", JSON.stringify(gpData));
      return new Response(
        JSON.stringify({
          success: false,
          error: gpData.error?.message ?? gpData.message ?? "Erreur GeniusPay — paiement non initialisé",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transaction = gpData.data;

    // ── Sauvegarder la transaction dans Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error: dbError } = await supabase.from("nexora_transactions").insert({
      user_id:      body.user_id,
      moneroo_id:   transaction.reference,    // On réutilise le champ moneroo_id pour stocker la référence
      type:         body.type,
      amount:       body.amount_net ?? body.amount - 100,  // On stocke le montant net (sans les frais)
      frais:        100,                       // 100 FCFA de frais NEXORA
      currency:     body.currency ?? "XOF",
      status:       "pending",
      checkout_url: transaction.payment_url,
      metadata:     { ...body.metadata, geniuspay_id: String(transaction.id) },
    });

    if (dbError) {
      // On logue l'erreur mais on ne bloque pas le paiement
      console.error("Supabase insert error:", dbError.message);
    }

    // ── Retourner l'URL de paiement au frontend
    return new Response(
      JSON.stringify({
        success:     true,
        payment_url: transaction.payment_url,
        payment_id:  transaction.reference,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Erreur serveur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
