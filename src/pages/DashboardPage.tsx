import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatAmount, convertAmount } from "@/lib/app-utils";
import AppLayout from "@/components/AppLayout";
import {
  TrendingUp, TrendingDown, Clock,
  ArrowUpRight, Store, BadgeCheck, Zap,
  Users, Crown, ShieldCheck, ShoppingBag
} from "lucide-react";
import { Link } from "react-router-dom";
import { getNexoraUser } from "@/lib/nexora-auth";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Bonne nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function VerifiedBadge() {
  return (
    <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: "18px", height: "18px", borderRadius: "999px",
        background: "#3b82f6", flexShrink: 0, border: "2px solid rgba(255,255,255,0.4)",
      }}>
      <BadgeCheck style={{ width: 11, height: 11, color: "#fff" }} />
    </span>
  );
}

export default function DashboardPage() {
  const [devise, setDevise] = useState<"XOF" | "USD">("XOF");
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalEntrees: 0, totalDepenses: 0,
    dernièresDepenses: [] as any[], dernièresEntrees: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  const nexoraUser = getNexoraUser();
  const displayName = nexoraUser?.nom_prenom?.split(" ")[0] || "Eric";
  const hasBadge = nexoraUser?.badge_premium || nexoraUser?.is_admin;

  useEffect(() => {
    loadStats();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const userId = nexoraUser?.id;
    if (!userId) { setLoading(false); return; }
    
    const [depResult, entResult] = await Promise.all([
        supabase.from("depenses" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("entrees" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    const toXOF = (m: number, dev: string) => dev === "USD" ? convertAmount(m, "USD", "XOF") : m;
    const deps = depResult.data || [];
    const ents = entResult.data || [];

    setStats({
      totalEntrees: ents.reduce((s, e) => s + toXOF(Number(e.montant), e.devise), 0),
      totalDepenses: deps.reduce((s, d) => s + toXOF(Number(d.montant), d.devise), 0),
      dernièresDepenses: deps.slice(0, 4),
      dernièresEntrees: ents.slice(0, 4),
    });
    setLoading(false);
  };

  const fmt = (v: number) => formatAmount(devise === "XOF" ? v : convertAmount(v, "XOF", "USD"), devise);
  const solde = stats.totalEntrees - stats.totalDepenses;

  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-4 p-2">

        {/* 1. HEADER LARGE & PRO - #3B82F6 */}
        <div className="relative overflow-hidden rounded-2xl bg-[#3B82F6] text-white shadow-lg p-6">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black">{getGreeting()}, {displayName} ! 👋</h1>
                {hasBadge && <VerifiedBadge />}
              </div>
              <p className="text-white/80 text-sm font-medium opacity-90">Ravi de vous revoir sur votre dashboard.</p>
              <div className="flex items-center gap-2 mt-4 bg-white/10 w-fit px-3 py-1 rounded-full border border-white/20">
                <Clock className="w-4 h-4 text-white" />
                <span className="font-mono font-bold text-xs tracking-widest">
                    {time.toLocaleTimeString("fr-FR")}
                </span>
              </div>
            </div>
            <select
              value={devise}
              onChange={(e) => setDevise(e.target.value as "XOF" | "USD")}
              className="bg-white/20 border border-white/30 text-white rounded-xl p-2 text-xs font-bold"
            >
              <option value="XOF" className="text-black">XOF</option>
              <option value="USD" className="text-black">USD</option>
            </select>
          </div>
          {/* Cercles décoratifs */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* 2. SOLDE NET TOTAL - #16A34A (Vert Profond) */}
        <div className={`rounded-2xl p-5 border-2 ${solde >= 0 ? "bg-[#16A34A] border-[#16A34A]" : "bg-[#EF4444] border-[#EF4444]"} text-white shadow-md`}>
          <p className="text-[10px] uppercase font-black tracking-wider opacity-80 mb-1">Solde Net Global</p>
          <p className="text-3xl font-black font-display">{loading ? "..." : fmt(solde)}</p>
        </div>

        {/* 3. FLUX FINANCIERS - Vert Clair & Rouge Vif */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#22C55E] p-4 rounded-2xl text-white shadow-sm border border-[#22C55E]">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg"><TrendingUp className="w-4 h-4 text-white" /></div>
              <span className="text-[10px] font-bold uppercase">Entrées</span>
            </div>
            <p className="text-xl font-black">{loading ? "..." : fmt(stats.totalEntrees)}</p>
          </div>

          <div className="bg-[#EF4444] p-4 rounded-2xl text-white shadow-sm border border-[#EF4444]">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg"><TrendingDown className="w-4 h-4 text-white" /></div>
              <span className="text-[10px] font-bold uppercase">Dépenses</span>
            </div>
            <p className="text-xl font-black">{loading ? "..." : fmt(stats.totalDepenses)}</p>
          </div>
        </div>

        {/* 4. ACTIONS PRINCIPALES - Grille Pro */}
        <div className="grid grid-cols-2 gap-3">
          {/* Transfert - Bleu Foncé #2563EB */}
          <Link to="/transfert" className="bg-[#2563EB] p-5 rounded-2xl flex flex-col items-center gap-2 text-white shadow-sm">
            <ArrowUpRight className="w-6 h-6" />
            <span className="text-xs font-black">Transfert</span>
          </Link>
          {/* Boutique - Rose Foncé #EC4899 */}
          <Link to="/boutique" className="bg-[#EC4899] p-5 rounded-2xl flex flex-col items-center gap-2 text-white shadow-sm">
            <Store className="w-6 h-6" />
            <span className="text-xs font-black">Boutique</span>
          </Link>
        </div>

        {/* 5. LISTES DE TRANSACTIONS - Fond sombre propre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Section Entrées */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[#22C55E] font-black text-xs uppercase px-2 flex items-center gap-2">
                <TrendingUp className="w-3 h-3"/> Dernières Entrées
            </h3>
            <div className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700/50">
                {stats.dernièresEntrees.map((e, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border-b border-slate-700/30 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-xs">{e.titre}</p>
                                <p className="text-slate-400 text-[9px]">{e.date_entree}</p>
                            </div>
                        </div>
                        <span className="text-[#22C55E] font-black text-xs">+{fmt(e.montant)}</span>
                    </div>
                ))}
            </div>
          </div>

          {/* Section Dépenses */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[#EF4444] font-black text-xs uppercase px-2 flex items-center gap-2">
                <TrendingDown className="w-3 h-3"/> Dernières Dépenses
            </h3>
            <div className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700/50">
                {stats.dernièresDepenses.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border-b border-slate-700/30 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#EF4444]/20 flex items-center justify-center">
                                <TrendingDown className="w-4 h-4 text-[#EF4444]" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-xs">{d.titre}</p>
                                <p className="text-slate-400 text-[9px]">{d.date_depense}</p>
                            </div>
                        </div>
                        <span className="text-[#EF4444] font-black text-xs">-{fmt(d.montant)}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
