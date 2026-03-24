#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# NEXORA — Script de création des Edge Functions Moneroo
# Exécuter à la racine du projet : bash setup-moneroo.sh
# ═══════════════════════════════════════════════════════════════

echo "🚀 Création des Edge Functions Moneroo pour NEXORA..."

# ── Créer les dossiers
mkdir -p supabase/functions/moneroo-payment
mkdir -p supabase/functions/moneroo-payout
mkdir -p supabase/functions/moneroo-webhook

echo "✅ Dossiers créés"

# ════════════════════════════════════════════════════════════════
# EDGE FUNCTION 1 : moneroo-payment (Paiements entrants)
# ════════════════════════════════════════════════════════════════
cat > supabase/functions/moneroo-payment/index.ts << 'PAYMENT_EOF'
// supabase/functions/moneroo-payment/index.ts
// Initialiser un paiement Moneroo (abonnement, recharge transfert, dépôt épargne)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MONEROO_API          = "https://api.moneroo.io/v1/payments/initialize";
const MONEROO_SECRET_KEY   = Deno.env.get("MONEROO_SECRET_KEY") ?? "";
const APP_URL              = Deno.env.get("APP_URL") ?? "http://localhost:5173";
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PaymentType = "abonnement_premium" | "recharge_transfert" | "depot_epargne";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const body = await req.json();

    // ── Validation
    if (!body.type || !body.amount || !body.user_id || !body.user_email) {
      return new Response(
        JSON.stringify({ error: "Champs obligatoires manquants" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }
    if (body.amount < 100) {
      return new Response(
        JSON.stringify({ error: "Montant minimum : 100 FCFA" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const descriptions: Record<PaymentType, string> = {
      abonnement_premium: "Abonnement NEXORA Premium — 12$/mois",
      recharge_transfert: `Recharge NEXORA Transfert — ${body.amount} FCFA`,
      depot_epargne:      `Dépôt Épargne NEXORA — ${body.amount} FCFA`,
    };

    const returnUrls: Record<PaymentType, string> = {
      abonnement_premium: `${APP_URL}/payment/callback?type=abonnement`,
      recharge_transfert: `${APP_URL}/payment/callback?type=transfert`,
      depot_epargne:      `${APP_URL}/payment/callback?type=epargne`,
    };

    const payload = {
      amount:      body.amount,
      currency:    body.currency ?? "XOF",
      description: descriptions[body.type as PaymentType],
      return_url:  returnUrls[body.type as PaymentType],
      customer: {
        email:      body.user_email,
        first_name: body.user_first_name || "Client",
        last_name:  body.user_last_name  || "NEXORA",
        ...(body.user_phone ? { phone: body.user_phone } : {}),
      },
      metadata: {
        user_id:      body.user_id,
        payment_type: body.type,
        ...(body.metadata ?? {}),
      },
      ...(body.methods?.length ? { methods: body.methods } : {}),
    };

    // ── Appel Moneroo
    const res  = await fetch(MONEROO_API, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Accept":        "application/json",
        "Authorization": `Bearer ${MONEROO_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok || !data.data?.checkout_url) {
      console.error("Moneroo error:", data);
      return new Response(
        JSON.stringify({ error: data.message ?? "Erreur Moneroo" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // ── Sauvegarder en base
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    await sb.from("nexora_transactions").insert({
      user_id:      body.user_id,
      moneroo_id:   data.data.id,
      type:         body.type,
      amount:       body.amount,
      currency:     body.currency ?? "XOF",
      status:       "pending",
      checkout_url: data.data.checkout_url,
      metadata:     body.metadata ?? {},
    });

    return new Response(
      JSON.stringify({
        success:      true,
        checkout_url: data.data.checkout_url,
        payment_id:   data.data.id,
      }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
PAYMENT_EOF

echo "✅ moneroo-payment/index.ts créé"

# ════════════════════════════════════════════════════════════════
# EDGE FUNCTION 2 : moneroo-payout (Retraits)
# ════════════════════════════════════════════════════════════════
cat > supabase/functions/moneroo-payout/index.ts << 'PAYOUT_EOF'
// supabase/functions/moneroo-payout/index.ts
// Initier un retrait Moneroo (épargne, transfert, boutique digitale)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MONEROO_PAYOUT_API   = "https://api.moneroo.io/v1/payouts/initialize";
const MONEROO_SECRET_KEY   = Deno.env.get("MONEROO_SECRET_KEY") ?? "";
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapping réseau → code Moneroo (doc officielle)
const RESEAU_CODE: Record<string, string> = {
  // Bénin
  "mtn_bj": "mtn_bj", "MTN MoMo": "mtn_bj",
  "moov_bj": "moov_bj", "Moov Money": "moov_bj",
  // Côte d'Ivoire
  "orange_ci": "orange_ci", "Orange Money": "orange_ci",
  "mtn_ci": "mtn_ci", "wave_ci": "wave_ci", "Wave": "wave_ci",
  "moov_ci": "moov_ci", "djamo_ci": "djamo_ci",
  // Sénégal
  "orange_sn": "orange_sn", "wave_sn": "wave_sn",
  "freemoney_sn": "freemoney_sn", "Free Money": "freemoney_sn",
  "e_money_sn": "e_money_sn", "djamo_sn": "djamo_sn",
  // Mali
  "orange_ml": "orange_ml",
  // Togo
  "moov_tg": "moov_tg", "Flooz": "moov_tg",
  "togocel": "togocel", "T-Money": "togocel",
  // Cameroun
  "mtn_cm": "mtn_cm", "orange_cm": "orange_cm",
  "eu_mobile_cm": "eu_mobile_cm",
  // Ghana
  "mtn_gh": "mtn_gh", "vodafone_gh": "vodafone_gh",
  "Vodafone Cash": "vodafone_gh",
  "tigo_gh": "tigo_gh", "AirtelTigo": "tigo_gh",
  // Nigeria
  "mtn_ng": "mtn_ng", "airtel_ng": "airtel_ng",
  // Kenya
  "mpesa_ke": "mpesa_ke", "M-Pesa": "mpesa_ke",
  // Tanzanie
  "mpesa_tz": "mpesa_tz", "tigo_tz": "tigo_tz",
  "Tigo Pesa": "tigo_tz", "airtel_tz": "airtel_tz",
  // Rwanda
  "mtn_rw": "mtn_rw", "airtel_rw": "airtel_rw",
  // Uganda
  "mtn_ug": "mtn_ug", "airtel_ug": "airtel_ug",
  // Zambie
  "mtn_zm": "mtn_zm", "airtel_zm": "airtel_zm",
  "zamtel_zm": "zamtel_zm", "Zamtel Money": "zamtel_zm",
  // Malawi
  "airtel_mw": "airtel_mw", "tnm_mw": "tnm_mw",
  // Congo/RDC
  "airtel_cd": "airtel_cd", "vodacom_cd": "vodacom_cd",
  "orange_cd": "orange_cd",
  // Test
  "test": "moneroo_payout_demo",
};

const PAYS_CURRENCY: Record<string, string> = {
  "Bénin": "XOF", "Togo": "XOF", "Côte d'Ivoire": "XOF",
  "Sénégal": "XOF", "Mali": "XOF", "Burkina Faso": "XOF",
  "Niger": "XOF", "Guinée": "GNF", "Cameroun": "XAF",
  "RD Congo": "CDF", "Gabon": "XAF", "Congo": "XAF",
  "Ghana": "GHS", "Nigéria": "NGN", "Kenya": "KES",
  "Tanzanie": "TZS", "Ouganda": "UGX", "Rwanda": "RWF",
  "Zambie": "ZMW", "Malawi": "MWK",
};

type PayoutType = "retrait_epargne" | "retrait_transfert" | "retrait_boutique";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const body = await req.json();

    if (!body.type || !body.amount || !body.user_id || !body.reseau || !body.numero_mobile) {
      return new Response(
        JSON.stringify({ error: "Champs obligatoires manquants" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }
    if (body.amount < 100) {
      return new Response(
        JSON.stringify({ error: "Montant minimum : 100 FCFA" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const monerooMethod = RESEAU_CODE[body.reseau] ?? null;
    if (!monerooMethod) {
      return new Response(
        JSON.stringify({ error: `Réseau non supporté : ${body.reseau}` }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const currency = body.currency ?? PAYS_CURRENCY[body.pays] ?? "XOF";
    const msisdn   = parseInt(body.numero_mobile.replace(/[\s+\-()]/g, ""), 10);

    if (isNaN(msisdn)) {
      return new Response(
        JSON.stringify({ error: "Numéro de téléphone invalide" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const descriptions: Record<PayoutType, string> = {
      retrait_epargne:   `Retrait Épargne NEXORA — ${body.amount} ${currency}`,
      retrait_transfert: `Retrait NEXORA Transfert — ${body.amount} ${currency}`,
      retrait_boutique:  `Retrait Boutique NEXORA — ${body.amount} ${currency}`,
    };

    const payload = {
      amount:      body.amount,
      currency,
      description: descriptions[body.type as PayoutType],
      method:      monerooMethod,
      customer: {
        email:      body.user_email,
        first_name: body.user_first_name || "Client",
        last_name:  body.user_last_name  || "NEXORA",
      },
      metadata: {
        user_id:     body.user_id,
        payout_type: body.type,
        pays:        body.pays ?? "",
        ...(body.metadata ?? {}),
      },
      recipient: { msisdn },
    };

    const res  = await fetch(MONEROO_PAYOUT_API, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Accept":        "application/json",
        "Authorization": `Bearer ${MONEROO_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error("Moneroo payout error:", data);
      return new Response(
        JSON.stringify({ error: data.message ?? "Erreur payout Moneroo" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // ── Sauvegarder en base
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    await sb.from("nexora_payouts").insert({
      user_id:          body.user_id,
      moneroo_id:       data.data.id,
      type:             body.type,
      amount:           body.amount,
      currency,
      status:           "pending",
      pays:             body.pays ?? "",
      reseau:           body.reseau,
      moneroo_code:     monerooMethod,
      numero:           body.numero_mobile,
      nom_beneficiaire: `${body.user_first_name} ${body.user_last_name}`,
      metadata:         body.metadata ?? {},
    });

    return new Response(
      JSON.stringify({
        success:   true,
        payout_id: data.data.id,
        message:   "Retrait initié. Traitement en cours...",
      }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
PAYOUT_EOF

echo "✅ moneroo-payout/index.ts créé"

# ════════════════════════════════════════════════════════════════
# EDGE FUNCTION 3 : moneroo-webhook (Confirmations automatiques)
# ════════════════════════════════════════════════════════════════
cat > supabase/functions/moneroo-webhook/index.ts << 'WEBHOOK_EOF'
// supabase/functions/moneroo-webhook/index.ts
// Recevoir les webhooks Moneroo et mettre à jour Supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { event, data } = await req.json();
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log("Webhook reçu:", event, data?.id);

    // ── PAIEMENT RÉUSSI
    if (event === "payment.completed" || event === "payment.success") {
      const { id: paymentId, metadata = {}, amount } = data;
      const { user_id, payment_type } = metadata;

      await sb.from("nexora_transactions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("moneroo_id", paymentId);

      if (payment_type === "abonnement_premium" && user_id) {
        const expireAt = new Date();
        expireAt.setMonth(expireAt.getMonth() + 1);
        await sb.from("nexora_users").update({
          plan:           "premium",
          plan_expire_at: expireAt.toISOString(),
          badge_premium:  true,
        }).eq("id", user_id);

      } else if (payment_type === "recharge_transfert" && user_id) {
        const { data: compte } = await sb
          .from("nexora_transfert_comptes")
          .select("solde")
          .eq("user_id", user_id)
          .single();

        if (compte) {
          await sb.from("nexora_transfert_comptes")
            .update({ solde: (compte.solde ?? 0) + amount })
            .eq("user_id", user_id);
        } else {
          await sb.from("nexora_transfert_comptes")
            .insert({ user_id, solde: amount });
        }

      } else if (payment_type === "depot_epargne" && user_id) {
        await sb.from("nexora_epargne").insert({
          user_id,
          moneroo_id: paymentId,
          type:       "depot",
          montant:    amount,
          montant_net:amount,
          plan:       metadata.plan_epargne ?? "libre",
          status:     "completed",
        });
      }

      return new Response(JSON.stringify({ received: true }), { status: 200, headers: cors });
    }

    // ── PAIEMENT ÉCHOUÉ
    if (event === "payment.failed") {
      await sb.from("nexora_transactions")
        .update({ status: "failed" })
        .eq("moneroo_id", data?.id);
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: cors });
    }

    // ── PAYOUT RÉUSSI
    if (event === "payout.completed" || event === "payout.success") {
      const { id: payoutId, metadata = {}, amount } = data;
      const { user_id, payout_type } = metadata;

      await sb.from("nexora_payouts")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("moneroo_id", payoutId);

      if (payout_type === "retrait_transfert" && user_id) {
        const { data: compte } = await sb
          .from("nexora_transfert_comptes")
          .select("solde")
          .eq("user_id", user_id)
          .single();
        if (compte) {
          await sb.from("nexora_transfert_comptes")
            .update({ solde: Math.max(0, (compte.solde ?? 0) - amount) })
            .eq("user_id", user_id);
        }
      }

      return new Response(JSON.stringify({ received: true }), { status: 200, headers: cors });
    }

    // ── PAYOUT ÉCHOUÉ
    if (event === "payout.failed") {
      await sb.from("nexora_payouts")
        .update({ status: "failed" })
        .eq("moneroo_id", data?.id);
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: cors });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: cors });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Webhook error" }), { status: 500 });
  }
});
WEBHOOK_EOF

echo "✅ moneroo-webhook/index.ts créé"

# ════════════════════════════════════════════════════════════════
# RÉSUMÉ
# ════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ TOUT EST CRÉÉ ! Structure :"
echo ""
echo "supabase/"
echo "└── functions/"
echo "    ├── moneroo-payment/index.ts"
echo "    ├── moneroo-payout/index.ts"
echo "    └── moneroo-webhook/index.ts"
echo ""
echo "═══════════════════════════════════════════════════"
echo "📌 PROCHAINES ÉTAPES :"
echo ""
echo "1. Ajouter les variables dans Supabase Dashboard"
echo "   > Settings > Edge Functions > Secrets :"
echo "   MONEROO_SECRET_KEY = ta_clé_moneroo"
echo "   APP_URL = https://ton-app.vercel.app"
echo ""
echo "2. Déployer les fonctions :"
echo "   supabase functions deploy moneroo-payment"
echo "   supabase functions deploy moneroo-payout"
echo "   supabase functions deploy moneroo-webhook"
echo ""
echo "3. Configurer le webhook dans Moneroo Dashboard :"
echo "   https://TON_PROJECT.supabase.co/functions/v1/moneroo-webhook"
echo "═══════════════════════════════════════════════════"
