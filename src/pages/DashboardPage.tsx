import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatAmount, convertAmount } from "@/lib/app-utils";
import AppLayout from "@/components/AppLayout";
import {
  TrendingUp, TrendingDown, History, Clock,
  ArrowUpRight, Store,
  Wallet, Sun, Moon, RefreshCw
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

export default function DashboardPage() {
  const [devise, setDevise]   = useState<"XOF" | "USD">("XOF");
  const [time, setTime]       = useState(new Date());
  const [isDark, setIsDark]   = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats]     = useState({
    totalEntrees: 0,
    totalDepenses: 0,
    dernièresDepenses: [] as any[],
    dernièresEntrees:  [] as any[],
  });

  const nexoraUser  = getNexoraUser();
  const displayName = nexoraUser?.nom_prenom?.split(" ")[0] || "Eric";

  useEffect(() => {
    loadStats();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const toXOF = (m: number, dev: string) =>
      dev === "USD" ? convertAmount(m, "USD", "XOF") : m;

    const userId = nexoraUser?.id;
    if (!userId) { setLoading(false); return; }

    const [depResult, entResult] = await Promise.all([
      supabase.from("depenses" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("entrees"  as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    const deps = depResult.data || [];
    const ents = entResult.data || [];

    const totalEntrees  = ents.reduce((s: number, e: any) => s + toXOF(Number(e.montant), e.devise), 0);
    const totalDepenses = deps.reduce((s: number, d: any) => s + toXOF(Number(d.montant), d.devise), 0);

    setStats({
      totalEntrees,
      totalDepenses,
      dernièresDepenses: deps.slice(0, 4),
      dernièresEntrees:  ents.slice(0, 4),
    });
    setLoading(false);
  };

  const fmt   = (v: number) =>
    formatAmount(devise === "XOF" ? v : convertAmount(v, "XOF", "USD"), devise);
  const solde = stats.totalEntrees - stats.totalDepenses;

  /* ── Boutons injectés dans le header d'AppLayout ── */
  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={loadStats}
        className={`p-2 rounded-xl border transition-all ${
          isDark
            ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
            : "bg-white border-gray-200 text-slate-500 shadow-sm"
        }`}
      >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
      </button>
      <button
        onClick={() => setIsDark(!isDark)}
        className={`p-2 rounded-xl border transition-all ${
          isDark
            ? "bg-slate-800 border-slate-700 text-yellow-400"
            : "bg-white border-gray-200 text-indigo-600 shadow-sm"
        }`}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );

  return (
    <AppLayout isDark={isDark} headerActions={headerActions}>
      <div className={`w-full flex flex-col gap-4 transition-colors duration-300 ${isDark ? "bg-[#0B1120]" : "bg-gray-50"}`}>

        {/* ── 1. HERO ── */}
        <div className={`relative overflow-hidden rounded-3xl p-6 border-2 transition-all ${
          isDark
            ? "bg-slate-900 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
            : "bg-white border-purple-400 shadow-md"
        }`}>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className={`text-2xl font-black mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                  {getGreeting()}, {displayName} ! 👋
                </h1>
                <p className={`text-sm font-medium capitalize ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {getDateStr()}
                </p>
              </div>
              <select
                value={devise}
                onChange={(e) => setDevise(e.target.value as any)}
                className={`rounded-xl px-3 py-2 font-bold text-xs outline-none border transition-all ${
                  isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-100 border-gray-200 text-slate-900"
                }`}
              >
                <option value="XOF">XOF</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/10 w-fit px-4 py-1.5 rounded-2xl border border-purple-500/20">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-purple-500 font-mono font-bold text-xs">
                {time.toLocaleTimeString("fr-FR")}
              </span>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-600/10 blur-3xl rounded-full" />
        </div>

        {/* ── 2. SOLDE ── */}
        <div className="rounded-3xl p-6 flex items-center gap-5 shadow-sm border bg-[#F5F3FF] border-[#DDD6FE]">
          <div className="bg-white p-4 rounded-2xl shadow-md shadow-purple-200">
            <Wallet className="w-8 h-8 text-[#7C3AED]" />
          </div>
          <div>
            <p className="text-[#6D28D9] text-xs font-black uppercase tracking-widest mb-1">Solde net total</p>
            <h2 className="text-[#4C1D95] text-3xl font-black font-display">
              {loading ? "Chargement..." : fmt(solde)}
            </h2>
          </div>
        </div>

        {/* ── 3. CARTES ── */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/entrees-depenses" className="bg-white border border-gray-200 p-4 rounded-3xl shadow-sm hover:scale-[1.02] transition-all">
            <div className="bg-slate-50 p-2.5 w-fit rounded-xl mb-3 border border-slate-100">
              <TrendingUp className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Entrées</p>
            <p className="text-slate-900 font-black text-xl truncate">{loading ? "..." : fmt(stats.totalEntrees)}</p>
          </Link>

          <Link to="/entrees-depenses" className="bg-[#FFF1F2] border border-[#FECDD3] p-4 rounded-3xl shadow-sm hover:scale-[1.02] transition-all">
            <div className="bg-white p-2.5 w-fit rounded-xl mb-3 shadow-sm">
              <TrendingDown className="w-6 h-6 text-[#E11D48]" />
            </div>
            <p className="text-[#BE123C] font-bold text-[10px] uppercase tracking-wider mb-1">Dépenses</p>
            <p className="text-[#9F1239] font-black text-xl truncate">{loading ? "..." : fmt(stats.totalDepenses)}</p>
          </Link>

          <Link to="/transfert" className="bg-[#F0FDF4] border border-[#DCFCE7] p-4 rounded-3xl shadow-sm hover:scale-[1.02] transition-all">
            <div className="bg-white p-2.5 w-fit rounded-xl mb-3 shadow-sm">
              <ArrowUpRight className="w-6 h-6 text-[#16A34A]" />
            </div>
            <p className="text-[#15803D] font-bold text-[10px] uppercase tracking-wider mb-1">Transfert</p>
            <p className="text-[#166534] font-black text-xl">Suivi →</p>
          </Link>

          <Link to="/boutique" className="bg-[#0F172A] border border-slate-700 p-4 rounded-3xl shadow-sm hover:scale-[1.02] transition-all">
            <div className="bg-slate-800 p-2.5 w-fit rounded-xl mb-3 border border-slate-700">
              <Store className="w-6 h-6 text-pink-400" />
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Boutique</p>
            <p className="text-white font-black text-xl">Gérer →</p>
          </Link>
        </div>

        {/* ── 4. TRANSACTIONS RÉCENTES ── */}
        <div className="mt-2 mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
              <History className="w-4 h-4 text-purple-500" /> Transactions récentes
            </h3>
            <Link to="/historique" className="text-purple-500 text-xs font-black hover:underline tracking-tight">
              VOIR TOUT
            </Link>
          </div>

          <div className={`rounded-3xl overflow-hidden border transition-all ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200 shadow-sm"
          }`}>
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs font-medium">Chargement des données...</div>
            ) : [...stats.dernièresEntrees, ...stats.dernièresDepenses].length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-medium">Aucune activité récente</div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {stats.dernièresEntrees.slice(0, 2).map((e, i) => (
                  <div key={`ent-${i}`} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 p-2 rounded-xl"><TrendingUp className="w-4 h-4 text-green-500" /></div>
                      <div>
                        <p className={`text-xs font-black truncate max-w-[140px] ${isDark ? "text-white" : "text-slate-900"}`}>{e.titre}</p>
                        <p className="text-slate-500 text-[10px]">{e.date_entree}</p>
                      </div>
                    </div>
                    <span className="text-green-500 font-black text-xs">+{fmt(e.montant)}</span>
                  </div>
                ))}
                {stats.dernièresDepenses.slice(0, 2).map((d, i) => (
                  <div key={`dep-${i}`} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500/10 p-2 rounded-xl"><TrendingDown className="w-4 h-4 text-red-500" /></div>
                      <div>
                        <p className={`text-xs font-black truncate max-w-[140px] ${isDark ? "text-white" : "text-slate-900"}`}>{d.titre}</p>
                        <p className="text-slate-500 text-[10px]">{d.date_depense}</p>
                      </div>
                    </div>
                    <span className="text-red-500 font-black text-xs">-{fmt(d.montant)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
