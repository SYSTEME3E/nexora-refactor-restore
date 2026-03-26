import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getNexoraUser } from "@/lib/nexora-auth";
import { supabase } from "@/integrations/supabase/client";
import KkiapayPayment from "@/components/KkiapayPayment";
import {
  Crown, Check, X, Zap, ShieldCheck, Star, Sparkles,
  TrendingUp, Store, PiggyBank, ArrowLeftRight, Home,
  BadgeCheck, ChevronDown, ChevronUp, Lock, Wallet
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
      { label: "Visibilité produits",     gratuit: "Normale",         premium: "Prioritaire" },
    ],
  },
  {
    categorie: "Marché Immobilier",
    icon: Home,
    items: [
      { label: "Accès au marché",         gratuit: true,              premium: true },
      { label: "Annonces immobilières",   gratuit: "2 annonces",      premium: "Illimité" },
      { label: "Badge Confiance",         gratuit: false,             premium: true },
    ],
  }
];

export default function AbonnementPage() {
  const user = getNexoraUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openCat, setOpenCat] = useState<string | null>("Finance personnelle");

  const handlePaymentSuccess = async (plan: string) => {
    try {
      const { error } = await supabase
        .from("nexora_users")
        .update({ plan: plan.toLowerCase() })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Félicitations !",
        description: `Vous êtes maintenant membre ${plan}. Redémarrage en cours...`,
      });
      
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Le paiement a réussi mais la mise à jour du profil a échoué. Contactez le support.",
        variant: "destructive"
      });
    }
  };

  const FeatureValue = ({ value }: { value: string | boolean }) => {
    if (typeof value === "boolean") {
      return value ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-400 mx-auto" />;
    }
    return <span className="text-[11px] font-medium">{value}</span>;
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-24 px-4 pt-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Nexora Premium</h1>
          <p className="text-muted-foreground text-sm font-medium">Débloquez la puissance totale de votre gestion.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Plan BOSS */}
          <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-sm hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mensuel</span>
                <p className="text-2xl font-black italic">6.000 FCFA</p>
              </div>
            </div>
            <h2 className="text-xl font-black mb-2 uppercase italic">Plan BOSS</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Idéal pour les particuliers qui veulent une gestion sérieuse.</p>
            
            <KkiapayPayment 
              amount={6000} 
              reason="Abonnement Nexora BOSS" 
              onSuccess={() => handlePaymentSuccess("BOSS")} 
            />
          </div>

          {/* Plan ROI */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-[32px] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-400 text-black text-[9px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-tighter">
              Recommandé
            </div>
            <div className="flex justify-between items-start mb-6">
              <div className="bg-amber-400 p-3 rounded-2xl text-black">
                <Crown className="w-6 h-6" />
              </div>
              <div className="text-right text-white">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mensuel</span>
                <p className="text-2xl font-black italic text-amber-400">12.000 FCFA</p>
              </div>
            </div>
            <h2 className="text-xl font-black mb-2 uppercase italic text-white">Plan ROI</h2>
            <p className="text-xs text-slate-300 mb-6 font-medium">Le contrôle absolu pour les entrepreneurs et investisseurs.</p>
            
            <KkiapayPayment 
              amount={12000} 
              reason="Abonnement Nexora ROI" 
              onSuccess={() => handlePaymentSuccess("ROI")} 
            />
          </div>

        </div>

        {/* Comparatif */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-center text-slate-400 py-4">Comparatif des fonctionnalités</h3>
          {FEATURES_COMPARE.map((cat) => {
            const Icon = cat.icon;
            const isOpen = openCat === cat.categorie;
            return (
              <div key={cat.categorie} className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
                <button onClick={() => setOpenCat(isOpen ? null : cat.categorie)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Icon className="w-4 h-4" /></div>
                  <span className="font-black text-[13px] uppercase flex-1 text-left tracking-tight">{cat.categorie}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                </button>
                {isOpen && (
                  <div className="border-t border-slate-50 bg-slate-50/30">
                    <div className="grid grid-cols-3 gap-2 px-5 py-2 text-[9px] font-black uppercase text-slate-400">
                      <span>Fonction</span>
                      <div className="text-center">Gratuit</div>
                      <div className="text-center text-primary">ROI / BOSS</div>
                    </div>
                    {cat.items.map((item, i) => (
                      <div key={item.label} className={`grid grid-cols-3 gap-2 px-5 py-3 text-xs items-center ${i % 2 === 0 ? "bg-white/50" : ""}`}>
                        <span className="text-slate-600 font-medium">{item.label}</span>
                        <div className="text-center"><FeatureValue value={item.gratuit} /></div>
                        <div className="text-center font-black text-slate-900"><FeatureValue value={item.premium} /></div>
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
