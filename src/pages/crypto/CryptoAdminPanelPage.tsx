import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck, ArrowLeft, Menu, X, RefreshCw,
  BarChart3, Users, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Clock, DollarSign,
  Search, Eye, EyeOff, Ban, Unlock,
  Bitcoin, Activity, Package, MessageSquare,
  ChevronDown, ChevronUp, Star, Flag,
  Wallet, ArrowRightLeft, Hash, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface CryptoUser {
  id: string;
  nom_prenom: string;
  username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  is_active: boolean;
  status: string;
  plan: string;
}

interface CryptoTransaction {
  id: string;
  user_id: string;
  type: "buy" | "sell" | "transfer";
  crypto: string;
  montant_crypto: number;
  montant_fcfa: number;
  statut: "pending" | "confirmed" | "disputed" | "cancelled";
  wallet_adresse?: string;
  seller_id?: string;
  created_at: string;
  user?: { nom_prenom: string; username: string };
  seller?: { nom_prenom: string; username: string };
}

interface CryptoOffer {
  id: string;
  seller_id: string;
  crypto: string;
  taux: number;
  montant_min: number;
  montant_max: number;
  disponible: number;
  actif: boolean;
  created_at: string;
  seller?: { nom_prenom: string; username: string };
  completed_trades?: number;
}

interface CryptoDispute {
  id: string;
  transaction_id: string;
  user_id: string;
  seller_id: string;
  raison: string;
  statut: "open" | "resolved" | "closed";
  created_at: string;
  user?: { nom_prenom: string; username: string };
  seller?: { nom_prenom: string; username: string };
}

interface CryptoStats {
  totalTransactions: number;
  volumeTotal: number;
  volumeUSD: number;
  transactionsPending: number;
  transactionsConfirmed: number;
  transactionsDisputed: number;
  totalOffers: number;
  offresActives: number;
  totalVendeurs: number;
  totalAcheteurs: number;
  fraisTotal: number;
  newTransactionsToday: number;
}

type CryptoAdminTab = "stats" | "transactions" | "offers" | "users" | "disputes" | "logs";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ADMIN_CODE = "CRYPTO2024";

const C = {
  bg:      "#06090f",
  bgCard:  "#0d1526",
  bgCard2: "#111e35",
  border:  "#1a2d4d",
  gold:    "#f59e0b",
  goldD:   "#d97706",
  green:   "#10b981",
  red:     "#ef4444",
  blue:    "#3b82f6",
  purple:  "#8b5cf6",
  cyan:    "#06b6d4",
  text:    "#e2e8f0",
  muted:   "#64748b",
};

const CRYPTOS_LIST = [
  { id: "usdt_trc20", name: "USDT TRC20", symbol: "USDT", color: "#26a17b", icon: "₮" },
  { id: "usdt_bep20", name: "USDT BEP20", symbol: "USDT", color: "#f0b90b", icon: "₮" },
  { id: "bnb",        name: "BNB",        symbol: "BNB",  color: "#f0b90b", icon: "Ⓑ" },
  { id: "eth",        name: "Ethereum",   symbol: "ETH",  color: "#627eea", icon: "Ξ" },
  { id: "btc",        name: "Bitcoin",    symbol: "BTC",  color: "#f7931a", icon: "₿" },
  { id: "matic",      name: "Polygon",    symbol: "MATIC",color: "#8247e5", icon: "⬡" },
];

const TX_STATUS: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  pending:   { label: "En attente",  color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  Icon: Clock        },
  confirmed: { label: "Confirmé",    color: "#10b981", bg: "rgba(16,185,129,0.15)",  Icon: CheckCircle  },
  disputed:  { label: "Litige",      color: "#ef4444", bg: "rgba(239,68,68,0.15)",   Icon: AlertTriangle},
  cancelled: { label: "Annulé",      color: "#64748b", bg: "rgba(100,116,139,0.15)", Icon: XCircle      },
};

const fmt      = (n: number) => Math.round(n).toLocaleString("fr-FR");
const fmtUSD   = (fcfa: number) => `$${(fcfa / 615).toFixed(2)}`;
const fmtDate  = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
const fmtDatetime = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// ─── MOCK DATA (remplace les appels Supabase si les tables crypto n'existent pas encore) ──

const MOCK_TRANSACTIONS: CryptoTransaction[] = [
  { id: "tx_001", user_id: "u1", type: "buy", crypto: "usdt_trc20", montant_crypto: 50, montant_fcfa: 32000, statut: "confirmed", wallet_adresse: "TXXX1234", seller_id: "s1", created_at: new Date(Date.now() - 3600000).toISOString(), user: { nom_prenom: "Kokou Mensah", username: "kokou" }, seller: { nom_prenom: "Ama Dossou", username: "ama_sell" } },
  { id: "tx_002", user_id: "u2", type: "buy", crypto: "btc",        montant_crypto: 0.002, montant_fcfa: 120000, statut: "pending", wallet_adresse: "bc1qxy", seller_id: "s2", created_at: new Date(Date.now() - 7200000).toISOString(), user: { nom_prenom: "Fatou Ba", username: "fatou_b" }, seller: { nom_prenom: "Moussa Diallo", username: "moussa_btc" } },
  { id: "tx_003", user_id: "u3", type: "buy", crypto: "eth",        montant_crypto: 0.1, montant_fcfa: 65000, statut: "disputed", wallet_adresse: "0xabc123", seller_id: "s1", created_at: new Date(Date.now() - 86400000).toISOString(), user: { nom_prenom: "Ibrahim Traoré", username: "ibra_t" }, seller: { nom_prenom: "Ama Dossou", username: "ama_sell" } },
  { id: "tx_004", user_id: "u4", type: "buy", crypto: "bnb",        montant_crypto: 0.5, montant_fcfa: 18500, statut: "confirmed", wallet_adresse: "0xdef456", seller_id: "s3", created_at: new Date(Date.now() - 172800000).toISOString(), user: { nom_prenom: "Aissatou Diop", username: "aissa_d" }, seller: { nom_prenom: "Seydou Kone", username: "seydou_bnb" } },
  { id: "tx_005", user_id: "u5", type: "buy", crypto: "usdt_bep20", montant_crypto: 100, montant_fcfa: 63000, statut: "confirmed", wallet_adresse: "0xghi789", seller_id: "s2", created_at: new Date(Date.now() - 259200000).toISOString(), user: { nom_prenom: "Lamine Coulibaly", username: "lamine_c" }, seller: { nom_prenom: "Moussa Diallo", username: "moussa_btc" } },
];

const MOCK_OFFERS: CryptoOffer[] = [
  { id: "o1", seller_id: "s1", crypto: "usdt_trc20", taux: 640, montant_min: 5000, montant_max: 500000, disponible: 500, actif: true, created_at: new Date(Date.now() - 86400000).toISOString(), seller: { nom_prenom: "Ama Dossou", username: "ama_sell" }, completed_trades: 47 },
  { id: "o2", seller_id: "s2", crypto: "btc",        taux: 60000000, montant_min: 10000, montant_max: 1000000, disponible: 0.01, actif: true, created_at: new Date(Date.now() - 172800000).toISOString(), seller: { nom_prenom: "Moussa Diallo", username: "moussa_btc" }, completed_trades: 23 },
  { id: "o3", seller_id: "s3", crypto: "bnb",        taux: 37000, montant_min: 2000, montant_max: 200000, disponible: 5, actif: false, created_at: new Date(Date.now() - 259200000).toISOString(), seller: { nom_prenom: "Seydou Kone", username: "seydou_bnb" }, completed_trades: 12 },
  { id: "o4", seller_id: "s1", crypto: "eth",        taux: 650000, montant_min: 10000, montant_max: 2000000, disponible: 0.5, actif: true, created_at: new Date(Date.now() - 345600000).toISOString(), seller: { nom_prenom: "Ama Dossou", username: "ama_sell" }, completed_trades: 8 },
];

const MOCK_DISPUTES: CryptoDispute[] = [
  { id: "d1", transaction_id: "tx_003", user_id: "u3", seller_id: "s1", raison: "La crypto n'a pas été envoyée après paiement confirmé.", statut: "open", created_at: new Date(Date.now() - 86400000).toISOString(), user: { nom_prenom: "Ibrahim Traoré", username: "ibra_t" }, seller: { nom_prenom: "Ama Dossou", username: "ama_sell" } },
];

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function CryptoAdminPanelPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [codeInput, setCodeInput]         = useState("");
  const [codeError, setCodeError]         = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<CryptoAdminTab>("stats");
  const [loading, setLoading] = useState(false);

  const [transactions, setTransactions] = useState<CryptoTransaction[]>(MOCK_TRANSACTIONS);
  const [offers, setOffers]             = useState<CryptoOffer[]>(MOCK_OFFERS);
  const [disputes, setDisputes]         = useState<CryptoDispute[]>(MOCK_DISPUTES);
  const [users, setUsers]               = useState<CryptoUser[]>([]);

  const [searchTx,    setSearchTx]    = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterCrypto, setFilterCrypto] = useState("");
  const [searchOffer,  setSearchOffer]  = useState("");
  const [searchUser,   setSearchUser]   = useState("");

  const [expandedTx,    setExpandedTx]    = useState<string | null>(null);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);

  // ── Stats calculées ──
  const stats: CryptoStats = {
    totalTransactions:     transactions.length,
    volumeTotal:           transactions.reduce((s, t) => s + t.montant_fcfa, 0),
    volumeUSD:             transactions.reduce((s, t) => s + t.montant_fcfa / 615, 0),
    transactionsPending:   transactions.filter(t => t.statut === "pending").length,
    transactionsConfirmed: transactions.filter(t => t.statut === "confirmed").length,
    transactionsDisputed:  transactions.filter(t => t.statut === "disputed").length,
    totalOffers:           offers.length,
    offresActives:         offers.filter(o => o.actif).length,
    totalVendeurs:         [...new Set(offers.map(o => o.seller_id))].length,
    totalAcheteurs:        [...new Set(transactions.map(t => t.user_id))].length,
    fraisTotal:            transactions.filter(t => t.statut === "confirmed").reduce((s, t) => s + t.montant_fcfa * 0.015, 0),
    newTransactionsToday:  transactions.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString()).length,
  };

  // ── Auth ──
  useEffect(() => {
    try {
      const auth = sessionStorage.getItem("nexora_crypto_admin_auth");
      if (auth === "true") setIsAuthenticated(true);
    } catch {}
  }, []);

  const handleLogin = () => {
    if (codeInput.trim().toUpperCase() === ADMIN_CODE) {
      try { sessionStorage.setItem("nexora_crypto_admin_auth", "true"); } catch {}
      setIsAuthenticated(true);
      setCodeError(false);
    } else {
      setCodeError(true);
      setCodeInput("");
    }
  };

  // ── Load data from Supabase (si tables existantes) ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Utilisateurs
      const { data: usersData } = await supabase
        .from("nexora_users")
        .select("id, nom_prenom, username, email, avatar_url, created_at, is_active, status, plan")
        .order("created_at", { ascending: false });
      if (usersData) setUsers(usersData as CryptoUser[]);

      // Transactions crypto (table à créer si elle n'existe pas encore)
      // const { data: txData } = await supabase.from("crypto_transactions").select("*, user:nexora_users!user_id(nom_prenom,username), seller:nexora_users!seller_id(nom_prenom,username)").order("created_at", { ascending: false });
      // if (txData) setTransactions(txData as CryptoTransaction[]);

    } catch (err) {
      console.warn("Erreur chargement crypto admin:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, loadData]);

  // ── Actions ──
  const toggleOffer = (offerId: string) => {
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, actif: !o.actif } : o));
    toast({ title: "Annonce mise à jour", description: "Le statut de l'annonce a été modifié." });
  };

  const resolveDispute = (disputeId: string, favor: "buyer" | "seller") => {
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, statut: "resolved" } : d));
    const txId = disputes.find(d => d.id === disputeId)?.transaction_id;
    if (txId) {
      setTransactions(prev => prev.map(t =>
        t.id === txId ? { ...t, statut: favor === "buyer" ? "cancelled" : "confirmed" } : t
      ));
    }
    toast({ title: "Litige résolu", description: `Résolution en faveur de l'${favor === "buyer" ? "acheteur" : "vendeur"}.` });
  };

  const cancelTransaction = (txId: string) => {
    if (!window.confirm("Annuler cette transaction ?")) return;
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, statut: "cancelled" } : t));
    toast({ title: "Transaction annulée" });
  };

  const confirmTransaction = (txId: string) => {
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, statut: "confirmed" } : t));
    toast({ title: "Transaction confirmée", description: "La livraison de crypto a été confirmée." });
  };

  // ── Tabs nav ──
  const TABS = [
    { id: "stats",        label: "Vue d'ensemble",    Icon: BarChart3,       badge: 0 },
    { id: "transactions", label: "Transactions",       Icon: ArrowRightLeft,  badge: stats.transactionsPending },
    { id: "offers",       label: "Annonces P2P",       Icon: Package,         badge: 0 },
    { id: "users",        label: "Utilisateurs",       Icon: Users,           badge: 0 },
    { id: "disputes",     label: "Litiges",            Icon: AlertTriangle,   badge: disputes.filter(d => d.statut === "open").length },
    { id: "logs",         label: "Logs & Activité",    Icon: Activity,        badge: 0 },
  ] as const;

  // ─── ÉCRAN LOGIN ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #06090f 0%, #0d1526 100%)" }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, padding: 36, width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(245,158,11,0.35)" }}>
              <span style={{ fontSize: 28 }}>₿</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 6 }}>Crypto Admin</h1>
            <p style={{ color: C.muted, fontSize: 14 }}>Espace d'administration sécurisé</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              value={codeInput}
              onChange={e => { setCodeInput(e.target.value); setCodeError(false); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Code d'accès admin"
              autoFocus
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${codeError ? C.red : C.border}`,
                borderRadius: 12, padding: "14px 18px",
                color: C.text, fontSize: 16, fontWeight: 700,
                textAlign: "center", letterSpacing: 6, outline: "none",
              }}
            />
            {codeError && <p style={{ color: C.red, fontSize: 13, textAlign: "center", marginTop: 8 }}>Code incorrect</p>}
          </div>
          <button
            onClick={handleLogin}
            style={{ width: "100%", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 12, padding: "14px", cursor: "pointer" }}>
            Accéder au Panel Crypto
          </button>
          <button onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px auto 0", background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>
            <ArrowLeft size={16} /> Retour
          </button>
        </div>
      </div>
    );
  }

  // ─── PANEL PRINCIPAL ──────────────────────────────────────────────────────

  // Filtres transactions
  const filteredTx = transactions.filter(t => {
    const matchSearch = !searchTx || t.user?.nom_prenom.toLowerCase().includes(searchTx.toLowerCase()) || t.user?.username.toLowerCase().includes(searchTx.toLowerCase()) || t.id.includes(searchTx);
    const matchStatut = !filterStatut || t.statut === filterStatut;
    const matchCrypto = !filterCrypto || t.crypto === filterCrypto;
    return matchSearch && matchStatut && matchCrypto;
  });

  // Filtres offres
  const filteredOffers = offers.filter(o =>
    !searchOffer || o.seller?.nom_prenom.toLowerCase().includes(searchOffer.toLowerCase()) || o.crypto.includes(searchOffer)
  );

  // Filtres users
  const filteredUsers = users.filter(u =>
    !searchUser || u.nom_prenom.toLowerCase().includes(searchUser.toLowerCase()) || u.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  const Chip = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap" }}>{label}</span>
  );

  const getCrypto = (id: string) => CRYPTOS_LIST.find(c => c.id === id) || CRYPTOS_LIST[0];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>

      {/* Overlay menu */}
      {menuOpen && <div style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.7)" }} onClick={() => setMenuOpen(false)} />}

      {/* Sidebar */}
      <div style={{
        position: "fixed", top: 0, left: 0, height: "100%", zIndex: 50, width: 280,
        background: "#04070e", borderRight: `1px solid ${C.border}`,
        boxShadow: "4px 0 30px rgba(0,0,0,0.5)",
        transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
        display: "flex", flexDirection: "column",
      }}>
        {/* Sidebar header */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>₿</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: C.text }}>Crypto Admin</div>
              <div style={{ fontSize: 11, color: C.muted }}>Panel P2P</div>
            </div>
          </div>
          <button onClick={() => setMenuOpen(false)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", padding: 4 }}><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => { setTab(t.id as CryptoAdminTab); setMenuOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  borderRadius: 12, marginBottom: 4, border: "none", cursor: "pointer", textAlign: "left",
                  background: active ? "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.1))" : "transparent",
                  color: active ? C.gold : C.muted,
                  fontWeight: active ? 700 : 500, fontSize: 14,
                  borderLeft: active ? `3px solid ${C.gold}` : "3px solid transparent",
                }}>
                <t.Icon size={17} />
                <span style={{ flex: 1 }}>{t.label}</span>
                {t.badge > 0 && (
                  <span style={{ background: C.red, color: "#fff", fontSize: 11, fontWeight: 800, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{ padding: "12px", borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => navigate("/admin")}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.04)", color: C.muted, fontSize: 13, marginBottom: 8 }}>
            <ShieldCheck size={15} /> Panel Admin Principal
          </button>
          <button onClick={() => navigate(-1)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: C.muted, fontSize: 13, marginBottom: 8 }}>
            <ArrowLeft size={15} /> Retour
          </button>
          <button onClick={() => { try { sessionStorage.removeItem("nexora_crypto_admin_auth"); } catch {} setIsAuthenticated(false); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: "rgba(239,68,68,0.08)", color: C.red, fontSize: 13 }}>
            <XCircle size={15} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(6,9,15,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setMenuOpen(true)} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 10, padding: 8, cursor: "pointer", color: C.text }}>
          <Menu size={18} />
        </button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>₿</div>
          <span style={{ fontWeight: 900, fontSize: 16, color: C.text }}>
            {TABS.find(t => t.id === tab)?.label ?? "Crypto Admin"}
          </span>
        </div>
        {disputes.filter(d => d.statut === "open").length > 0 && tab !== "disputes" && (
          <button onClick={() => setTab("disputes")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "rgba(239,68,68,0.15)", border: `1px solid rgba(239,68,68,0.3)`, color: C.red, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <AlertTriangle size={13} /> {disputes.filter(d => d.statut === "open").length} litige(s) ouvert(s)
          </button>
        )}
        <button onClick={loadData} disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 80px" }}>

        {/* ══ STATS ══════════════════════════════════════════════════════════ */}
        {tab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* KPIs principaux */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {[
                { label: "Volume Total", value: `${fmt(stats.volumeTotal)} FCFA`, sub: fmtUSD(stats.volumeTotal), color: C.gold, icon: "💰" },
                { label: "Transactions", value: stats.totalTransactions, sub: `${stats.newTransactionsToday} aujourd'hui`, color: C.blue, icon: "↔" },
                { label: "Confirmées", value: stats.transactionsConfirmed, sub: `${stats.transactionsPending} en attente`, color: C.green, icon: "✓" },
                { label: "Litiges", value: stats.transactionsDisputed, sub: `${disputes.filter(d => d.statut === "open").length} ouverts`, color: C.red, icon: "⚠" },
                { label: "Vendeurs", value: stats.totalVendeurs, sub: `${stats.offresActives} annonces actives`, color: C.purple, icon: "🏪" },
                { label: "Frais Générés", value: `${fmt(stats.fraisTotal)} FCFA`, sub: fmtUSD(stats.fraisTotal), color: C.cyan, icon: "%" },
              ].map(s => (
                <div key={s.label} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `3px solid ${s.color}`, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, opacity: 0.7 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Répartition par crypto */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: C.text }}>📊 Volume par Crypto</div>
              {CRYPTOS_LIST.map(cr => {
                const vol = transactions.filter(t => t.crypto === cr.id).reduce((s, t) => s + t.montant_fcfa, 0);
                const pct = stats.volumeTotal > 0 ? (vol / stats.volumeTotal) * 100 : 0;
                if (vol === 0) return null;
                return (
                  <div key={cr.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{cr.icon} {cr.name}</span>
                      <span style={{ color: C.muted, fontSize: 13 }}>{fmt(vol)} FCFA ({pct.toFixed(1)}%)</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: cr.color, borderRadius: 99, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dernières transactions */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: C.text }}>⚡ Transactions Récentes</div>
              {transactions.slice(0, 5).map(t => {
                const cr = getCrypto(t.crypto);
                const st = TX_STATUS[t.statut];
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cr.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: cr.color, flexShrink: 0 }}>{cr.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{t.user?.nom_prenom ?? "—"}</div>
                      <div style={{ color: C.muted, fontSize: 11 }}>{t.montant_crypto} {cr.symbol} · {fmt(t.montant_fcfa)} FCFA</div>
                    </div>
                    <Chip label={st.label} color={st.color} bg={st.bg} />
                    <div style={{ color: C.muted, fontSize: 11, flexShrink: 0 }}>{fmtDate(t.created_at)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ TRANSACTIONS ══════════════════════════════════════════════════ */}
        {tab === "transactions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Filtres */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
              <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
                <input value={searchTx} onChange={e => setSearchTx(e.target.value)}
                  placeholder="Rechercher (utilisateur, ID...)"
                  style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px 9px 34px", color: C.text, fontSize: 13, outline: "none" }} />
              </div>
              <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13, cursor: "pointer" }}>
                <option value="">Tous les statuts</option>
                {Object.entries(TX_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterCrypto} onChange={e => setFilterCrypto(e.target.value)}
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13, cursor: "pointer" }}>
                <option value="">Toutes les cryptos</option>
                {CRYPTOS_LIST.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ color: C.muted, fontSize: 13 }}>{filteredTx.length} transaction(s)</div>

            {filteredTx.map(t => {
              const cr = getCrypto(t.crypto);
              const st = TX_STATUS[t.statut];
              const expanded = expandedTx === t.id;
              return (
                <div key={t.id} style={{ background: C.bgCard, border: `1px solid ${expanded ? C.gold : C.border}`, borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" }}>
                  <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                    onClick={() => setExpandedTx(expanded ? null : t.id)}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${cr.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: cr.color, flexShrink: 0 }}>{cr.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{t.user?.nom_prenom ?? "Inconnu"} <span style={{ color: C.muted, fontWeight: 500 }}>→ {t.seller?.nom_prenom ?? "Vendeur"}</span></div>
                      <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{t.montant_crypto} {cr.symbol} · {fmt(t.montant_fcfa)} FCFA · {fmtDate(t.created_at)}</div>
                    </div>
                    <Chip label={st.label} color={st.color} bg={st.bg} />
                    {expanded ? <ChevronUp size={16} style={{ color: C.muted }} /> : <ChevronDown size={16} style={{ color: C.muted }} />}
                  </div>
                  {expanded && (
                    <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.border}` }}>
                      <div style={{ paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                        {[
                          { label: "ID Transaction", value: t.id },
                          { label: "Crypto", value: `${cr.name} (${cr.symbol})` },
                          { label: "Montant Crypto", value: `${t.montant_crypto} ${cr.symbol}` },
                          { label: "Montant FCFA", value: `${fmt(t.montant_fcfa)} FCFA` },
                          { label: "Équivalent USD", value: fmtUSD(t.montant_fcfa) },
                          { label: "Adresse Wallet", value: t.wallet_adresse ?? "—" },
                          { label: "Acheteur", value: `@${t.user?.username ?? "—"}` },
                          { label: "Vendeur", value: `@${t.seller?.username ?? "—"}` },
                          { label: "Date", value: fmtDatetime(t.created_at) },
                          { label: "Statut", value: st.label },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <div style={{ color: C.muted, fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{label}</div>
                            <div style={{ color: C.text, fontSize: 13, fontWeight: 600, wordBreak: "break-all" }}>{value}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {t.statut === "pending" && (
                          <button onClick={() => confirmTransaction(t.id)}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
                            <CheckCircle size={14} /> Confirmer livraison
                          </button>
                        )}
                        {(t.statut === "pending" || t.statut === "paid") && (
                          <button onClick={() => cancelTransaction(t.id)}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, background: "rgba(239,68,68,0.12)", color: C.red, fontWeight: 700, fontSize: 13, border: `1px solid rgba(239,68,68,0.3)`, cursor: "pointer" }}>
                            <XCircle size={14} /> Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredTx.length === 0 && (
              <div style={{ textAlign: "center", padding: 48, color: C.muted }}>
                <ArrowRightLeft size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <div>Aucune transaction trouvée</div>
              </div>
            )}
          </div>
        )}

        {/* ══ ANNONCES P2P ══════════════════════════════════════════════════ */}
        {tab === "offers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
                <input value={searchOffer} onChange={e => setSearchOffer(e.target.value)}
                  placeholder="Rechercher un vendeur ou une crypto..."
                  style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px 9px 34px", color: C.text, fontSize: 13, outline: "none" }} />
              </div>
            </div>

            <div style={{ color: C.muted, fontSize: 13 }}>{filteredOffers.length} annonce(s)</div>

            {filteredOffers.map(o => {
              const cr = getCrypto(o.crypto);
              const expanded = expandedOffer === o.id;
              return (
                <div key={o.id} style={{ background: C.bgCard, border: `1px solid ${expanded ? C.gold : C.border}`, borderRadius: 16, overflow: "hidden" }}>
                  <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                    onClick={() => setExpandedOffer(expanded ? null : o.id)}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${cr.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: cr.color, flexShrink: 0 }}>{cr.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{o.seller?.nom_prenom ?? "Vendeur"} <span style={{ color: C.muted, fontWeight: 500 }}>· {cr.name}</span></div>
                      <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                        Taux: {fmt(o.taux)} FCFA · Dispo: {o.disponible} {cr.symbol} · {o.completed_trades ?? 0} trades
                      </div>
                    </div>
                    <Chip label={o.actif ? "Active" : "Inactive"} color={o.actif ? C.green : C.muted} bg={o.actif ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.12)"} />
                    {expanded ? <ChevronUp size={16} style={{ color: C.muted }} /> : <ChevronDown size={16} style={{ color: C.muted }} />}
                  </div>
                  {expanded && (
                    <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.border}` }}>
                      <div style={{ paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                        {[
                          { label: "Vendeur", value: `@${o.seller?.username ?? "—"}` },
                          { label: "Crypto", value: cr.name },
                          { label: "Taux", value: `${fmt(o.taux)} FCFA/${cr.symbol}` },
                          { label: "Minimum", value: `${fmt(o.montant_min)} FCFA` },
                          { label: "Maximum", value: `${fmt(o.montant_max)} FCFA` },
                          { label: "Disponible", value: `${o.disponible} ${cr.symbol}` },
                          { label: "Trades Complétés", value: o.completed_trades ?? 0 },
                          { label: "Créée le", value: fmtDate(o.created_at) },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <div style={{ color: C.muted, fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{label}</div>
                            <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{value}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => toggleOffer(o.id)}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, background: o.actif ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: o.actif ? C.red : C.green, fontWeight: 700, fontSize: 13, border: `1px solid ${o.actif ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, cursor: "pointer" }}>
                          {o.actif ? <><EyeOff size={14} /> Désactiver</> : <><Eye size={14} /> Activer</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredOffers.length === 0 && (
              <div style={{ textAlign: "center", padding: 48, color: C.muted }}>
                <Package size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <div>Aucune annonce trouvée</div>
              </div>
            )}
          </div>
        )}

        {/* ══ UTILISATEURS ══════════════════════════════════════════════════ */}
        {tab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
                <input value={searchUser} onChange={e => setSearchUser(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px 9px 34px", color: C.text, fontSize: 13, outline: "none" }} />
              </div>
            </div>

            {filteredUsers.length === 0 && users.length === 0 && (
              <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, textAlign: "center" }}>
                <Users size={40} style={{ color: C.muted, margin: "0 auto 12px" }} />
                <div style={{ color: C.text, fontWeight: 700, marginBottom: 6 }}>Données depuis Supabase</div>
                <div style={{ color: C.muted, fontSize: 13 }}>Les utilisateurs Nexora seront listés ici après actualisation.</div>
                <button onClick={loadData} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
                  Charger les utilisateurs
                </button>
              </div>
            )}

            {filteredUsers.map(u => {
              const txCount = transactions.filter(t => t.user_id === u.id).length;
              const vol = transactions.filter(t => t.user_id === u.id).reduce((s, t) => s + t.montant_fcfa, 0);
              const isSeller = offers.some(o => o.seller_id === u.id);
              return (
                <div key={u.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#1a2d4d,#0d1526)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: C.gold, flexShrink: 0 }}>
                    {u.nom_prenom?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{u.nom_prenom} <span style={{ color: C.muted, fontWeight: 500 }}>@{u.username}</span></div>
                    <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                      {txCount} tx · {fmt(vol)} FCFA · Inscrit le {fmtDate(u.created_at)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {isSeller && <Chip label="Vendeur" color={C.purple} bg="rgba(139,92,246,0.15)" />}
                    <Chip label={u.status === "actif" ? "Actif" : "Suspendu"} color={u.status === "actif" ? C.green : C.red} bg={u.status === "actif" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ LITIGES ══════════════════════════════════════════════════════ */}
        {tab === "disputes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {disputes.length === 0 && (
              <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 48, textAlign: "center" }}>
                <CheckCircle size={44} style={{ color: C.green, margin: "0 auto 12px" }} />
                <div style={{ color: C.text, fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Aucun litige ouvert</div>
                <div style={{ color: C.muted, fontSize: 13 }}>Toutes les transactions se passent bien ! 🎉</div>
              </div>
            )}

            {disputes.map(d => {
              const tx = transactions.find(t => t.id === d.transaction_id);
              const cr = tx ? getCrypto(tx.crypto) : null;
              const isOpen = d.statut === "open";
              return (
                <div key={d.id} style={{ background: C.bgCard, border: `1px solid ${isOpen ? "rgba(239,68,68,0.4)" : C.border}`, borderRadius: 16, overflow: "hidden" }}>
                  {isOpen && <div style={{ height: 3, background: "linear-gradient(90deg,#ef4444,#dc2626)" }} />}
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <AlertTriangle size={18} style={{ color: C.red, flexShrink: 0 }} />
                      <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>Litige #{d.id.slice(-6).toUpperCase()}</span>
                      <Chip label={isOpen ? "Ouvert" : "Résolu"} color={isOpen ? C.red : C.green} bg={isOpen ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"} />
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                      <div style={{ color: C.muted, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>RAISON DU LITIGE</div>
                      <div style={{ color: C.text, fontSize: 13 }}>{d.raison}</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                      <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: 12 }}>
                        <div style={{ color: C.blue, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>👤 ACHETEUR</div>
                        <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{d.user?.nom_prenom ?? "—"}</div>
                        <div style={{ color: C.muted, fontSize: 11 }}>@{d.user?.username ?? "—"}</div>
                      </div>
                      <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: 12 }}>
                        <div style={{ color: C.purple, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>🏪 VENDEUR</div>
                        <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{d.seller?.nom_prenom ?? "—"}</div>
                        <div style={{ color: C.muted, fontSize: 11 }}>@{d.seller?.username ?? "—"}</div>
                      </div>
                    </div>

                    {tx && cr && (
                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, marginBottom: 14, display: "flex", gap: 20 }}>
                        <div>
                          <div style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>TRANSACTION</div>
                          <div style={{ color: C.text, fontSize: 13, fontWeight: 700, marginTop: 2 }}>{tx.montant_crypto} {cr.symbol} · {fmt(tx.montant_fcfa)} FCFA</div>
                        </div>
                        <div>
                          <div style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>DATE</div>
                          <div style={{ color: C.text, fontSize: 13, fontWeight: 700, marginTop: 2 }}>{fmtDatetime(d.created_at)}</div>
                        </div>
                      </div>
                    )}

                    {isOpen && (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button onClick={() => resolveDispute(d.id, "buyer")}
                          style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 10, background: "rgba(59,130,246,0.15)", color: C.blue, fontWeight: 700, fontSize: 13, border: `1px solid rgba(59,130,246,0.3)`, cursor: "pointer" }}>
                          <CheckCircle size={15} /> Résoudre → Acheteur
                        </button>
                        <button onClick={() => resolveDispute(d.id, "seller")}
                          style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 10, background: "rgba(139,92,246,0.15)", color: C.purple, fontWeight: 700, fontSize: 13, border: `1px solid rgba(139,92,246,0.3)`, cursor: "pointer" }}>
                          <CheckCircle size={15} /> Résoudre → Vendeur
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ LOGS ══════════════════════════════════════════════════════════ */}
        {tab === "logs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📋 Journal d'Activité Crypto</div>
              {[
                ...transactions.map(t => ({ date: t.created_at, type: "transaction", label: `Transaction ${t.statut} · ${t.montant_crypto} ${getCrypto(t.crypto).symbol} · ${t.user?.nom_prenom}`, color: TX_STATUS[t.statut].color })),
                ...offers.map(o => ({ date: o.created_at, type: "offer", label: `Annonce créée · ${getCrypto(o.crypto).name} · ${o.seller?.nom_prenom}`, color: C.purple })),
                ...disputes.map(d => ({ date: d.created_at, type: "dispute", label: `Litige ${d.statut} · ${d.user?.nom_prenom} vs ${d.seller?.nom_prenom}`, color: C.red })),
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: log.color, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: C.text }}>{log.label}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{fmtDatetime(log.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
