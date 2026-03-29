import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatAmount, convertAmount } from "@/lib/app-utils";
import AppLayout from "@/components/AppLayout";
import {
  TrendingUp, TrendingDown, History, Clock,
  ArrowUpRight, HandCoins, Lock, Home,
  Store, BadgeCheck, Zap
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
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "18px",
        height: "18px",
        borderRadius: "999px",
        background: "#3b82f6",
        flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.4)",
      }}>
      <BadgeCheck style={{ width: 11, height: 11, color: "#fff", flexShrink: 0 }} />
    </span>
  );
}

export default function DashboardPage() {
  const [devise, setDevise] = useState<"XOF" | "USD">("XOF");
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalEntrees: 0,
    totalDepenses: 0,
    nbCoffre: 0,
    nbLiens: 0,
    nbPrets: 0,
    nbInvest: 0,
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
    const toXOF = (m: number, dev: string) =>
      dev === "USD" ? convertAmount(m, "USD", "XOF") : m;

    const userId = nexoraUser?.id;
    if (!userId) { setLoading(false); return; }
    const [depResult, entResult, coffreResult, liensResult, pretsResult] =
      await Promise.all([
        supabase.from("depenses" as any).select("montant, devise, date_depense, titre, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("entrees" as any).select("montant, devise, date_entree, titre, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("coffre_fort" as any).select("id").eq("user_id", userId),
        supabase.from("liens_contacts" as any).select("id").eq("user_id", userId),
        supabase.from("prets" as any).select("id").eq("user_id", userId).eq("statut", "en_attente"),
      ]);

    const deps = depResult.data || [];
    const ents = entResult.data || [];

    const totalEntrees = ents.reduce((s: number, e: any) => s + toXOF(Number(e.montant), e.devise), 0);
    const totalDepenses = deps.reduce((s: number, d: any) => s + toXOF(Number(d.montant), d.devise), 0);

    setStats({
      totalEntrees,
      totalDepenses,
      nbCoffre: coffreResult.data?.length || 0,
      nbLiens: liensResult.data?.length || 0,
      nbPrets: (pretsResult.data as any)?.length || 0,
      nbInvest: 0,
      dernièresDepenses: deps.slice(0, 4),
      dernièresEntrees: ents.slice(0, 4),
    });
    setLoading(false);
  };

  const fmt = (v: number) =>
    formatAmount(devise === "XOF" ? v : convertAmount(v, "XOF", "USD"), devise);

  const clockStr = time.toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const solde = stats.totalEntrees - stats.totalDepenses;

  return (
    <AppLayout>
      <div
        className="w-full overflow-hidden"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}>

        {/* HEADER / BON APRÈS-MIDI - Bleu clair #3B82F6 */}
        <div
          className="relative overflow-hidden rounded-xl bg-[#3B82F6] text-white shadow-brand-lg"
          style={{ padding: "12px 14px", flexShrink: 0 }}>
          <div className="relative flex items-center gap-3">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div className="font-display font-black" style={{ fontSize: "15px" }}>
                  {getGreeting()}, {displayName} ! 👋
                </div>
                {hasBadge && <VerifiedBadge />}
              </div>
              <div className="text-white/80 capitalize" style={{ fontSize: "11px", marginTop: "2px" }}>
                {getDateStr()}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                <Clock style={{ width: 11, height: 11, color: "#fff" }} />
                <span className="font-mono font-black" style={{ fontSize: "11px", color: "#fff" }}>
                  {clockStr}
                </span>
              </div>
            </div>
            <select
              value={devise}
              onChange={(e) => setDevise(e.target.value as "XOF" | "USD")}
              className="bg-white/20 border border-white/30 text-white rounded-lg font-semibold"
              style={{ padding: "4px 8px", fontSize: "11px" }}>
              <option value="XOF" className="text-gray-900">XOF</option>
              <option value="USD" className="text-gray-900">USD</option>
            </select>
          </div>
        </div>

        {/* SOLDE NET - Vert foncé #16A34A si positif */}
        <div
          className={`rounded-xl border ${
            solde >= 0
              ? "bg-green-50 dark:bg-[#16A34A] border-green-200 dark:border-[#16A34A]"
              : "bg-red-50 dark:bg-[#EF4444] border-red-200 dark:border-[#EF4444]"
          }`}
          style={{ padding: "10px 14px", flexShrink: 0 }}>
          <div className="font-bold uppercase text-muted-foreground dark:text-white/80" style={{ fontSize: "10px" }}>
            Solde net total
          </div>
          <div className={`font-black font-display ${solde >= 0 ? "text-green-700 dark:text-white" : "text-destructive dark:text-white"}`}
            style={{ fontSize: "20px" }}>
            {loading ? "—" : fmt(solde)}
          </div>
        </div>

        {/* ENTRÉES (#22C55E) + DÉPENSES (#EF4444) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <Link to="/entrees-depenses" className="bg-card dark:bg-[#22C55E] border border-border dark:border-[#22C55E] rounded-xl p-[10px_12px]">
            <div className="font-bold text-green-600 dark:text-white uppercase flex items-center gap-1" style={{ fontSize: "10px" }}>
              <TrendingUp style={{ width: 11, height: 11 }} /> Entrées
            </div>
            <div className="font-black text-green-600 dark:text-white" style={{ fontSize: "17px" }}>
              {loading ? "—" : fmt(stats.totalEntrees)}
            </div>
          </Link>

          <Link to="/entrees-depenses" className="bg-card dark:bg-[#EF4444] border border-border dark:border-[#EF4444] rounded-xl p-[10px_12px]">
            <div className="font-bold text-destructive dark:text-white uppercase flex items-center gap-1" style={{ fontSize: "10px" }}>
              <TrendingDown style={{ width: 11, height: 11 }} /> Dépenses
            </div>
            <div className="font-black text-destructive dark:text-white" style={{ fontSize: "17px" }}>
              {loading ? "—" : fmt(stats.totalDepenses)}
            </div>
          </Link>
        </div>

        {/* QUICK LINKS LIGNE 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {/* Factures - Violet #8B5CF6 */}
            <Link to="/factures" className="border rounded-xl flex flex-col items-center justify-center bg-indigo-50 dark:bg-[#8B5CF6] border-indigo-200 dark:border-[#8B5CF6] p-[10px_6px]">
              <TrendingUp style={{ width: 18, height: 18, color: "white" }} />
              <div className="font-semibold text-indigo-600 dark:text-white" style={{ fontSize: "10px", marginTop: "4px" }}>Factures</div>
              <div className="font-display font-black text-indigo-600 dark:text-white" style={{ fontSize: "18px" }}>→</div>
            </Link>
            {/* Transfert - Bleu Foncé #2563EB */}
            <Link to="/transfert" className="border rounded-xl flex flex-col items-center justify-center bg-sky-50 dark:bg-[#2563EB] border-sky-200 dark:border-[#2563EB] p-[10px_6px]">
              <ArrowUpRight style={{ width: 18, height: 18, color: "white" }} />
              <div className="font-semibold text-sky-600 dark:text-white" style={{ fontSize: "10px", marginTop: "4px" }}>Transfert</div>
              <div className="font-display font-black text-sky-600 dark:text-white" style={{ fontSize: "18px" }}>→</div>
            </Link>
            {/* Boutique - Rose Foncé #EC4899 */}
            <Link to="/boutique" className="border rounded-xl flex flex-col items-center justify-center bg-pink-50 dark:bg-[#EC4899] border-pink-200 dark:border-[#EC4899] p-[10px_6px]">
              <Store style={{ width: 18, height: 18, color: "white" }} />
              <div className="font-semibold text-pink-600 dark:text-white" style={{ fontSize: "10px", marginTop: "4px" }}>Boutique</div>
              <div className="font-display font-black text-pink-600 dark:text-white" style={{ fontSize: "18px" }}>→</div>
            </Link>
        </div>

        {/* QUICK LINKS LIGNE 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {/* Accueil - Bleu Clair #3B82F6 */}
          <Link to="/" className="bg-indigo-50 dark:bg-[#3B82F6] border border-indigo-200 dark:border-[#3B82F6] rounded-xl flex flex-col items-center justify-center p-[10px_6px]">
            <Home style={{ width: 18, height: 18, color: "white" }} />
            <div className="font-semibold text-indigo-700 dark:text-white" style={{ fontSize: "10px", marginTop: "4px" }}>Accueil</div>
            <div className="font-display font-black text-indigo-700 dark:text-white" style={{ fontSize: "18px" }}>→</div>
          </Link>

          {/* Historique - Orange Clair #F59E0B */}
          <Link to="/historique" className="bg-red-50 dark:bg-[#F59E0B] border border-red-200 dark:border-[#F59E0B] rounded-xl flex flex-col items-center justify-center p-[10px_6px]">
            <History style={{ width: 18, height: 18, color: "white" }} />
            <div className="font-semibold text-destructive dark:text-white" style={{ fontSize: "10px", marginTop: "4px" }}>Historique</div>
            <div className="font-display font-black text-destructive dark:text-white" style={{ fontSize: "18px" }}>↗</div>
          </Link>
        </div>

        {/* LISTES - Entrées Vert / Dépenses Rouge */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {/* Colonne Dépenses List */}
            <div>
                <div className="flex justify-between mb-[6px]">
                    <span className="font-bold text-destructive dark:text-[#EF4444] flex items-center gap-1" style={{ fontSize: "11px" }}>
                        <TrendingDown style={{ width: 12, height: 12 }} /> Dépenses
                    </span>
                </div>
                <div className="bg-card dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
                    {stats.dernièresDepenses.map((d: any, i: number) => (
                        <div key={i} className="flex items-center gap-[6px] p-[6px_10px]">
                            <div className="bg-red-100 dark:bg-[#EF4444] rounded-full flex items-center justify-center w-[22px] h-[22px]">
                                <TrendingDown style={{ width: 11, height: 11, color: "white" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white text-[10px] truncate">{d.titre}</div>
                            </div>
                            <div className="font-bold text-destructive dark:text-[#EF4444] text-[10px]">-{fmt(d.montant)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Colonne Entrées List */}
            <div>
                <div className="flex justify-between mb-[6px]">
                    <span className="font-bold text-green-600 dark:text-[#22C55E] flex items-center gap-1" style={{ fontSize: "11px" }}>
                        <TrendingUp style={{ width: 12, height: 12 }} /> Entrées
                    </span>
                </div>
                <div className="bg-card dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
                    {stats.dernièresEntrees.map((e: any, i: number) => (
                        <div key={i} className="flex items-center gap-[6px] p-[6px_10px]">
                            <div className="bg-green-100 dark:bg-[#22C55E] rounded-full flex items-center justify-center w-[22px] h-[22px]">
                                <TrendingUp style={{ width: 11, height: 11, color: "white" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white text-[10px] truncate">{e.titre}</div>
                            </div>
                            <div className="font-bold text-green-600 dark:text-[#22C55E] text-[10px]">+{fmt(e.montant)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </AppLayout>
  );
}
