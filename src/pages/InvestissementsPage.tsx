import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getNexoraUser } from "@/lib/nexora-auth";
import AppLayout from "@/components/AppLayout";
import {
  PiggyBank, ArrowUpRight, ArrowDownLeft, History,
  TrendingUp, Lock, Loader2, Phone, Mail, ShieldAlert,
  Target, Calendar, CheckCircle, AlertTriangle, Sparkles,
  ChevronRight, ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- CONFIGURATION ---
const WHATSAPP_NUMBER = "2290155237685";
const CONTACT_EMAIL = "erickpakpo786@gmail.com";

const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR") + " FCFA";

export default function EpargneNexoraPage() {
  const user = getNexoraUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  // États de contrôle d'accès
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // États des données
  const [solde, setSolde] = useState(0);
  const [objectif, setObjectif] = useState({ nom: "Mon projet", cible: 100000, echeance: "2026-06-25" });
  const [showGoalModal, setShowGoalModal] = useState(false);

  useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    try {
      // Épargne is always accessible
      setIsAuthorized(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingAccess(false);
    }
  };

  if (checkingAccess) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="mt-4 text-muted-foreground font-medium">Vérification de sécurité...</p>
        </div>
      </AppLayout>
    );
  }

  // --- VUE : ACCÈS REFUSÉ (SERVICE CLIENT) ---
  if (!isAuthorized) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-10 p-8 bg-card border-2 border-border rounded-[40px] text-center shadow-xl">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-black text-foreground mb-4">Service d'Épargne Restreint</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            L'accès au système d'épargne intelligent est désactivé par défaut pour votre sécurité. 
            Une activation manuelle est requise pour garantir la protection de vos fonds.
          </p>

          <div className="space-y-3 mb-8">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white rounded-2xl font-black hover:opacity-90 transition-all">
              <Phone className="w-5 h-5" /> Contacter par WhatsApp
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all">
              <Mail className="w-5 h-5" /> Envoyer un Email
            </a>
          </div>

          <div className="p-4 bg-muted/50 rounded-2xl text-left space-y-3 border border-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pourquoi ce blocage ?</p>
            <div className="flex gap-3 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p><strong>Sécurité renforcée :</strong> Protection contre les accès non autorisés à votre capital.</p>
            </div>
            <div className="flex gap-3 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p><strong>Contrat physique :</strong> Vous devez signer un engagement de discipline financière.</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // --- VUE : INTERFACE ÉPARGNE (SI AUTORISÉ) ---
  const progression = Math.min(100, (solde / objectif.cible) * 100);
  const restant = Math.max(0, objectif.cible - solde);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-10">
        
        {/* Header Dynamique */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[32px] p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold opacity-70 uppercase tracking-tighter mb-1">Solde Épargné</p>
            <h1 className="text-5xl font-black mb-6">{fmt(solde)}</h1>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 bg-white text-emerald-700 py-4 rounded-2xl font-black text-sm">
                <ArrowUpRight className="w-4 h-4" /> Déposer
              </button>
              <button className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md text-white py-4 rounded-2xl font-black text-sm">
                <ArrowDownLeft className="w-4 h-4" /> Retirer
              </button>
            </div>
          </div>
        </div>

        {/* SYSTÈME D'OBJECTIF INTELLIGENT */}
        <div className="bg-card border-2 border-border rounded-[32px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-foreground">Objectif en cours</h3>
                <p className="text-xs text-muted-foreground">{objectif.nom}</p>
              </div>
            </div>
            <button className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">Modifier</button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase">Progression</p>
                <p className="text-2xl font-black text-emerald-600">{progression.toFixed(1)}%</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase">Cible</p>
                <p className="font-bold">{fmt(objectif.cible)}</p>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="h-4 bg-muted rounded-full overflow-hidden border border-border">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
                style={{ width: `${progression}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-muted/40 rounded-2xl border border-border">
                <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase">Il vous reste</p>
                <p className="font-black text-foreground">{fmt(restant)}</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-2xl border border-border">
                <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase">Échéance</p>
                <p className="font-black text-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(objectif.echeance).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historique Rapide */}
        <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-500" /> Activités récentes
                </h3>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="p-8 text-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">Aucun dépôt pour le moment</p>
                </div>
            </div>
        </div>

      </div>
    </AppLayout>
  );
}
