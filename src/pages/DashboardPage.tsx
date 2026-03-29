import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatAmount, convertAmount } from "@/lib/app-utils";
import AppLayout from "@/components/AppLayout";
import {
  TrendingUp, TrendingDown, Clock,
  ArrowUpRight, Store, BadgeCheck, 
  Wallet, Sun, Moon, Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import { getNexoraUser } from "@/lib/nexora-auth";

export default function DashboardPage() {
  const [devise, setDevise] = useState<"XOF" | "USD">("XOF");
  const [time, setTime] = useState(new Date());
  const [isDark, setIsDark] = useState(true); // État pour le mode sombre/clair
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEntrees: 0, totalDepenses: 0 });

  const nexoraUser = getNexoraUser();
  const displayName = nexoraUser?.nom_prenom?.split(" ")[0] || "Eric";
  const solde = stats.totalEntrees - stats.totalDepenses;

  useEffect(() => {
    // Logique de chargement simplifiée pour l'exemple
    const timer = setInterval(() => setTime(new Date()), 1000);
    setLoading(false);
    return () => clearInterval(timer);
  }, []);

  const fmt = (v: number) => formatAmount(devise === "XOF" ? v : convertAmount(v, "XOF", "USD"), devise);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <AppLayout>
      <div className={`w-full min-h-screen flex flex-col gap-4 p-3 transition-colors ${isDark ? 'bg-[#0B1120]' : 'bg-gray-50'}`}>
        
        {/* TOP BAR AVEC SWITCH MODE */}
        <div className="flex items-center justify-between px-1">
          <h2 className={`font-black text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Tableau de bord</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-white border-gray-200 text-indigo-600 shadow-sm'}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-slate-600 shadow-sm'}`}>
              <Bell size={20} />
            </div>
          </div>
        </div>

        {/* 1. HEADER - BORDURE VIOLETTE LUMINEUSE */}
        <div className={`relative overflow-hidden rounded-2xl p-6 border-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] ${isDark ? 'bg-slate-900 border-purple-500' : 'bg-white border-purple-400'}`}>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h1 className={`text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {new Date().getHours() < 18 ? "Bonjour" : "Bonsoir"}, {displayName} ! 👋
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Prêt pour vos finances ?</p>
              <div className="flex items-center gap-2 mt-4 bg-purple-500/10 w-fit px-3 py-1 rounded-full border border-purple-500/20">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-purple-500 font-mono font-bold text-xs">{time.toLocaleTimeString("fr-FR")}</span>
              </div>
            </div>
            <select
              value={devise}
              onChange={(e) => setDevise(e.target.value as any)}
              className={`rounded-xl px-3 py-1.5 font-bold text-sm outline-none border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-100 border-gray-200 text-slate-900'}`}
            >
              <option value="XOF">XOF</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* 2. SOLDE NET TOTAL - Style "PREMIUM" de l'image */}
        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <Wallet className="w-8 h-8 text-[#7C3AED]" />
          </div>
          <div>
            <p className="text-[#6D28D9] text-xs font-bold uppercase tracking-widest">Solde net total</p>
            <h2 className="text-[#4C1D95] text-3xl font-black">{loading ? "..." : fmt(solde)}</h2>
          </div>
        </div>

        {/* 3. GRILLE DES CARTES - COULEURS ADAPTÉES DE L'IMAGE */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Entrées - Style "GRATUIT" (Blanc/Gris) */}
          <Link to="/entrees-depenses" className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
            <div className="bg-gray-50 p-2 w-fit rounded-lg mb-3 border border-gray-100">
               <TrendingUp className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase mb-1">Entrées</p>
            <p className="text-slate-900 font-black text-lg">{fmt(stats.totalEntrees)}</p>
          </Link>

          {/* Dépenses - Style "BLOQUÉS" (Rouge Pastel) */}
          <Link to="/entrees-depenses" className="bg-[#FFF1F2] border border-[#FECDD3] p-4 rounded-2xl shadow-sm">
            <div className="bg-white p-2 w-fit rounded-lg mb-3 shadow-sm">
               <TrendingDown className="w-5 h-5 text-[#E11D48]" />
            </div>
            <p className="text-[#BE123C] font-bold text-xs uppercase mb-1">Dépenses</p>
            <p className="text-[#9F1239] font-black text-lg">{fmt(stats.totalDepenses)}</p>
          </Link>

          {/* Transfert - Style "ACTIFS" (Vert Pastel) */}
          <Link to="/transfert" className="bg-[#F0FDF4] border border-[#DCFCE7] p-4 rounded-2xl shadow-sm">
            <div className="bg-white p-2 w-fit rounded-lg mb-3 shadow-sm">
               <ArrowUpRight className="w-5 h-5 text-[#16A34A]" />
            </div>
            <p className="text-[#15803D] font-bold text-xs uppercase mb-1">Transfert</p>
            <p className="text-[#166534] font-black text-lg">Envoi →</p>
          </Link>

          {/* Boutique - Style "BOUTIQUE" (Sombre/Bleu Nuit) */}
          <Link to="/boutique" className="bg-[#0F172A] border border-slate-700 p-4 rounded-2xl shadow-sm">
            <div className="bg-slate-800 p-2 w-fit rounded-lg mb-3 border border-slate-700">
               <Store className="w-5 h-5 text-pink-400" />
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase mb-1">Boutique</p>
            <p className="text-white font-black text-lg">Actives: 1</p>
          </Link>

        </div>

        {/* 4. BANNIÈRE PREMIUM */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 text-white">
            <Zap className="text-yellow-300 fill-yellow-300" />
            <div>
              <p className="font-bold text-sm">Passer au plan PRO</p>
              <p className="text-[10px] opacity-80 text-white">Accès illimité à tout</p>
            </div>
          </div>
          <button className="bg-white text-indigo-600 font-black text-xs px-4 py-2 rounded-xl">UPGRADE</button>
        </div>

      </div>
    </AppLayout>
  );
}
