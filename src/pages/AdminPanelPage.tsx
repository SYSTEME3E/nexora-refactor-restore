import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Crown, ShieldCheck, Ban, Activity, BarChart3,
  Store, RefreshCw, Search, ChevronDown, ChevronUp,
  CheckCircle, XCircle, AlertTriangle,
  Trash2, Menu, X, ArrowLeft,
  UserCheck, UserX, Clock, Calendar, DollarSign,
  Unlock, BadgeCheck, Bell,
  Package, ShoppingCart, AlertOctagon, Gift, Megaphone, Receipt, Percent
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────
interface NexoraUser {
  id: string;
  nom_prenom: string;
  username: string;
  email: string;
  avatar_url: string | null;
  is_admin: boolean;
  plan: string;
  badge_premium: boolean;
  status: string;
  created_at: string;
  premium_since: string | null;
  premium_expires_at: string | null;
}

interface Boutique {
  id: string;
  nom: string;
  actif: boolean;
  user_id: string;
  created_at: string;
}

interface EpargneAccount {
  id: string;
  user_id: string;
  status: string;
  solde: number;
  created_at: string;
  nexora_users?: { nom_prenom: string; email: string };
}

interface Retrait {
  id: string;
  user_id: string;
  montant: number;
  statut: string;
  created_at: string;
  nexora_users?: { nom_prenom: string; email: string };
}

type AdminTab = "stats" | "users" | "boutiques" | "epargne" | "marketing" | "logs";

// ── Helpers ────────────────────────────────────────────────
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDatetime = (d: string | null) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtMoney = (n: number) => `${(n || 0).toLocaleString("fr-FR")} FCFA`;

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  gratuit: { label: "Gratuit", color: "text-gray-600", bg: "bg-gray-100" },
  boss: { label: "Boss", color: "text-blue-700", bg: "bg-blue-100" },
  roi: { label: "Roi", color: "text-violet-700", bg: "bg-violet-100" },
  admin: { label: "Admin", color: "text-amber-700", bg: "bg-amber-100" },
};

const ADMIN_CODE = "ERIC";

export default function AdminPanelPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // ── Auth & UI State
  const [codeInput, setCodeInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tab, setTab] = useState<AdminTab>("stats");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Data State
  const [users, setUsers] = useState<NexoraUser[]>([]);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [demandesActivation, setDemandesActivation] = useState<EpargneAccount[]>([]);
  const [retraits, setRetraits] = useState<Retrait[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, premiumUsers: 0, totalCA: 0 });

  // ── Auth Logic
  useEffect(() => {
    if (sessionStorage.getItem("nexora_admin_auth") === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    if (codeInput.trim().toUpperCase() === ADMIN_CODE) {
      sessionStorage.setItem("nexora_admin_auth", "true");
      setIsAuthenticated(true);
    } else {
      toast({ title: "Code incorrect", variant: "destructive" });
    }
  };

  // ── Data Loading
  const loadAll = async () => {
    setLoading(true);
    try {
      const [uRes, bRes] = await Promise.all([
        supabase.from("nexora_users").select("*").order("created_at", { ascending: false }),
        supabase.from("boutiques").select("*"),
      ]);

      setUsers((uRes.data || []) as any);
      setBoutiques(bRes.data || []);
      setDemandesActivation([]);
      setRetraits([]);
      
      setStats({
        totalUsers: uRes.data?.length || 0,
        premiumUsers: uRes.data?.filter(x => x.plan !== "gratuit").length || 0,
        totalCA: 0 // À calculer selon tes tables de commandes
      });
    } catch (err) {
      toast({ title: "Erreur de chargement", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { if (isAuthenticated) loadAll(); }, [isAuthenticated]);

  // ── Actions Épargne
  const handleApproveAccount = async (id: string, userId: string) => {
    toast({ title: "Fonctionnalité en cours de développement" });
  };

  const handleApproveRetrait = async (retrait: Retrait) => {
    toast({ title: "Fonctionnalité en cours de développement" });
  };

  const sendNotification = async (userId: string, titre: string, message: string, type = "info") => {
    await supabase.from("nexora_notifications").insert({ user_id: userId, titre, message, type });
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setLoading(true);
    const { data: all } = await supabase.from("nexora_users").select("id");
    if (all) {
      const notes = all.map(u => ({ user_id: u.id, titre: "Annonce Nexora", message: broadcastMessage }));
      await supabase.from("nexora_notifications").insert(notes);
      toast({ title: "Message envoyé à tous" });
      setBroadcastMessage("");
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
            <h1 className="text-xl font-black">Accès Restreint</h1>
          </div>
          <Input type="password" value={codeInput} onChange={e => setCodeInput(e.target.value)} placeholder="Code Admin" className="text-center font-bold" />
          <Button onClick={handleLogin} className="w-full bg-amber-500 hover:bg-amber-600 font-bold">Entrer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}><Menu /></Button>
          <span className="font-black text-lg">Nexora Admin</span>
        </div>
        <Button onClick={loadAll} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Sidebar Mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex">
          <div className="w-72 bg-white h-full p-5 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <span className="font-black">Menu</span>
              <X onClick={() => setMenuOpen(false)} />
            </div>
            {[
              { id: "stats", label: "Dashboard", icon: BarChart3 },
              { id: "users", label: "Utilisateurs", icon: Users },
              { id: "epargne", label: "Épargne & Retraits", icon: DollarSign },
              { id: "marketing", label: "Marketing", icon: Megaphone },
            ].map(item => (
              <button key={item.id} onClick={() => { setTab(item.id as AdminTab); setMenuOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold ${tab === item.id ? "bg-primary text-white" : "text-slate-600"}`}>
                <item.icon className="w-5 h-5" /> {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="p-4 max-w-4xl mx-auto pb-20">
        
        {/* --- TAB STATS --- */}
        {tab === "stats" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <Users className="text-blue-500 mb-2" />
              <div className="text-2xl font-black">{stats.totalUsers}</div>
              <div className="text-xs text-slate-500 font-bold uppercase">Utilisateurs</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <Crown className="text-amber-500 mb-2" />
              <div className="text-2xl font-black">{stats.premiumUsers}</div>
              <div className="text-xs text-slate-500 font-bold uppercase">Membres Premium</div>
            </div>
          </div>
        )}

        {/* --- TAB EPARGNE (Validation + Retraits) --- */}
        {tab === "epargne" && (
          <div className="space-y-8">
            {/* Section 1: Validation Comptes */}
            <section className="space-y-4">
              <h2 className="font-black flex items-center gap-2 text-amber-600 uppercase text-xs tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Activations en attente ({demandesActivation.length})
              </h2>
              {demandesActivation.map(acc => (
                <div key={acc.id} className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm">
                  <div>
                    <div className="font-bold text-sm">{acc.nexora_users?.nom_prenom}</div>
                    <div className="text-xs text-slate-500 italic">Demande d'ouverture de livret</div>
                  </div>
                  <Button size="sm" onClick={() => handleApproveAccount(acc.id, acc.user_id)} className="bg-green-600 hover:bg-green-700 font-bold text-xs h-8">
                    Approuver
                  </Button>
                </div>
              ))}
              {demandesActivation.length === 0 && <p className="text-center text-xs text-slate-400 py-4">Aucune demande d'activation.</p>}
            </section>

            {/* Section 2: Retraits avec 10% */}
            <section className="space-y-4">
              <h2 className="font-black flex items-center gap-2 text-primary uppercase text-xs tracking-widest">
                <DollarSign className="w-4 h-4" /> Demandes de Retraits (Pénalité 10%)
              </h2>
              {retraits.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-3xl border shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-400">CLIENT</span>
                      <div className="font-black">{r.nexora_users?.nom_prenom}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400">BRUT</span>
                      <div className="font-black text-slate-900">{fmtMoney(r.montant)}</div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-xl flex justify-between items-center border border-red-100">
                    <span className="text-xs font-bold text-red-600">Pénalité de retrait (10%)</span>
                    <span className="font-bold text-red-600">-{fmtMoney(r.montant * 0.1)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase">Net à transférer</div>
                      <div className="text-xl font-black text-green-600">{fmtMoney(r.montant * 0.9)}</div>
                    </div>
                    {r.statut === "en_attente" && (
                      <Button onClick={() => handleApproveRetrait(r)} className="bg-slate-900 text-white font-black px-6">
                        Valider le virement
                      </Button>
                    )}
                    {r.statut === "valide" && (
                      <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                        <CheckCircle className="w-4 h-4" /> Payé
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* --- TAB MARKETING --- */}
        {tab === "marketing" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
              <h3 className="font-black flex items-center gap-2"><Megaphone /> Broadcast Général</h3>
              <textarea
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Écrivez votre message à tous les utilisateurs..."
              />
              <Button onClick={handleBroadcast} disabled={loading || !broadcastMessage} className="w-full h-12 rounded-xl font-bold">
                Diffuser le message
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
