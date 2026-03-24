import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getNexoraUser, type NexoraPlan } from "@/lib/nexora-auth";
import {
  Crown, Check, X, Zap, ShieldCheck, Star, Sparkles,
  TrendingUp, Store, PiggyBank, ArrowLeftRight, Home,
  Receipt, HandCoins, Lock, Link2, Image, BadgeCheck,
  Infinity, ChevronDown, ChevronUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// DONNÉES
// ─────────────────────────────────────────────

const FEATURES_COMPARE = [
  {
    categorie: "Finance personnelle",
    icon: TrendingUp,
    items: [
      { label: "Entrées & Dépenses",     gratuit: "5 / mois",       premium: "Illimité" },
      { label: "Historique financier",   gratuit: "7 jours",        premium: "Illimité" },
      { label: "Factures",               gratuit: "10 factures",    premium: "Illimité" },
      { label: "Prêts & Dettes",         gratuit: "2 prêts",        premium: "Illimité" },
      { label: "Investissements",        gratuit: "Basique",        premium: "Avancé" },
    ],
  },
  {
    categorie: "Épargne NEXORA",
    icon: PiggyBank,
    items: [
      { label: "Accès à l'épargne",      gratuit: true,             premium: true },
      { label: "Épargne Libre",          gratuit: true,             premium: true },
      { label: "Plans bloqués (6m-3ans)", gratuit: false,            premium: true },
      { label: "Retraits Mobile Money",  gratuit: false,            premium: true },
      { label: "Historique épargne",     gratuit: false,            premium: true },
    ],
  },
  {
    categorie: "Nexora Shop",
    icon: Store,
    items: [
      { label: "Accès boutique",         gratuit: true,             premium: true },
      { label: "Produits physiques",     gratuit: "5 produits",     premium: "Illimité" },
      { label: "Produits digitaux",      gratuit: false,            premium: true },
      { label: "Gestion commandes",      gratuit: false,            premium: true },
      { label: "Finances & Retraits",    gratuit: false,            premium: true },
      { label: "Facebook Pixel",         gratuit: false,            premium: true },
      { label: "Domaine personnalisé",   gratuit: false,            premium: true },
    ],
  },
  {
    categorie: "Nexora Transfert",
    icon: ArrowLeftRight,
    items: [
      { label: "Transfert inter-pays",   gratuit: false,            premium: true },
      { label: "24 pays africains",      gratuit: false,            premium: true },
      { label: "Tous réseaux Mobile Money", gratuit: false,         premium: true },
      { label: "Recharge sans frais",    gratuit: false,            premium: true },
      { label: "Factures PDF",           gratuit: false,            premium: true },
    ],
  },
  {
    categorie: "Marché Immobilier",
    icon: Home,
    items: [
      { label: "Consulter les annonces", gratuit: false,            premium: true },
      { label: "Publier une annonce",    gratuit: false,            premium: true },
      { label: "Profil vendeur",         gratuit: false,            premium: true },
    ],
  },
  {
    categorie: "Outils & Sécurité",
    icon: Lock,
    items: [
      { label: "Coffre-fort",            gratuit: "Limité",         premium: "Illimité" },
      { label: "Liens & Contacts",       gratuit: "10 liens",       premium: "Illimité" },
      { label: "Badge vérifié",          gratuit: false,            premium: true },
      { label: "Support prioritaire",    gratuit: false,            premium: true },
      { label: "Accès anticipé nouveautés", gratuit: false,         premium: true },
    ],
  },
];

// ─────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true)  return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs font-semibold text-foreground">{value}</span>;
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function AbonnementPage() {
  const navigate    = useNavigate();
  const user        = getNexoraUser();
  const currentPlan = user?.plan || "gratuit";
  const isPremium   = currentPlan !== "gratuit";

  const [openCat, setOpenCat] = useState<string | null>("Finance personnelle");

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-20">

        {/* ── HERO ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 p-8 text-white text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-violet-500/15 -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-indigo-500/20 translate-y-1/3 -translate-x-1/4 blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Plans & Abonnements
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-3">
              Débloquez tout<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">NEXORA</span>
            </h1>
            <p className="text-white/60 text-sm max-w-sm mx-auto">
              Un seul plan Premium. Accès illimité à toutes les fonctionnalités sans exception.
            </p>
          </div>
        </div>

        {/* ── CARTES PLANS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* GRATUIT */}
          <div className={`relative bg-card border-2 rounded-3xl p-6 flex flex-col transition-all ${currentPlan === "gratuit" ? "border-border" : "border-border"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Gratuit</h3>
                <p className="text-xs text-muted-foreground">Pour découvrir NEXORA</p>
              </div>
              {currentPlan === "gratuit" && (
                <span className="ml-auto text-xs font-black px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  Plan actuel
                </span>
              )}
            </div>

            <div className="mb-5">
              <span className="text-4xl font-black text-foreground">0</span>
              <span className="text-sm text-muted-foreground ml-1">FCFA / mois</span>
            </div>

            <div className="space-y-2.5 flex-1">
              {[
                "5 entrées & dépenses / mois",
                "10 factures maximum",
                "2 prêts & dettes",
                "5 produits boutique",
                "Épargne Libre basique",
                "Coffre-fort limité",
                "10 liens & contacts",
              ].map(f => (
                <div key={f} className="flex items-start gap-2.5 text-sm">
                  <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{f}</span>
                </div>
              ))}
              {[
                "Nexora Transfert",
                "Marché Immobilier",
                "Plans épargne bloqués",
                "Boutique digitale",
              ].map(f => (
                <div key={f} className="flex items-start gap-2.5 text-sm opacity-40">
                  <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-2.5 h-2.5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground line-through">{f}</span>
                </div>
              ))}
            </div>

            <button disabled
              className="w-full mt-6 py-3 bg-muted text-muted-foreground font-bold rounded-2xl cursor-default text-sm">
              {currentPlan === "gratuit" ? "Votre plan actuel" : "Plan de base"}
            </button>
          </div>

          {/* PREMIUM */}
          <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 rounded-3xl p-6 flex flex-col overflow-hidden shadow-2xl shadow-violet-900/30">
            {/* Déco */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-violet-400/15 -translate-y-1/3 translate-x-1/3 blur-2xl pointer-events-none" />

            {/* Badge populaire */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-black px-4 py-1.5 rounded-b-2xl shadow-lg">
                <Star className="w-3 h-3" /> RECOMMANDÉ
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4 mt-3 relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Premium</h3>
                <p className="text-xs text-white/50">Accès illimité complet</p>
              </div>
              {isPremium && (
                <span className="ml-auto text-xs font-black px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                  Plan actuel
                </span>
              )}
            </div>

            <div className="mb-5 relative">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-white">12</span>
                <div className="mb-1.5">
                  <span className="text-lg font-bold text-white">$</span>
                  <span className="text-sm text-white/50 ml-1">/ mois</span>
                </div>
              </div>
              <p className="text-xs text-white/40 mt-1">≈ 7 440 FCFA · 1$ = 620 FCFA</p>
            </div>

            <div className="space-y-2.5 flex-1 relative">
              {[
                { label: "Tout illimité sans restriction",  hot: true  },
                { label: "Nexora Transfert (24 pays)",      hot: true  },
                { label: "Marché Immobilier complet",       hot: false },
                { label: "Boutique physique & digitale",    hot: false },
                { label: "Plans épargne 6m / 1an / 2ans / 3ans", hot: false },
                { label: "Retraits Mobile Money épargne",   hot: false },
                { label: "Finances & retraits boutique",    hot: false },
                { label: "Factures PDF illimitées",         hot: false },
                { label: "Badge vérifié ✓",                 hot: false },
                { label: "Support prioritaire",             hot: false },
                { label: "Accès anticipé nouveautés",       hot: false },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2.5 text-sm">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${f.hot ? "bg-yellow-400/30" : "bg-white/10"}`}>
                    <Check className={`w-2.5 h-2.5 ${f.hot ? "text-yellow-300" : "text-white/70"}`} />
                  </div>
                  <span className={`${f.hot ? "text-white font-semibold" : "text-white/70"}`}>{f.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { if (!isPremium) { /* TODO: API paiement */ navigate("/dashboard"); } }}
              disabled={isPremium}
              className={`w-full mt-6 py-4 font-black rounded-2xl transition-all text-sm relative flex items-center justify-center gap-2 ${
                isPremium
                  ? "bg-white/10 text-white/50 cursor-default border border-white/10"
                  : "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-300 hover:to-orange-300 shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-95"
              }`}>
              {isPremium
                ? <><BadgeCheck className="w-4 h-4" /> Votre plan actuel</>
                : <><Zap className="w-4 h-4" /> Passer à Premium — 12$/mois</>}
            </button>
          </div>
        </div>

        {/* ── INFO PAIEMENT ── */}
        <div className="flex items-center gap-3 p-4 bg-muted/60 border border-border rounded-2xl text-xs text-muted-foreground">
          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          </div>
          <p>Paiement sécurisé via Mobile Money. Annulation possible à tout moment. Le plan est activé instantanément après confirmation du paiement.</p>
        </div>

        {/* ── COMPARAISON DÉTAILLÉE ── */}
        <div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-foreground">Comparaison détaillée</h2>
            <p className="text-xs text-muted-foreground mt-1">Tout ce qui est inclus dans chaque plan</p>
          </div>

          {/* En-tête tableau */}
          <div className="grid grid-cols-3 gap-3 mb-3 px-4">
            <div className="col-span-1" />
            <div className="text-center">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">Gratuit</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-violet-500 uppercase tracking-wider flex items-center justify-center gap-1">
                <Crown className="w-3 h-3" /> Premium
              </p>
            </div>
          </div>

          {/* Catégories accordéon */}
          <div className="space-y-2">
            {FEATURES_COMPARE.map(cat => {
              const Icon = cat.icon;
              const isOpen = openCat === cat.categorie;
              return (
                <div key={cat.categorie} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenCat(isOpen ? null : cat.categorie)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <span className="font-black text-sm text-foreground flex-1 text-left">{cat.categorie}</span>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border">
                      {cat.items.map((item, i) => (
                        <div key={item.label}
                          className={`grid grid-cols-3 gap-3 px-4 py-3 items-center ${i % 2 === 0 ? "bg-muted/20" : ""}`}>
                          <span className="text-xs text-muted-foreground col-span-1">{item.label}</span>
                          <div className="text-center">
                            <FeatureValue value={item.gratuit} />
                          </div>
                          <div className="text-center">
                            <FeatureValue value={item.premium} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="space-y-3">
          <h2 className="text-xl font-black text-foreground text-center">Questions fréquentes</h2>
          {[
            {
              q: "Comment payer l'abonnement Premium ?",
              r: "Le paiement se fait via Mobile Money (MTN MoMo, Moov Money, Wave, Orange Money, etc.). L'activation est immédiate après confirmation."
            },
            {
              q: "Puis-je annuler à tout moment ?",
              r: "Oui, vous pouvez annuler votre abonnement à tout moment. Vous gardez l'accès Premium jusqu'à la fin de la période payée."
            },
            {
              q: "L'épargne est-elle vraiment gratuite ?",
              r: "L'épargne Libre est accessible gratuitement. Les plans bloqués (6 mois, 1 an, 2 ans, 3 ans) et les retraits Mobile Money nécessitent le plan Premium."
            },
            {
              q: "La boutique est-elle incluse dans le gratuit ?",
              r: "Oui, vous pouvez créer une boutique et ajouter jusqu'à 5 produits gratuitement. Pour les produits digitaux, les commandes illimitées et les retraits, le plan Premium est nécessaire."
            },
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} reponse={faq.r} />
          ))}
        </div>

        {/* ── CTA BAS ── */}
        {!isPremium && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-violet-950 p-8 text-center text-white">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-violet-500/20 -translate-y-1/2 blur-2xl" />
            </div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/30">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2">Prêt à passer Premium ?</h3>
              <p className="text-white/50 text-sm mb-6">Accès illimité à tout NEXORA pour seulement 12$/mois</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 text-sm">
                <Zap className="w-4 h-4" /> Commencer maintenant — 12$/mois
              </button>
              <p className="text-white/30 text-xs mt-3">Sans engagement · Annulez à tout moment</p>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}

// ─────────────────────────────────────────────
// FAQ ITEM
// ─────────────────────────────────────────────

function FAQItem({ question, reponse }: { question: string; reponse: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors">
        <span className="font-semibold text-sm text-foreground">{question}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed pt-3">{reponse}</p>
        </div>
      )}
    </div>
  );
}
