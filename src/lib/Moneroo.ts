// src/lib/moneroo.ts
// ─────────────────────────────────────────────────────────────────
// Client Moneroo pour le frontend React
// Appelle les Supabase Edge Functions (jamais l'API Moneroo directement)
// ─────────────────────────────────────────────────────────────────

import { supabase } from "@/integrations/supabase/client";
import { getNexoraUser } from "@/lib/nexora-auth";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type PaymentType =
  | "abonnement_premium"
  | "recharge_transfert"
  | "depot_epargne";

export type PayoutType =
  | "retrait_epargne"
  | "retrait_transfert"
  | "retrait_boutique";

export interface InitPaymentParams {
  type: PaymentType;
  amount: number;           // En FCFA
  currency?: string;
  methods?: string[];       // Codes Moneroo ex: ["mtn_bj", "moov_bj"]
  metadata?: Record<string, string>;
}

export interface InitPayoutParams {
  type: PayoutType;
  amount: number;
  pays: string;
  reseau: string;           // Nom du réseau ex: "MTN MoMo" ou code "mtn_bj"
  numero_mobile: string;   // Ex: "+229 97 00 11 22"
  nom_beneficiaire: string;
  metadata?: Record<string, string>;
}

export interface MonerooResult {
  success: boolean;
  error?: string;
  checkout_url?: string;   // Pour les paiements → redirection
  payment_id?: string;
  payout_id?: string;
  message?: string;
}

// ─────────────────────────────────────────────
// MAPPING RÉSEAU → CODE MONEROO (frontend)
// Pour affichage et validation côté client
// ─────────────────────────────────────────────

export const RESEAU_CODES: Record<string, string> = {
  // Bénin
  "MTN MoMo":    "mtn_bj",
  "Moov Money":  "moov_bj",
  // Côte d'Ivoire
  "Orange Money CI": "orange_ci",
  "MTN MoMo CI":     "mtn_ci",
  "Wave CI":         "wave_ci",
  "Moov Money CI":   "moov_ci",
  "Djamo CI":        "djamo_ci",
  // Sénégal
  "Orange Money SN": "orange_sn",
  "Wave":            "wave_sn",
  "Free Money":      "freemoney_sn",
  // Togo
  "Flooz":           "moov_tg",
  "T-Money":         "togocel",
  // Cameroun
  "Orange Money CM": "orange_cm",
  "MTN MoMo CM":     "mtn_cm",
  // Mali
  "Orange Money":    "orange_ml",
  // Ghana
  "Vodafone Cash":   "vodafone_gh",
  "AirtelTigo":      "tigo_gh",
  "MTN MoMo GH":     "mtn_gh",
  // Kenya
  "M-Pesa":          "mpesa_ke",
  // Nigeria
  "MTN MoMo NG":     "mtn_ng",
  "Airtel Money NG": "airtel_ng",
  // Tanzanie
  "M-Pesa TZ":       "mpesa_tz",
  "Tigo Pesa":       "tigo_tz",
  "Airtel TZ":       "airtel_tz",
  // Rwanda
  "MTN MoMo RW":     "mtn_rw",
  "Airtel RW":       "airtel_rw",
  // Uganda
  "MTN MoMo UG":     "mtn_ug",
  "Airtel UG":       "airtel_ug",
  // Zambie
  "MTN MoMo ZM":     "mtn_zm",
  "Airtel ZM":       "airtel_zm",
  "Zamtel Money":    "zamtel_zm",
  // Test
  "Test":            "moneroo_payout_demo",
};

// ─────────────────────────────────────────────
// INITIALISER UN PAIEMENT (recharge, abonnement, dépôt)
// ─────────────────────────────────────────────

export async function initPayment(params: InitPaymentParams): Promise<MonerooResult> {
  const user = getNexoraUser();
  if (!user) return { success: false, error: "Utilisateur non connecté" };

  try {
    const { data, error } = await supabase.functions.invoke("moneroo-payment", {
      body: {
        type:        params.type,
        amount:      params.amount,
        currency:    params.currency ?? "XOF",
        user_id:     user.id,
        user_email:  user.email ?? "",
        user_first_name: user.nom_prenom?.split(" ")[0] ?? "Client",
        user_last_name:  user.nom_prenom?.split(" ").slice(1).join(" ") ?? "NEXORA",
        methods:     params.methods,
        metadata:    params.metadata ?? {},
      },
    });

    if (error) throw error;
    if (!data?.success) return { success: false, error: data?.error ?? "Erreur paiement" };

    return {
      success:      true,
      checkout_url: data.checkout_url,
      payment_id:   data.payment_id,
    };
  } catch (err: any) {
    console.error("initPayment error:", err);
    return { success: false, error: err.message ?? "Erreur réseau" };
  }
}

// ─────────────────────────────────────────────
// INITIER UN RETRAIT (payout)
// ─────────────────────────────────────────────

export async function initPayout(params: InitPayoutParams): Promise<MonerooResult> {
  const user = getNexoraUser();
  if (!user) return { success: false, error: "Utilisateur non connecté" };

  // Séparer nom/prénom depuis nom_beneficiaire
  const parts = params.nom_beneficiaire.trim().split(" ");
  const firstName = parts[0] ?? "Client";
  const lastName  = parts.slice(1).join(" ") || "NEXORA";

  try {
    const { data, error } = await supabase.functions.invoke("moneroo-payout", {
      body: {
        type:            params.type,
        amount:          params.amount,
        user_id:         user.id,
        user_email:      user.email ?? "",
        user_first_name: firstName,
        user_last_name:  lastName,
        pays:            params.pays,
        reseau:          params.reseau,
        numero_mobile:   params.numero_mobile.replace(/[\s\-()]/g, ""),
        metadata:        params.metadata ?? {},
      },
    });

    if (error) throw error;
    if (!data?.success) return { success: false, error: data?.error ?? "Erreur retrait" };

    return {
      success:   true,
      payout_id: data.payout_id,
      message:   data.message,
    };
  } catch (err: any) {
    console.error("initPayout error:", err);
    return { success: false, error: err.message ?? "Erreur réseau" };
  }
}

// ─────────────────────────────────────────────
// REDIRIGER VERS MONEROO CHECKOUT
// ─────────────────────────────────────────────

export function redirectToCheckout(checkout_url: string): void {
  window.location.href = checkout_url;
}

// ─────────────────────────────────────────────
// PAIEMENT COMPLET (init + redirect en une fonction)
// ─────────────────────────────────────────────

export async function payAndRedirect(params: InitPaymentParams): Promise<void> {
  const result = await initPayment(params);
  if (result.success && result.checkout_url) {
    redirectToCheckout(result.checkout_url);
  } else {
    throw new Error(result.error ?? "Impossible d'initialiser le paiement");
  }
}

// ─────────────────────────────────────────────
// VÉRIFIER UN PAIEMENT APRÈS RETOUR
// Appelé sur la page /payment/callback
// ─────────────────────────────────────────────

export async function verifyPaymentFromCallback(): Promise<{
  status: string;
  paymentId: string | null;
  type: string | null;
}> {
  const params    = new URLSearchParams(window.location.search);
  const paymentId = params.get("paymentId");
  const status    = params.get("paymentStatus") ?? params.get("status") ?? "unknown";
  const type      = params.get("type");

  return { status, paymentId, type };
}
