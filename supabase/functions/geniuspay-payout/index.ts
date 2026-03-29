import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYOUT_API           = "https://pay.genius.ci/api/v1/merchant/payouts";
const PAYOUT_BEARER        = Deno.env.get("GENIUSPAY_PAYOUT_BEARER") ?? "";
const PAYOUT_WALLET_ID     = Deno.env.get("GENIUSPAY_PAYOUT_WALLET_ID") ?? "";
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEAU_TO_PROVIDER: Record<string, string> = {
  "wave": "wave", "orange_money": "orange_money", "mtn_money": "mtn", "mtn": "mtn",
  "moov_money": "moov", "moov": "moov", "Wave": "wave", "Wave CI": "wave",
  "Orange Money": "orange_money", "Orange Money CI": "orange_money", "Orange Money SN": "orange_money",
  "MTN MoMo": "mtn", "MTN MoMo CI": "mtn", "Moov Money": "moov", "Moov Money CI": "moov",
  "Free Money": "orange_money", "Flooz": "moov", "T-Money": "mtn", "Airtel Money": "mtn",
};

type PayoutType = "retrait_epargne" | "retrait_transfert" | "retrait_boutique";

interface PayoutRequest {
  type: PayoutType;
  amount: number;
  amount_net: number;
  frais: number;
  currency?: string;
  user_id: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  pays: string;
  reseau: string;
  numero_mobile: string;
  metadata?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: PayoutRequest = await req.json();

    if (!body.type || !body.amount || !body.user_id || !body.reseau || !body.numero_mobile) {
      return new Response(
        JSON.stringify({ success: false, error: "Champs obligatoires manquants" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.amount < 100) {
      return new Response(
        JSON.stringify({ success: false, error: "Montant minimum de retrait : 100 FCFA" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!PAYOUT_BEARER) {
      return new Response(
        JSON.stringify({ success: false, error: "Configuration API manquante" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const provider = RESEAU_TO_PROVIDER[body.reseau];
    if (!provider) {
      return new Response(
        JSON.stringify({ success: false, error: `Réseau non supporté : ${body.reseau}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let phone = body.numero_mobile.replace(/[\s\-()+]/g, "");
    if (!phone.startsWith("+")) phone = "+" + phone;

    const descriptions: Record<PayoutType, string> = {
      retrait_epargne:   `Retrait Épargne NEXORA — ${body.amount} FCFA`,
      retrait_transfert: `Transfert NEXORA → ${body.pays} — ${body.amount} FCFA`,
      retrait_boutique:  `Retrait Boutique NEXORA — ${body.amount} FCFA`,
    };

    const payoutPayload = {
      wallet_id: PAYOUT_WALLET_ID,
      recipient: {
        name:  `${body.user_first_name} ${body.user_last_name}`.trim(),
        phone, email: body.user_email,
      },
      destination: { type: "mobile_money", provider, account: phone },
      amount:      body.amount_net,
      currency:    body.currency ?? "XOF",
      description: descriptions[body.type],
      metadata: {
        user_id: body.user_id, payout_type: body.type,
        montant_brut: String(body.amount), frais_nexora: String(body.frais),
        pays: body.pays, ...body.metadata,
      },
      idempotency_key: `payout-${body.user_id}-${Date.now()}`,
    };

    const payoutRes = await fetch(PAYOUT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", "Accept": "application/json",
        "Authorization": `Bearer ${PAYOUT_BEARER}`,
      },
      body: JSON.stringify(payoutPayload),
    });

    const payoutData = await payoutRes.json();

    if (!payoutRes.ok || !payoutData.success) {
      console.error("GeniusPay payout error:", JSON.stringify(payoutData));
      return new Response(
        JSON.stringify({ success: false, error: payoutData.message ?? "Erreur lors du payout" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payoutResult = payoutData.data?.payout ?? payoutData.data;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    await supabase.from("nexora_payouts").insert({
      user_id: body.user_id, moneroo_id: payoutResult.reference ?? payoutResult.id,
      type: body.type, amount: body.amount, amount_net: body.amount_net,
      frais: body.frais, currency: body.currency ?? "XOF",
      status: payoutResult.status ?? "pending", pays: body.pays,
      reseau: body.reseau, moneroo_code: provider, numero: phone,
      nom_beneficiaire: `${body.user_first_name} ${body.user_last_name}`.trim(),
      metadata: body.metadata ?? {},
    });

    return new Response(
      JSON.stringify({
        success: true, payout_id: payoutResult.reference ?? payoutResult.id,
        message: `Transfert de ${body.amount_net} FCFA initié vers ${body.pays}. Traitement en cours...`,
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
