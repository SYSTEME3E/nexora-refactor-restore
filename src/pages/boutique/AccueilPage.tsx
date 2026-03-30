import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import BoutiqueLayout from "@/components/BoutiqueLayout";
import {
  ShoppingBag, Package, TrendingUp,
  BarChart2, Zap, Crown, Lock, ShieldCheck,
  RefreshCw, CheckCircle, Truck, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNexoraUser, PLAN_LIMITS } from "@/lib/nexora-auth";

type Periode = "jour" | "semaine" | "mois";

export default function BoutiqueAccueilPage() {
  const user = getNexoraUser();
  const [boutique, setBoutique] = useState<any>(null);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periode, setPeriode] = useState<Periode>("semaine");
  const [graphData, setGraphData] = useState<{ label: string; montant: number; nb: number }[]>([]);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const userId = user?.id;
    if (!userId) { setLoading(false); return; }
    const { data: b } = await supabase
      .from("boutiques" as any).select("*").eq("user_id", userId).limit(1).maybeSingle();
    if (!b) { setLoading(false); setRefreshing(false); return; }
    setBoutique(b);

    const { data: cmds } = await supabase
      .from("commandes" as any).select("*")
      .eq("boutique_id", (b as any).id)
      .order("created_at", { ascending: false });
    const allCmds = cmds as any[] || [];
    setCommandes(allCmds);

    const { data: prods } = await supabase
      .from("produits" as any).select("*").eq("boutique_id", (b as any).id);
    setProduits(prods as any[] || []);

    // ── Graphique réel 7 derniers jours ──
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const cmdsJour = allCmds.filter(c => new Date(c.created_at).toDateString() === dateStr);
      days.push({
        label: date.toLocaleDateString("fr-FR", { weekday: "short" }),
        montant: cmdsJour.filter(c => c.statut !== "annulee").reduce((sum: number, c: any) => sum + (c.total || 0), 0),
        nb: cmdsJour.length,
      });
    }
    setGraphData(days);

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const filtrerParPeriode = (liste: any[]) => {
    const now = new Date();
    return liste.filter(c => {
      const date = new Date(c.created_at);
      if (periode === "jour") return date.toDateString() === now.toDateString();
      if (periode === "semaine") return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 7;
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  };

  const commandesFiltrees = filtrerParPeriode(commandes);
  const totalMontant = commandesFiltrees.filter(c => c.statut !== "annulee").reduce((sum, c) => sum + (c.total || 0), 0);
  const produitsPhysiques = produits.filter(p => p.type === "physique" || !p.type).length;
  const produitsDigitaux = produits.filter(p => p.type === "digital" || p.type === "numerique").length;
  const planActuel = user?.plan || "gratuit";
  const limiteProduits = PLAN_LIMITS[planActuel].produits;
  const estBloque = produits.length >= limiteProduits;
  const maxMontant = Math.max(...graphData.map(d => d.montant), 1);

  // Stats par statut
  const cmdEnAttente = commandes.filter(c => c.statut === "en_attente" || c.statut === "nouvelle").length;
  const cmdLivrees   = commandes.filter(c => c.statut === "livree").length;
  const cmdEnRoute   = commandes.filter(c => c.statut === "expediee" || c.statut === "en_preparation").length;

  if (loading) return (
    <BoutiqueLayout boutiqueName={boutique?.nom}>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </BoutiqueLayout>
  );

  if (!boutique) return (
    <BoutiqueLayout>
      <div className="text-center py-20 px-6">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🏪</div>
        <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">Boutique non configurée</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Créez votre boutique pour commencer à vendre.</p>
        <Button className="mt-6 bg-pink-500 hover:bg-pink-600 rounded-2xl h-12 px-8 font-bold shadow-lg shadow-pink-200">
          <a href="/boutique/parametres">Configurer ma boutique</a>
        </Button>
      </div>
    </BoutiqueLayout>
  );

  return (
    <BoutiqueLayout boutiqueName={boutique?.nom} boutiqueSlug={boutique?.slug}>
      <div className="space-y-5 pb-12">

        {/* 1. HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">Tableau de bord</h1>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Analyse en temps réel</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Sélecteur période */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {(["jour", "semaine", "mois"] as Periode[]).map(p => (
                <button key={p} onClick={() => setPeriode(p)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all capitalize ${
                    periode === p
                      ? "bg-white dark:bg-gray-700 text-pink-600 dark:text-pink-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
            {/* Rafraîchir */}
            <button onClick={() => load(true)}
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <RefreshCw className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 2. BANNIÈRE PLAN */}
        <div className={`p-5 rounded-[2rem] flex items-center justify-between relative overflow-hidden transition-all ${
          planActuel === "roi" ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-xl shadow-yellow-100" :
          planActuel === "boss" ? "bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-100" :
          "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
        }`}>
          <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-2xl ${planActuel === "gratuit" ? "bg-gray-100 dark:bg-gray-700" : "bg-white/20"}`}>
              {planActuel === "roi" ? <Crown className="w-6 h-6" /> : <Zap className={`w-6 h-6 ${planActuel === "gratuit" ? "text-gray-400 dark:text-gray-300" : ""}`} />}
            </div>
            <div>
              <p className={`text-[10px] opacity-70 font-black uppercase tracking-widest ${planActuel === "gratuit" ? "text-gray-500 dark:text-gray-400" : ""}`}>Plan Actuel</p>
              <h2 className={`text-lg font-black capitalize ${planActuel === "gratuit" ? "text-gray-800 dark:text-gray-100" : ""}`}>{planActuel}</h2>
            </div>
          </div>
          <div className="text-right relative z-10">
            <p className={`text-[10px] font-bold ${planActuel === "gratuit" ? "text-gray-500 dark:text-gray-400" : ""}`}>
              Produits : {produits.length} / {limiteProduits === Infinity ? "∞" : limiteProduits}
            </p>
            <Button size="sm" className="h-7 text-[9px] mt-2 bg-white text-black hover:bg-gray-100 font-bold rounded-full border-none shadow-sm">
              AMÉLIORER
            </Button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            {planActuel === "roi" ? <Crown className="w-24 h-24" /> : <ShieldCheck className="w-24 h-24" />}
          </div>
        </div>

        {/* 3. ALERTE LIMITE */}
        {estBloque && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3">
            <Lock className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="text-xs font-black text-red-700 dark:text-red-400 uppercase">Limite de produits atteinte !</p>
              <p className="text-[10px] text-red-600 dark:text-red-400">Passez au plan BOSS pour débloquer plus d'espace.</p>
            </div>
          </div>
        )}

        {/* 4. STATS RAPIDES */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900 rounded-2xl p-3 text-center">
            <Clock className="w-4 h-4 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{cmdEnAttente}</p>
            <p className="text-[9px] text-orange-500 dark:text-orange-400 font-bold uppercase">En attente</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl p-3 text-center">
            <Truck className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{cmdEnRoute}</p>
            <p className="text-[9px] text-blue-500 dark:text-blue-400 font-bold uppercase">En route</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-2xl p-3 text-center">
            <CheckCircle className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-black text-green-600 dark:text-green-400">{cmdLivrees}</p>
            <p className="text-[9px] text-green-500 dark:text-green-400 font-bold uppercase">Livrées</p>
          </div>
        </div>

        {/* 5. PHYSIQUE VS DIGITAL */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase">Boutique Physique</p>
            <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{produitsPhysiques}</p>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold mt-1">Articles réels</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase">Boutique Digitale</p>
            <p className="text-3xl font-black text-pink-600 dark:text-pink-400">{produitsDigitaux}</p>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold mt-1">Services & PDF</p>
          </div>
        </div>

        {/* 6. REVENUS & VENTES */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase">Ventes</p>
            </div>
            <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{commandesFiltrees.length}</p>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">
              {periode === "jour" ? "Aujourd'hui" : periode === "semaine" ? "Cette semaine" : "Ce mois"}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase">Revenus</p>
            </div>
            <p className="text-xl font-black text-gray-800 dark:text-gray-100 leading-none">
              {Math.round(totalMontant).toLocaleString("fr-FR")}
            </p>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold mt-1 uppercase">{boutique.devise || "FCFA"}</p>
          </div>
        </div>

        {/* 7. GRAPHIQUE PERFORMANCE — RÉEL ── */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-pink-500" />
              <p className="font-black text-gray-800 dark:text-gray-100 text-xs uppercase tracking-widest">Performance (7 jours)</p>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
              Total : {Math.round(graphData.reduce((s, d) => s + d.montant, 0)).toLocaleString("fr-FR")} {boutique.devise || "FCFA"}
            </p>
          </div>

          {/* Barres du graphique */}
          <div className="flex items-end gap-2 h-32 mt-4">
            {graphData.map((d, i) => {
              const height = Math.max((d.montant / maxMontant) * 100, d.nb > 0 ? 12 : 4);
              const isToday = i === graphData.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {/* Tooltip montant */}
                  {d.montant > 0 && (
                    <span className="text-[8px] text-gray-400 dark:text-gray-500 font-bold">
                      {d.montant >= 1000 ? `${Math.round(d.montant / 1000)}k` : Math.round(d.montant)}
                    </span>
                  )}
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-xl relative group cursor-pointer transition-all ${
                        isToday ? "bg-pink-200 dark:bg-pink-900/50" : "bg-gray-100 dark:bg-gray-700"
                      }`}
                      style={{ height: `${height}%` }}
                    >
                      <div className={`absolute inset-0 rounded-t-xl transition-opacity group-hover:opacity-100 ${
                        d.nb > 0
                          ? isToday ? "bg-pink-500 opacity-90" : "bg-violet-500 opacity-70"
                          : "opacity-0"
                      }`} />
                      {/* Tooltip nb commandes */}
                      {d.nb > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap z-10">
                          {d.nb} cmd{d.nb > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase ${isToday ? "text-pink-500" : "text-gray-400 dark:text-gray-500"}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Légende */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-violet-500 opacity-70" />
              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold">Jours passés</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-pink-500" />
              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold">Aujourd'hui</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700" />
              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold">Aucune vente</span>
            </div>
          </div>
        </div>

      </div>
    </BoutiqueLayout>
  );
}
