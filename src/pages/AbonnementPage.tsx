import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getNexoraUser } from "@/lib/nexora-auth";
import { payAndRedirect } from "@/lib/Moneroo";
import {
  Crown, Check, X, Zap, ShieldCheck, Star, Sparkles,
  TrendingUp, Store, PiggyBank, ArrowLeftRight, Home,
  BadgeCheck, ChevronDown, ChevronUp, Lock, Wallet
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// DONNÉES DE COMPARAISON
// ─────────────────────────────────────────────

const FEATURES_COMPARE = [
  {
    categorie: "Finance personnelle",
    icon: TrendingUp,
    items: [
      { label: "Entrées & Dépenses",     gratuit: "10 / mois",       premium: "Illimité" },
      { label: "Historique financier",   gratuit: "7 jours",        premium: "Illimité" },
      { label: "Factures",                gratuit: "10 factures",    premium: "Illimité" },
      { label: "Prêts & Dettes",          gratuit: "10 prêts",        premium: "Illimité" },
    ],
  },
  {
    categorie: "Nexora Shop (Boutique)",
    icon: Store,
    items: [
      { label: "Accès boutique",          gratuit: true,              premium: true },
      { label: "Produits physiques",      gratuit: "5 produits",      premium: "Illimité" },
      { label: "Produits digitaux",       gratuit: "2 produits",      premium: "Illimité" },
      { label: "Gestion commandes",       gratuit: true,              premium: true },
      { label: "Facebook Pixel",          gratuit: false,             premium: true },
      { label: "Domaine personnalisé",    gratuit: false,             premium: true },
    ],
  },
  {
    categorie: "Nexora Transfert",
    icon: ArrowLeftRight,
    items: [
      { label: "Transfert inter-pays",   gratuit: false,             premium: true },
      { label: "24 pays africains",      gratuit: false,             premium: true },
      { label: "Tous réseaux Mobile Money", gratuit: false,          premium: true },
    ],
  },
];

// ─────────────────────────────────────────────
// COMPOSANTS INTERNES
// ─────────────────────────────────────────────

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true)  return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs font-semibold text-foreground">{value}</span>;
}

function FAQItem({ question, reponse }: { question: string; reponse: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-3">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors">
        <span className="font-semibold text-sm text-foreground">{question}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-border pt-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{reponse}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────

export default function AbonnementPage() {
  const navigate    = useNavigate();
  const user        = getNexoraUser();
  const currentPlan = user?.plan || "gratuit";
  const isPremium   = currentPlan !== "gratuit";
  const [openCat, setOpenCat] = useState<string | null>("Nexora Shop (Boutique)");

  const handleUpgrade = async () => {
    try {
      await payAndRedirect({
        type: "abonnement_premium",
        amount: 3100, // 5$ en FCFA (Taux ~620)
      });
    } catch (error) {
      console.error("Erreur d'initialisation du paiement:", error);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-20">

        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 p-8 text-white text-center shadow-2xl">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Nexora Premium
            </div>
            <h1 className="text-4xl font-black mb-3">Libérez tout votre potentiel</h1>
            <p className="text-white/60 text-sm max-w-sm mx-auto">
              Débloquez le transfert international et gérez votre boutique sans aucune limite.
            </p>
          </div>
        </div>

        {/* CARTES DE PRIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-card border-2 border-border rounded-3xl p-6 flex flex-col opacity-80">
            <h3 className="text-lg font-black mb-1 text-foreground">Gratuit</h3>
            <p className="text-xs text-muted-foreground mb-4">Essentiels inclus</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-foreground">0</span>
              <span className="text-sm text-muted-foreground ml-1">FCFA / mois</span>
            </div>
            <button disabled className="w-full py-3 bg-muted text-muted-foreground font-bold rounded-xl text-sm mb-4">
              {currentPlan === "gratuit" ? "Plan actuel" : "Inclus"}
            </button>
          </div>

          <div className="relative bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 flex flex-col shadow-xl border-2 border-indigo-500/30">
            <div className="absolute top-4 right-4 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-md">PROMO</div>
            <h3 className="text-lg font-black text-white mb-1">Premium</h3>
            <p className="text-xs text-white/50 mb-4">Puissance illimitée</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">5</span>
              <span className="text-sm text-white/50 ml-1">$ / mois</span>
              <p className="text-[10px] text-white/30 mt-1">≈ 3 100 FCFA via Mobile Money</p>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={isPremium}
              className={`w-full py-4 font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                isPremium 
                ? "bg-white/10 text-white/40 cursor-default" 
                : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:scale-[1.02] shadow-lg shadow-orange-500/20"
              }`}
            >
              {isPremium ? <><BadgeCheck className="w-4 h-4" /> Plan Actif</> : <><Zap className="w-4 h-4" /> Devenir Premium</>}
            </button>
          </div>
        </div>

        {/* COMPARAISON */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-center">Détails des avantages</h2>
          {FEATURES_COMPARE.map(cat => {
            const Icon = cat.icon;
            const isOpen = openCat === cat.categorie;
            return (
              <div key={cat.categorie} className="bg-card border border-border rounded-2xl overflow-hidden">
                <button onClick={() => setOpenCat(isOpen ? null : cat.categorie)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors">
                  <Icon className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-sm flex-1 text-left">{cat.categorie}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isOpen && (
                  <div className="border-t border-border bg-muted/10">
                    {cat.items.map((item, i) => (
                      <div key={item.label} className={`grid grid-cols-3 gap-2 px-5 py-3 text-xs items-center ${i % 2 === 0 ? "bg-muted/20" : ""}`}>
                        <span className="text-muted-foreground">{item.label}</span>
                        <div className="text-center"><FeatureValue value={item.gratuit} /></div>
                        <div className="text-center font-bold text-indigo-600"><FeatureValue value={item.premium} /></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
