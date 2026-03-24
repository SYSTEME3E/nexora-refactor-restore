// supabase/functions/moneroo-payout/index.ts
// ─────────────────────────────────────────────────────────────────
// Edge Function : Initier un retrait (payout) Moneroo
// Utilisé pour : Retrait Épargne, Retrait Transfert, Retrait Boutique Digitale
// ─────────────────────────────────────────────────────────────────
// Deploy : supabase functions deploy moneroo-payout
// ─────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MONEROO_PAYOUT_API = "https://api.moneroo.io/v1/payouts/initialize";
const MONEROO_SECRET_KEY  = Deno.env.get("MONEROO_SECRET_KEY") ?? "";
const SUPABASE_URL        = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Mapping réseau → code Moneroo
// Basé sur la doc officielle : https://docs.moneroo.io/payouts/available-methods
const RESEAU_TO_MONEROO_CODE: Record<string, string> = {
  // Bénin
  "mtn_bj":    "mtn_bj",
  "moov_bj":   "moov_bj",
  "MTN MoMo":  "mtn_bj",   // Défaut Bénin
  "Moov Money":"moov_bj",
  // Côte d'Ivoire
  "mtn_ci":    "mtn_ci",
  "moov_ci":   "moov_ci",
  "orange_ci": "orange_ci",
  "wave_ci":   "wave_ci",
  "djamo_ci":  "djamo_ci",
  // Sénégal
  "orange_sn":    "orange_sn",
  "wave_sn":      "wave_sn",
  "freemoney_sn": "freemoney_sn",
  "e_money_sn":   "e_money_sn",
  "djamo_sn":     "djamo_sn",
  // Mali
  "orange_ml": "orange_ml",
  // Togo
  "moov_tg":   "moov_tg",
  "togocel":   "togocel",
  "Flooz":     "moov_tg",
  "T-Money":   "togocel",
  // Cameroun
  "mtn_cm":    "mtn_cm",
  "orange_cm": "orange_cm",
  "eu_mobile_cm": "eu_mobile_cm",
  // Ghana
  "mtn_gh":      "mtn_gh",
  "vodafone_gh": "vodafone_gh",
  "tigo_gh":     "tigo_gh",
  // Nigeria
  "mtn_ng":    "mtn_ng",
  "airtel_ng": "airtel_ng",
  // Kenya
  "mpesa_ke":  "mpesa_ke",
  "M-Pesa":    "mpesa_ke",
  // Tanzanie
  "mpesa_tz":  "mpesa_tz",
  "tigo_tz":   "tigo_tz",
  "airtel_tz": "airtel_tz",
  // Uganda
  "mtn_ug":    "mtn_ug",
  "airtel_ug": "airtel_ug",
  // Rwanda
  "mtn_rw":    "mtn_rw",
  "airtel_rw": "airtel_rw",
  // Zambie
  "mtn_zm":    "mtn_zm",
  "airtel_zm": "airtel_zm",
  "zamtel_zm": "zamtel_zm",
  // Malawi
  "airtel_mw": "airtel_mw",
  "tnm_mw":    "tnm_mw",
  // Congo/RDC
  "airtel_cd":   "airtel_cd",
  "vodacom_cd":  "vodacom_cd",
  "orange_cd":   "orange_cd",
  // Test
  "test":        "moneroo_payout_demo",
};

// ── Mapping pays → devise
const PAYS_TO_CURRENCY: Record<string, string> = {
  "Bénin": "XOF", "Togo": "XOF", "Côte d'Ivoire": "XOF",
  "Sénégal": "XOF", "Mali": "XOF", "Burkina Faso": "XOF",
  "Niger": "XOF", "Guinée": "GNF", "Cameroun": "XAF",
  "RD Congo": "CDF", "Gabon": "XAF", "Congo": "XAF",
  "Ghana": "GHS", "Nigéria": "NGN", "Kenya": "KES",
  "Tanzanie": "TZS", "Ouganda": "UGX", "Rwanda": "RWF",
  "Zambie": "ZMW", "Malawi": "MWK",
};

type PayoutType = "retrait_epargne" | "retrait_transfert" | "retrait_boutique";

interface PayoutRequest {
  type: PayoutType;
  amount: number;
  currency?: string;
  user_id: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  // Coordonnées de retrait
  pays: string;
  reseau: string;          // Nom ou code Moneroo du réseau
  numero_mobile: string;   // Numéro international sans +, ex: 22997001122
  // Métadonnées optionnelles
  metadata?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: PayoutRequest = await req.json();

    // ── Validation
    if (!body.type || !body.amount || !body.user_id || !body.reseau || !body.numero_mobile) {
      return new Response(
        JSON.stringify({ error: "Champs obligatoires manquants" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.amount < 100) {
      return new Response(
        JSON.stringify({ error: "Montant minimum de retrait : 100 FCFA" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Résoudre le code Moneroo du réseau
    const monerooMethod = RESEAU_TO_MONEROO_CODE[body.reseau]
      ?? RESEAU_TO_MONEROO_CODE[body.reseau.toLowerCase()]
      ?? null;

    if (!monerooMethod) {
      return new Response(
        JSON.stringify({ error: `Réseau non supporté : ${body.reseau}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Devise
    const currency = body.currency ?? PAYS_TO_CURRENCY[body.pays] ?? "XOF";

    // ── Nettoyer le numéro (enlever +, espaces)
    const msisdn = parseInt(body.numero_mobile.replace(/[\s+\-()]/g, ""), 10);

    if (isNaN(msisdn)) {
      return new Response(
        JSON.stringify({ error: "Numéro de téléphone invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Descriptions
    const descriptions: Record<PayoutType, string> = {
      retrait_epargne:  `Retrait Épargne NEXORA - ${body.amount} ${currency}`,
      retrait_transfert:`Retrait NEXORA Transfert - ${body.amount} ${currency}`,
      retrait_boutique: `Retrait Boutique NEXORA - ${body.amount} ${currency}`,
    };

    // ── Payload Moneroo Payout
    const monerooPayload = {
      amount:      body.amount,
      currency,
      description: descriptions[body.type],
      method:      monerooMethod,
      customer: {
        email:      body.user_email,
        first_name: body.user_first_name || "Client",
        last_name:  body.user_last_name  || "NEXORA",
      },
      metadata: {
        user_id:     body.user_id,
        payout_type: body.type,
        pays:        body.pays,
        ...body.metadata,
      },
      recipient: {
        msisdn,
      },
    };

    // ── Appel API Moneroo Payout
    const monerooRes = await fetch(MONEROO_PAYOUT_API, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Accept":        "application/json",
        "Authorization": `Bearer ${MONEROO_SECRET_KEY}`,
      },
      body: JSON.stringify(monerooPayload),
    });

    const monerooData = await monerooRes.json();

    if (!monerooRes.ok || !monerooData.success) {
      console.error("Moneroo payout error:", monerooData);
      return new Response(
        JSON.stringify({ error: monerooData.message ?? "Erreur lors du payout Moneroo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Sauvegarder dans Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    await supabase.from("nexora_payouts").insert({
      user_id:      body.user_id,
      moneroo_id:   monerooData.data.id,
      type:         body.type,
      amount:       body.amount,
      currency,
      status:       "pending",
      pays:         body.pays,
      reseau:       body.reseau,
      moneroo_code: monerooMethod,
      numero:       body.numero_mobile,
      nom_beneficiaire: `${body.user_first_name} ${body.user_last_name}`,
      metadata:     body.metadata ?? {},
    });

    return new Response(
      JSON.stringify({
        success:    true,
        payout_id:  monerooData.data.id,
        message:    "Retrait initié avec succès. Traitement en cours...",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
