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
        background: "#60A5FA", // Bleu clair pour contraste subtil
        flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.4)",
      }}>
      <BadgeCheck style={{ width: 11, height: 11, color: "#FFFFFF", flexShrink: 0 }} />
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
  const isPremium = nexoraUser?.plan === "boss" || nexoraUser?.plan === "roi" || nexoraUser?.plan === "admin";

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

        {/* 1️⃣ HEADER “Bon après-midi, NEXORA !” */}
        <div
          className="relative overflow-hidden rounded-xl shadow-brand-lg"
          style={{ padding: "12px 14px", flexShrink: 0, backgroundColor: "#3B82F6", color: "#FFFFFF" }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-2 border-white" />
            <div className="absolute -bottom-4 right-14 w-20 h-20 rounded-full border-2 border-white" />
          </div>
          <div className="relative flex items-center gap-3">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                <div
                  className="font-display font-black"
                  style={{
                    fontSize: "15px",
                    lineHeight: "1.3",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flexShrink: 1,
                  }}>
                  {getGreeting()}, NEXORA ! 👋
                </div>
                {hasBadge && <VerifiedBadge />}
              </div>

              <div
                className="capitalize"
                style={{
                  fontSize: "11px",
                  marginTop: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "rgba(255,255,255,0.8)"
                }}>
                {getDateStr()}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                <Clock style={{ width: 11, height: 11, color: "#FFFFFF" }} />
                <span
                  className="font-mono font-black"
                  style={{ fontSize: "11px", color: "#FFFFFF", letterSpacing: "0.1em" }}>
                  {clockStr}
                </span>
              </div>
            </div>

            <select
              value={devise}
              onChange={(e) => setDevise(e.target.value as "XOF" | "USD")}
              className="bg-white/20 border border-white/30 text-white rounded-lg font-semibold cursor-pointer"
              style={{ padding: "4px 8px", fontSize: "11px", flexShrink: 0 }}>
              <option value="XOF" className="text-gray-900">XOF</option>
              <option value="USD" className="text-gray-900">USD</option>
            </select>
          </div>
        </div>

        {/* 2️⃣ SOLDE NET TOTAL */}
        <div
          className="rounded-xl border"
          style={{ 
            padding: "10px 14px", 
            flexShrink: 0, 
            backgroundColor: "#111827", 
            borderColor: "#16A34A" 
          }}>
          <div
            className="font-bold uppercase"
            style={{ fontSize: "10px", color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: "2px" }}>
            Solde net total
          </div>
          <div
            className="font-black font-display"
            style={{
              fontSize: "20px", 
              lineHeight: 1.2,
              color: "#22C55E",
              overflow: "hidden", 
              textOverflow: "ellipsis", 
              whiteSpace: "nowrap",
            }}>
            {loading ? "—" : fmt(solde)}
          </div>
        </div>

        {/* 3️⃣ ENTRÉES / DÉPENSES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <Link
            to="/entrees-depenses"
            className="border rounded-xl hover:shadow-brand transition-all"
            style={{ padding: "10px 12px", overflow: "hidden", backgroundColor: "#1F2937", borderColor: "#374151" }}>
            <div
              className="font-bold uppercase flex items-center gap-1"
              style={{ fontSize: "10px", color: "#22C55E", letterSpacing: "0.05em", marginBottom: "4px" }}>
              <TrendingUp style={{ width: 11, height: 11, color: "#34D399" }} /> Entrées
            </div>
            <div
              className="font-black"
              style={{ fontSize: "17px", color: "#22C55E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {loading ? "—" : fmt(stats.totalEntrees)}
            </div>
          </Link>

          <Link
            to="/entrees-depenses"
            className="border rounded-xl hover:shadow-brand transition-all"
            style={{ padding: "10px 12px", overflow: "hidden", backgroundColor: "#1F2937", borderColor: "#374151" }}>
            <div
              className="font-bold uppercase flex items-center gap-1"
              style={{ fontSize: "10px", color: "#F87171", letterSpacing: "0.05em", marginBottom: "4px" }}>
              <TrendingDown style={{ width: 11, height: 11, color: "#FCA5A5" }} /> Dépenses
            </div>
            <div
              className="font-black"
              style={{ fontSize: "17px", color: "#F87171", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {loading ? "—" : fmt(stats.totalDepenses)}
            </div>
          </Link>
        </div>

        {/* 4️⃣ BOUTONS / CARDS FONCTIONNELLES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          <Link to="/factures" className="rounded-xl flex flex-col items-center justify-center text-center"
            style={{ padding: "10px 6px", backgroundColor: "#4338CA" }}>
            <TrendingUp style={{ width: 18, height: 18, color: "#FFFFFF" }} />
            <div className="font-semibold" style={{ fontSize: "10px", marginTop: "4px", color: "#FFFFFF" }}>Factures</div>
            <div className="font-display font-black" style={{ fontSize: "18px", marginTop: "2px", color: "#FFFFFF" }}>→</div>
          </Link>

          <Link to="/transfert" className="rounded-xl flex flex-col items-center justify-center text-center"
            style={{ padding: "10px 6px", backgroundColor: "#0EA5E9" }}>
            <ArrowUpRight style={{ width: 18, height: 18, color: "#FFFFFF" }} />
            <div className="font-semibold" style={{ fontSize: "10px", marginTop: "4px", color: "#FFFFFF" }}>Transfert</div>
            <div className="font-display font-black" style={{ fontSize: "18px", marginTop: "2px", color: "#FFFFFF" }}>→</div>
          </Link>

          <Link to="/boutique" className="rounded-xl flex flex-col items-center justify-center text-center"
            style={{ padding: "10px 6px", backgroundColor: "#BE185D" }}>
            <Store style={{ width: 18, height: 18, color: "#FFFFFF" }} />
            <div className="font-semibold" style={{ fontSize: "10px", marginTop: "4px", color: "#FFFFFF" }}>Boutique</div>
            <div className="font-display font-black" style={{ fontSize: "18px", marginTop: "2px", color: "#FFFFFF" }}>→</div>
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <Link to="/" className="rounded-xl flex flex-col items-center justify-center text-center"
            style={{ padding: "10px 6px", backgroundColor: "#4338CA" }}>
            <Home style={{ width: 18, height: 18, color: "#FFFFFF" }} />
            <div className="font-semibold" style={{ fontSize: "10px", marginTop: "4px", color: "#FFFFFF" }}>Accueil</div>
            <div className="font-display font-black" style={{ fontSize: "18px", marginTop: "2px", color: "#FFFFFF" }}>→</div>
          </Link>

          <Link to="/historique" className="rounded-xl flex flex-col items-center justify-center text-center"
            style={{ padding: "10px 6px", backgroundColor: "#B91C1C" }}>
            <History style={{ width: 18, height: 18, color: "#FFFFFF" }} />
            <div className="font-semibold" style={{ fontSize: "10px", marginTop: "4px", color: "#FFFFFF" }}>Historique</div>
            <div className="font-display font-black" style={{ fontSize: "18px", marginTop: "2px", color: "#FFFFFF" }}>↗</div>
          </Link>
        </div>

        {/* 5️⃣ PETITES CARTES DÉTAILLÉES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {/* Dépenses détaillées */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span className="font-display font-bold flex items-center gap-1" style={{ fontSize: "11px", color: "#F87171" }}>
                <TrendingDown style={{ width: 12, height: 12 }} /> Dépenses
              </span>
              <Link to="/entrees-depenses" className="font-semibold flex items-center gap-0.5" style={{ fontSize: "10px", color: "#60A5FA" }}>
                Voir <ArrowUpRight style={{ width: 10, height: 10 }} />
              </Link>
            </div>
            <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}>
              {loading ? (
                <div className="text-center" style={{ padding: "10px", fontSize: "11px", color: "#9CA3AF" }}>Chargement...</div>
              ) : stats.dernièresDepenses.length === 0 ? (
                <div className="text-center" style={{ padding: "10px", fontSize: "11px", color: "#9CA3AF" }}>Aucune dépense</div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {stats.dernièresDepenses.map((d: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px" }}>
                      <div className="bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 22, height: 22 }}>
                        <TrendingDown style={{ width: 11, height: 11, color: "#F87171" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-medium" style={{ fontSize: "10px", color: "#F9FAFB", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.titre}</div>
                        <div style={{ fontSize: "9px", color: "#9CA3AF" }}>{d.date_depense}</div>
                      </div>
                      <div className="font-bold" style={{ fontSize: "10px", color: "#F87171", whiteSpace: "nowrap" }}>
                        -{fmt(d.devise === "USD" ? convertAmount(Number(d.montant), "USD", "XOF") : Number(d.montant))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Entrées détaillées */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span className="font-display font-bold flex items-center gap-1" style={{ fontSize: "11px", color: "#22C55E" }}>
                <TrendingUp style={{ width: 12, height: 12 }} /> Entrées
              </span>
              <Link to="/entrees-depenses" className="font-semibold flex items-center gap-0.5" style={{ fontSize: "10px", color: "#60A5FA" }}>
                Voir <ArrowUpRight style={{ width: 10, height: 10 }} />
              </Link>
            </div>
            <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}>
              {loading ? (
                <div className="text-center" style={{ padding: "10px", fontSize: "11px", color: "#9CA3AF" }}>Chargement...</div>
              ) : stats.dernièresEntrees.length === 0 ? (
                <div className="text-center" style={{ padding: "10px", fontSize: "11px", color: "#9CA3AF" }}>Aucune entrée</div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {stats.dernièresEntrees.map((e: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px" }}>
                      <div className="bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 22, height: 22 }}>
                        <TrendingUp style={{ width: 11, height: 11, color: "#22C55E" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-medium" style={{ fontSize: "10px", color: "#F9FAFB", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.titre}</div>
                        <div style={{ fontSize: "9px", color: "#9CA3AF" }}>{e.date_entree}</div>
                      </div>
                      <div className="font-bold" style={{ fontSize: "10px", color: "#22C55E", whiteSpace: "nowrap" }}>
                        +{fmt(e.devise === "USD" ? convertAmount(Number(e.montant), "USD", "XOF") : Number(e.montant))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BANNIÈRE PREMIUM (Restaurée) */}
        {nexoraUser && nexoraUser.plan === "gratuit" && (
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white"
            style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <Zap style={{ width: 20, height: 20, color: "#fde047", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="font-bold" style={{ fontSize: "12px" }}>Passez au Premium !</div>
              <div style={{ fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(255,255,255,0.8)" }}>
                Toutes les fonctionnalités illimitées — 10$/mois
              </div>
            </div>
            <Link to="/abonnement" className="bg-yellow-400 text-gray-900 font-bold rounded-lg" style={{ padding: "5px 10px", fontSize: "11px", flexShrink: 0 }}>
              Voir
            </Link>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
