// supabase/functions/moneroo-payment/index.ts
// ─────────────────────────────────────────────────────────────────
// Edge Function : Initialiser un paiement Moneroo
// Utilisé pour : Abonnement Premium, Recharge Transfert, Dépôt Épargne
// ─────────────────────────────────────────────────────────────────
// Deploy : supabase functions deploy moneroo-payment
// Env vars à configurer dans Supabase Dashboard > Settings > Edge Functions :
//   MONEROO_SECRET_KEY=your_secret_key
//   APP_URL=https://votre-app.vercel.app
// ─────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MONEROO_API = "https://api.moneroo.io/v1/payments/initialize";
const MONEROO_SECRET_KEY = Deno.env.get("MONEROO_SECRET_KEY") ?? "";
const APP_URL = Deno.env.get("APP_URL") ?? "http://localhost:5173";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Types de paiement supportés
type PaymentType =
  | "abonnement_premium"   // Achat abonnement Premium 12$/mois
  | "recharge_transfert"   // Recharge compte NEXORA TRANSFERT
  | "depot_epargne";       // Dépôt épargne NEXORA

interface PaymentRequest {
  type: PaymentType;
  amount: number;           // En XOF (FCFA)
  currency?: string;        // Défaut: XOF
  user_id: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_phone?: string;
  // Métadonnées spécifiques selon le type
  metadata?: Record<string, string>;
  // Méthodes de paiement autorisées (optionnel)
  methods?: string[];
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
        JSON.stringify({ error: "Champs obligatoires manquants" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Montant minimum
    if (body.amount < 100) {
      return new Response(
        JSON.stringify({ error: "Montant minimum : 100 FCFA" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Construction de la description selon le type
    const descriptions: Record<PaymentType, string> = {
      abonnement_premium: "Abonnement NEXORA Premium - 12$/mois",
      recharge_transfert: `Recharge NEXORA Transfert - ${body.amount} FCFA`,
      depot_epargne:      `Dépôt Épargne NEXORA - ${body.amount} FCFA`,
    };

    // ── URL de retour après paiement
    const returnUrls: Record<PaymentType, string> = {
      abonnement_premium: `${APP_URL}/payment/callback?type=abonnement`,
      recharge_transfert: `${APP_URL}/payment/callback?type=transfert`,
      depot_epargne:      `${APP_URL}/payment/callback?type=epargne`,
    };

    // ── Payload pour Moneroo
    const monerooPayload = {
      amount:      body.amount,
      currency:    body.currency ?? "XOF",
      description: descriptions[body.type],
      return_url:  returnUrls[body.type],
      customer: {
        email:      body.user_email,
        first_name: body.user_first_name || "Client",
        last_name:  body.user_last_name  || "NEXORA",
        phone:      body.user_phone,
      },
      metadata: {
        user_id:      body.user_id,
        payment_type: body.type,
        ...body.metadata,
      },
      // Si des méthodes sont spécifiées (ex: ["mtn_bj", "moov_bj"])
      ...(body.methods && body.methods.length > 0 ? { methods: body.methods } : {}),
    };

    // ── Appel à l'API Moneroo
    const monerooRes = await fetch(MONEROO_API, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Accept":        "application/json",
        "Authorization": `Bearer ${MONEROO_SECRET_KEY}`,
      },
      body: JSON.stringify(monerooPayload),
    });

    const monerooData = await monerooRes.json();

    if (!monerooRes.ok || !monerooData.data?.checkout_url) {
      console.error("Moneroo error:", monerooData);
      return new Response(
        JSON.stringify({ error: monerooData.message ?? "Erreur Moneroo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Sauvegarder la transaction en attente dans Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    await supabase.from("nexora_transactions").insert({
      user_id:        body.user_id,
      moneroo_id:     monerooData.data.id,
      type:           body.type,
      amount:         body.amount,
      currency:       body.currency ?? "XOF",
      status:         "pending",
      checkout_url:   monerooData.data.checkout_url,
      metadata:       body.metadata ?? {},
    });

    // ── Retourner l'URL de checkout au frontend
    return new Response(
      JSON.stringify({
        success:      true,
        checkout_url: monerooData.data.checkout_url,
        payment_id:   monerooData.data.id,
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
