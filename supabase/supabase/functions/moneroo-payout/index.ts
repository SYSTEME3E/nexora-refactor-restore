// supabase/supabase/functions/moneroo-payout/index.ts
// ─────────────────────────────────────────────────────────────────
// Edge Function : Initier un retrait/transfert via pay.genius.ci
// Utilisé pour : Retrait Transfert, Retrait Épargne, Retrait Boutique
// ─────────────────────────────────────────────────────────────────
// Deploy : supabase functions deploy moneroo-payout
// Env vars à configurer dans Supabase Dashboard > Settings > Edge Functions :
//   GENIUSPAY_PAYOUT_BEARER=YOUR_MERCHANT_API_KEY  (clé Bearer de pay.genius.ci)
//   GENIUSPAY_PAYOUT_WALLET_ID=your-wallet-uuid    (UUID du wallet payout)
// ─────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYOUT_API          = "https://pay.genius.ci/api/v1/merchant/payouts";
const PAYOUT_BEARER       = Deno.env.get("GENIUSPAY_PAYOUT_BEARER") ?? "";
const PAYOUT_WALLET_ID    = Deno.env.get("GENIUSPAY_PAYOUT_WALLET_ID") ?? "";
const SUPABASE_URL        = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Mapping réseau affiché → provider pay.genius.ci
// Providers supportés : wave, orange_money, mtn, moov
const RESEAU_TO_PROVIDER: Record<string, string> = {
  // Codes directs
  "wave":         "wave",
  "orange_money": "orange_money",
  "mtn_money":    "mtn",
  "mtn":          "mtn",
  "moov_money":   "moov",
  "moov":         "moov",
  // Noms affichés utilisateur
  "Wave":         "wave",
  "Wave CI":      "wave",
  "Orange Money": "orange_money",
  "Orange Money CI": "orange_money",
  "Orange Money SN": "orange_money",
  "MTN MoMo":     "mtn",
  "MTN MoMo CI":  "mtn",
  "Moov Money":   "moov",
  "Moov Money CI":"moov",
  "Free Money":   "orange_money",
  "Flooz":        "moov",
  "T-Money":      "mtn",
  "Airtel Money": "mtn",
};

type PayoutType = "retrait_epargne" | "retrait_transfert" | "retrait_boutique";

interface PayoutRequest {
  type: PayoutType;
  amount: number;           // Montant brut demandé par l'utilisateur
  amount_net: number;       // Montant net après déduction des 3% de frais
  frais: number;            // 3% du montant brut
  currency?: string;
  user_id: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  pays: string;
  reseau: string;           // Nom ou code du réseau
  numero_mobile: string;    // Numéro nettoyé (chiffres uniquement ou avec +)
  metadata?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: PayoutRequest = await req.json();

    // ── Validation des champs obligatoires
    if (!body.type || !body.amount || !body.user_id || !body.reseau || !body.numero_mobile) {
      return new Response(
        JSON.stringify({ success: false, error: "Champs obligatoires manquants" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Montant minimum
    if (body.amount < 100) {
      return new Response(
        JSON.stringify({ success: false, error: "Montant minimum de retrait : 100 FCFA" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Vérification de la clé Bearer
    if (!PAYOUT_BEARER) {
      console.error("GENIUSPAY_PAYOUT_BEARER manquant");
      return new Response(
        JSON.stringify({ success: false, error: "Configuration API manquante" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Résoudre le provider pay.genius.ci
    const provider = RESEAU_TO_PROVIDER[body.reseau] ?? null;
    if (!provider) {
      return new Response(
        JSON.stringify({ success: false, error: `Réseau non supporté : ${body.reseau}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Nettoyer le numéro de téléphone (format E.164 : +22997001122)
    let phone = body.numero_mobile.replace(/[\s\-()+]/g, "");
    // Si le numéro ne commence pas par +, on le garde tel quel
    // pay.genius.ci attend le format avec le + selon la doc
    if (!phone.startsWith("+")) {
      phone = "+" + phone;
    }

    // ── Clé d'idempotence unique pour éviter les doubles payouts
    const idempotencyKey = `payout-${body.user_id}-${Date.now()}`;

    // ── Description selon le type
    const descriptions: Record<PayoutType, string> = {
      retrait_epargne:  `Retrait Épargne NEXORA — ${body.amount} FCFA`,
      retrait_transfert:`Transfert NEXORA → ${body.pays} — ${body.amount} FCFA`,
      retrait_boutique: `Retrait Boutique NEXORA — ${body.amount} FCFA`,
    };

    // ── Payload pay.genius.ci (format de la doc officielle)
    const payoutPayload = {
      wallet_id:  PAYOUT_WALLET_ID,
      recipient: {
        name:  `${body.user_first_name} ${body.user_last_name}`.trim(),
        phone: phone,
        email: body.user_email,
      },
      destination: {
        type:     "mobile_money",
        provider: provider,
        account:  phone,
      },
      amount:          body.amount_net,   // On envoie le montant NET (après les 3% de frais NEXORA)
      currency:        body.currency ?? "XOF",
      description:     descriptions[body.type],
      metadata: {
        user_id:      body.user_id,
        payout_type:  body.type,
        montant_brut: String(body.amount),
        frais_nexora: String(body.frais),
        pays:         body.pays,
        ...body.metadata,
      },
      idempotency_key: idempotencyKey,
    };

    // ── Appel API pay.genius.ci
    const payoutRes = await fetch(PAYOUT_API, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Accept":        "application/json",
        "Authorization": `Bearer ${PAYOUT_BEARER}`,
      },
      body: JSON.stringify(payoutPayload),
    });

    const payoutData = await payoutRes.json();

    // ── Vérification réponse
    if (!payoutRes.ok || !payoutData.success) {
      console.error("pay.genius.ci payout error:", JSON.stringify(payoutData));
      return new Response(
        JSON.stringify({
          success: false,
          error: payoutData.message ?? payoutData.error ?? "Erreur lors du payout — vérifiez le solde du wallet",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payoutResult = payoutData.data?.payout ?? payoutData.data;

    // ── Sauvegarder dans Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error: dbError } = await supabase.from("nexora_payouts").insert({
      user_id:         body.user_id,
      moneroo_id:      payoutResult.reference ?? payoutResult.id,  // Référence pay.genius.ci
      type:            body.type,
      amount:          body.amount,          // Montant brut débité du compte utilisateur
      amount_net:      body.amount_net,      // Montant envoyé au destinataire
      frais:           body.frais,           // Frais NEXORA (3%)
      currency:        body.currency ?? "XOF",
      status:          payoutResult.status ?? "pending",
      pays:            body.pays,
      reseau:          body.reseau,
      moneroo_code:    provider,
      numero:          phone,
      nom_beneficiaire:`${body.user_first_name} ${body.user_last_name}`.trim(),
      metadata:        body.metadata ?? {},
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError.message);
    }

    return new Response(
      JSON.stringify({
        success:   true,
        payout_id: payoutResult.reference ?? payoutResult.id,
        message:   `Transfert de ${body.amount_net} FCFA initié vers ${body.pays}. Traitement en cours...`,
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
