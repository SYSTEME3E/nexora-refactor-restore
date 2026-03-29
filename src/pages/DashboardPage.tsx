import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatAmount, convertAmount } from "@/lib/app-utils";
import AppLayout from "@/components/AppLayout";
import {
  TrendingUp, TrendingDown, Clock,
  ArrowUpRight, History,
  Store, BadgeCheck, Zap, Wallet
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

function getDateStr() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric",
    month: "long", day: "numeric"
  });
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
    dernièresDepenses: [] as any[],
    dernièresEntrees: [] as any[],
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
    const toXOF = (m: number, dev: string) => dev === "USD" ? convertAmount(m, "USD", "XOF") : m;
    const userId = nexoraUser?.id;
    if (!userId) { setLoading(false); return; }

    const [depResult, entResult] = await Promise.all([
      supabase.from("depenses" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("entrees" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    const deps = depResult.data || [];
    const ents = entResult.data || [];
    const totalEntrees = ents.reduce((s, e) => s + toXOF(Number(e.montant), e.devise), 0);
    const totalDepenses = deps.reduce((s, d) => s + toXOF(Number(d.montant), d.devise), 0);

    setStats({
      totalEntrees, totalDepenses,
      dernièresDepenses: deps.slice(0, 4),
      dernièresEntrees: ents.slice(0, 4),
    });
    setLoading(false);
  };

  const fmt = (v: number) => formatAmount(devise === "XOF" ? v : convertAmount(v, "XOF", "USD"), devise);
  const solde = stats.totalEntrees - stats.totalDepenses;

  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-4 p-2 max-w-full box-border bg-[#0A0E17]"> {/* Couleur de fond de l'image */}

        {/* 1. HERO SECTION LARGE - #10141D (Sable sombre) */}
        <div className="relative overflow-hidden rounded-2xl bg-[#10141D] border border-[#1E293B] p-6 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {getGreeting()}, {displayName} ! 👋
                </h1>
                {hasBadge && <VerifiedBadge />}
              </div>
              <p className="text-slate-400 text-sm font-medium capitalize">{getDateStr()}</p>
              <div className="flex items-center gap-2 mt-3 bg-[#1E293B] w-fit px-3 py-1.5 rounded-full border border-[#334155]">
                <Clock className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-[#38BDF8] font-mono font-bold text-xs">
                  {time.toLocaleTimeString("fr-FR")}
                </span>
              </div>
            </div>
            <select
              value={devise}
              onChange={(e) => setDevise(e.target.value as any)}
              className="bg-[#1E293B] border border-[#334155] text-white rounded-xl px-4 py-2 font-bold text-sm outline-none"
            >
              <option value="XOF">XOF</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* 2. SOLDE TOTAL - Style "Chiffre d'affaires" (Vert foncé/noir) */}
        <div className="bg-[#10141D] border border-[#1E293B] rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-[#1E293B] p-3 rounded-xl shadow-sm border border-[#334155]">
            <Wallet className="w-8 h-8 text-[#4ADE80]" />
          </div>
          <div>
            <p className="text-[#4ADE80] text-xs font-bold uppercase tracking-wider">Solde net total</p>
            <h2 className="text-white text-3xl font-black font-display">
              {loading ? "Chargement..." : fmt(solde)}
            </h2>
          </div>
        </div>

        {/* 3. GRILLE DE CARTES PRINCIPALES - Style de l'image (Sombre) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Entrées - Vert Sombre */}
          <Link to="/entrees-depenses" className="bg-[#10141D] border border-[#1E293B] p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
               <div className="bg-[#1E293B] p-2 rounded-lg shadow-sm border border-[#334155]"><TrendingUp className="w-5 h-5 text-green-500" /></div>
               <span className="text-white font-bold text-xs uppercase">Entrées</span>
            </div>
            <p className="text-white font-black text-lg truncate">{loading ? "..." : fmt(stats.totalEntrees)}</p>
          </Link>

          {/* Dépenses - Rouge Sombre */}
          <Link to="/entrees-depenses" className="bg-[#10141D] border border-[#1E293B] p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
               <div className="bg-[#1E293B] p-2 rounded-lg shadow-sm border border-[#334155]"><TrendingDown className="w-5 h-5 text-red-500" /></div>
               <span className="text-white font-bold text-xs uppercase">Dépenses</span>
            </div>
            <p className="text-white font-black text-lg truncate">{loading ? "..." : fmt(stats.totalDepenses)}</p>
          </Link>

          {/* Transfert - Bleu Sombre */}
          <Link to="/transfert" className="bg-[#10141D] border border-[#1E293B] p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
               <div className="bg-[#1E293B] p-2 rounded-lg shadow-sm border border-[#334155]"><ArrowUpRight className="w-5 h-5 text-blue-500" /></div>
               <span className="text-white font-bold text-xs uppercase">Transfert</span>
            </div>
            <p className="text-white font-black text-lg">Suivi →</p>
          </Link>

          {/* Boutique - Rose/Violet Sombre */}
          <Link to="/boutique" className="bg-[#10141D] border border-[#1E293B] p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
               <div className="bg-[#1E293B] p-2 rounded-lg shadow-sm border border-[#334155]"><Store className="w-5 h-5 text-pink-500" /></div>
               <span className="text-white font-bold text-xs uppercase">Boutique</span>
            </div>
            <p className="text-white font-black text-lg">Gérer →</p>
          </Link>
        </div>

        {/* 4. ACTIVITÉ RÉCENTE - Design Sombre épuré */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-3 px-1">
             <h3 className="text-white font-bold text-sm flex items-center gap-2">
               <History className="w-4 h-4 text-slate-400" /> Activité récente
             </h3>
             <Link to="/historique" className="text-blue-400 text-xs font-bold hover:underline">Tout voir</Link>
          </div>
          
          <div className="bg-[#10141D] border border-[#1E293B] rounded-2xl overflow-hidden divide-y divide-[#1E293B]">
             {stats.dernièresEntrees.slice(0, 2).map((e, i) => (
               <div key={`e-${i}`} className="p-4 flex items-center justify-between hover:bg-[#1E293B]/50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="bg-green-500/10 p-2 rounded-lg"><TrendingUp className="w-4 h-4 text-green-500" /></div>
                    <div>
                      <p className="text-white text-xs font-bold truncate max-w-[120px]">{e.titre}</p>
                      <p className="text-slate-500 text-[10px]">{e.date_entree}</p>
                    </div>
                 </div>
                 <span className="text-green-400 font-black text-xs">+{fmt(e.montant)}</span>
               </div>
             ))}
             {stats.dernièresDepenses.slice(0, 2).map((d, i) => (
               <div key={`d-${i}`} className="p-4 flex items-center justify-between hover:bg-[#1E293B]/50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="bg-red-500/10 p-2 rounded-lg"><TrendingDown className="w-4 h-4 text-red-500" /></div>
                    <div>
                      <p className="text-white text-xs font-bold truncate max-w-[120px]">{d.titre}</p>
                      <p className="text-slate-500 text-[10px]">{d.date_depense}</p>
                    </div>
                 </div>
                 <span className="text-red-400 font-black text-xs">-{fmt(d.montant)}</span>
               </div>
             ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
