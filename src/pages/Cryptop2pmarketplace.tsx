import { useState, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const COLORS = {
  bg: { dark: "#0a0f1e", light: "#f0f4ff" },
  card: { dark: "#111827", light: "#ffffff" },
  cardBorder: { dark: "#1e2d45", light: "#dde6f7" },
  primary: "#f59e0b",
  primaryDark: "#d97706",
  green: "#10b981",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  text: { dark: "#f1f5f9", light: "#0f172a" },
  muted: { dark: "#64748b", light: "#64748b" },
  sidebar: { dark: "#080d1a", light: "#1a2540" },
};

// ─── CRYPTO DATA ─────────────────────────────────────────────────────────────
const CRYPTOS = [
  { id: "usdt_trc20", name: "USDT TRC20", symbol: "USDT", network: "TRON", color: "#26a17b", icon: "₮", addrRegex: /^T[A-Za-z1-9]{33}$/, addrExample: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
  { id: "usdt_bep20", name: "USDT BEP20", symbol: "USDT", network: "BSC", color: "#f0b90b", icon: "₮", addrRegex: /^0x[0-9a-fA-F]{40}$/, addrExample: "0x..." },
  { id: "bnb", name: "BNB", symbol: "BNB", network: "BSC", color: "#f0b90b", icon: "Ⓑ", addrRegex: /^0x[0-9a-fA-F]{40}$/, addrExample: "0x..." },
  { id: "eth", name: "Ethereum", symbol: "ETH", network: "ERC20", color: "#627eea", icon: "Ξ", addrRegex: /^0x[0-9a-fA-F]{40}$/, addrExample: "0x..." },
  { id: "btc", name: "Bitcoin", symbol: "BTC", network: "BTC", color: "#f7931a", icon: "₿", addrRegex: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/, addrExample: "bc1..." },
  { id: "matic", name: "Polygon", symbol: "MATIC", network: "POLYGON", color: "#8247e5", icon: "⬡", addrRegex: /^0x[0-9a-fA-F]{40}$/, addrExample: "0x..." },
];

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const MOCK_OFFERS = [
  { id: "o1", sellerId: "v1", sellerName: "EricPro", sellerAvatar: "E", verified: true, crypto: "usdt_trc20", rate: 650, minAmount: 10, maxAmount: 5000, available: 15000, paymentMethods: ["MTN MoMo", "Moov Money"], completedTrades: 247, successRate: 99.2, online: true },
  { id: "o2", sellerId: "v2", sellerName: "CryptoKing", sellerAvatar: "C", verified: true, crypto: "usdt_trc20", rate: 648, minAmount: 20, maxAmount: 10000, available: 50000, paymentMethods: ["Orange Money", "MTN MoMo"], completedTrades: 523, successRate: 98.7, online: true },
  { id: "o3", sellerId: "v3", sellerName: "AfriTrade", sellerAvatar: "A", verified: true, crypto: "bnb", rate: 285000, minAmount: 0.01, maxAmount: 10, available: 25, paymentMethods: ["MTN MoMo"], completedTrades: 189, successRate: 97.5, online: false },
  { id: "o4", sellerId: "v4", sellerName: "WestCoast", sellerAvatar: "W", verified: false, crypto: "eth", rate: 3200000, minAmount: 0.001, maxAmount: 2, available: 5, paymentMethods: ["Wave", "Orange Money"], completedTrades: 45, successRate: 95.0, online: true },
  { id: "o5", sellerId: "v5", sellerName: "DigitalXOF", sellerAvatar: "D", verified: true, crypto: "usdt_bep20", rate: 645, minAmount: 5, maxAmount: 2000, available: 8000, paymentMethods: ["Moov Money", "Flooz"], completedTrades: 312, successRate: 99.5, online: true },
  { id: "o6", sellerId: "v6", sellerName: "BitAfrica", sellerAvatar: "B", verified: true, crypto: "btc", rate: 45000000, minAmount: 0.0001, maxAmount: 0.1, available: 0.5, paymentMethods: ["MTN MoMo", "Orange Money"], completedTrades: 88, successRate: 96.8, online: false },
];

const MOCK_ORDERS = [
  { id: "CMD-001", crypto: "usdt_trc20", amount: 50, amountFCFA: 32500, walletAddr: "TXm3xyz...qr9", seller: "EricPro", status: "confirmed", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "CMD-002", crypto: "bnb", amount: 0.5, amountFCFA: 142500, walletAddr: "0x9a8b...ef12", seller: "AfriTrade", status: "delivered", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "CMD-003", crypto: "usdt_trc20", amount: 100, amountFCFA: 65000, walletAddr: "TRx5abc...mn7", seller: "CryptoKing", status: "pending", createdAt: new Date(Date.now() - 3600000).toISOString() },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => Math.round(n).toLocaleString("fr-FR");
const getCrypto = (id) => CRYPTOS.find(c => c.id === id) || CRYPTOS[0];
const statusConfig = {
  pending:   { label: "En attente", color: "#f59e0b", bg: "#fef3c7" },
  paid:      { label: "Payé", color: "#3b82f6", bg: "#dbeafe" },
  delivered: { label: "Livré", color: "#8b5cf6", bg: "#ede9fe" },
  confirmed: { label: "Confirmé", color: "#10b981", bg: "#d1fae5" },
  disputed:  { label: "Litige", color: "#ef4444", bg: "#fee2e2" },
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("landing"); // landing | login | register | marketplace | dashboard | buy | seller | admin
  const [user, setUser] = useState(null);
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState("usdt_trc20");
  const [notification, setNotification] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const isDark = theme === "dark";
  const c = (darkVal, lightVal) => isDark ? darkVal : lightVal;

  const notify = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setPage("marketplace");
    notify(`Bienvenue, ${userData.name} ! 🎉`);
  };

  const logout = () => {
    setUser(null);
    setPage("landing");
    notify("Déconnexion réussie", "info");
  };

  const navigate = (p, opts = {}) => {
    if (opts.offer) setSelectedOffer(opts.offer);
    setPage(p);
    setMobileMenu(false);
    window.scrollTo(0, 0);
  };

  // ─── STYLES ────────────────────────────────────────────────────────────────
  const styles = {
    app: { minHeight: "100vh", background: c(COLORS.bg.dark, COLORS.bg.light), color: c(COLORS.text.dark, COLORS.text.light), fontFamily: "'Inter', -apple-system, sans-serif", transition: "all 0.3s" },
    card: { background: c(COLORS.card.dark, COLORS.card.light), border: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}`, borderRadius: 16, padding: 24 },
    btn: (variant = "primary", size = "md") => ({
      primary: { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: "#000", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: 10, padding: size === "sm" ? "8px 16px" : "12px 24px", fontSize: size === "sm" ? 13 : 15, transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8 },
      secondary: { background: c("rgba(255,255,255,0.08)", "rgba(0,0,0,0.06)"), color: c(COLORS.text.dark, COLORS.text.light), fontWeight: 600, border: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}`, cursor: "pointer", borderRadius: 10, padding: size === "sm" ? "8px 16px" : "12px 24px", fontSize: size === "sm" ? 13 : 15, transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8 },
      green: { background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: 10, padding: size === "sm" ? "8px 16px" : "12px 24px", fontSize: size === "sm" ? 13 : 15, transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8 },
      red: { background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: 10, padding: size === "sm" ? "8px 16px" : "12px 24px", fontSize: size === "sm" ? 13 : 15, transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8 },
      ghost: { background: "transparent", color: c(COLORS.muted.dark, COLORS.muted.light), fontWeight: 500, border: "none", cursor: "pointer", borderRadius: 10, padding: size === "sm" ? "8px 16px" : "12px 24px", fontSize: size === "sm" ? 13 : 15, transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8 },
    }[variant] || {},
    input: { background: c("rgba(255,255,255,0.05)", "rgba(0,0,0,0.04)"), border: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}`, borderRadius: 10, padding: "12px 16px", color: c(COLORS.text.dark, COLORS.text.light), fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" },
  };

  return (
    <div style={styles.app}>
      {/* Notification Toast */}
      {notification && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: notification.type === "success" ? COLORS.green : notification.type === "error" ? COLORS.red : COLORS.blue, color: "#fff", padding: "14px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", maxWidth: 350, animation: "slideIn 0.3s ease" }}>
          {notification.type === "success" ? "✅ " : notification.type === "error" ? "❌ " : "ℹ️ "}{notification.msg}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        input::placeholder { color: #64748b; }
        button:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      {/* ROUTER */}
      {page === "landing" && <LandingPage styles={styles} c={c} isDark={isDark} navigate={navigate} theme={theme} setTheme={setTheme} />}
      {page === "login" && <LoginPage styles={styles} c={c} isDark={isDark} navigate={navigate} login={login} notify={notify} />}
      {page === "register" && <RegisterPage styles={styles} c={c} isDark={isDark} navigate={navigate} login={login} notify={notify} />}
      {page === "marketplace" && <MarketplacePage styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} offers={offers} selectedCrypto={selectedCrypto} setSelectedCrypto={setSelectedCrypto} theme={theme} setTheme={setTheme} notify={notify} />}
      {page === "buy" && <BuyPage styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} offer={selectedOffer} orders={orders} setOrders={setOrders} notify={notify} />}
      {page === "dashboard" && <DashboardPage styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} orders={orders} setOrders={setOrders} notify={notify} theme={theme} setTheme={setTheme} />}
      {page === "seller" && <SellerPage styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} offers={offers} setOffers={setOffers} orders={orders} setOrders={setOrders} notify={notify} theme={theme} setTheme={setTheme} />}
      {page === "admin" && <AdminPage styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} offers={offers} orders={orders} setOrders={setOrders} notify={notify} theme={theme} setTheme={setTheme} />}
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ styles, c, isDark, navigate, user, logout, page, theme, setTheme }) {
  const [mob, setMob] = useState(false);
  return (
    <nav style={{ background: c("rgba(10,15,30,0.95)", "rgba(255,255,255,0.95)"), backdropFilter: "blur(20px)", borderBottom: `1px solid ${c("rgba(255,255,255,0.08)", "rgba(0,0,0,0.08)")}`, position: "sticky", top: 0, zIndex: 100, padding: "0 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <div onClick={() => navigate(user ? "marketplace" : "landing")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#000" }}>₿</div>
          <span style={{ fontWeight: 900, fontSize: 20, background: "linear-gradient(135deg, #f59e0b, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CryptoP2P</span>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {user && <button onClick={() => navigate("marketplace")} style={{ ...styles.btn("ghost", "sm"), fontSize: 14 }}>Marketplace</button>}
          {user && <button onClick={() => navigate("dashboard")} style={{ ...styles.btn("ghost", "sm"), fontSize: 14 }}>Mon compte</button>}
          {user?.isSeller && <button onClick={() => navigate("seller")} style={{ ...styles.btn("ghost", "sm"), fontSize: 14 }}>Vendeur</button>}
          {user?.isAdmin && <button onClick={() => navigate("admin")} style={{ ...styles.btn("ghost", "sm"), fontSize: 14 }}>Admin</button>}
          
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ ...styles.btn("secondary", "sm"), padding: "8px 12px", fontSize: 16 }}>{theme === "dark" ? "☀️" : "🌙"}</button>
          
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#000", fontSize: 14 }}>{user.name[0]}</div>
              <button onClick={logout} style={{ ...styles.btn("secondary", "sm") }}>Déconnexion</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigate("login")} style={styles.btn("secondary", "sm")}>Connexion</button>
              <button onClick={() => navigate("register")} style={styles.btn("primary", "sm")}>S'inscrire</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ styles, c, isDark, navigate, theme, setTheme }) {
  const stats = [
    { label: "Transactions", value: "12,847+", icon: "🔄" },
    { label: "Vendeurs vérifiés", value: "234", icon: "✅" },
    { label: "Volume (FCFA)", value: "2.4Md+", icon: "💰" },
    { label: "Pays couverts", value: "14", icon: "🌍" },
  ];

  return (
    <div>
      <Navbar styles={styles} c={c} isDark={isDark} navigate={navigate} user={null} logout={() => {}} page="landing" theme={theme} setTheme={setTheme} />
      
      {/* Hero */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 60px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: c("rgba(245,158,11,0.1)", "rgba(245,158,11,0.1)"), border: "1px solid rgba(245,158,11,0.3)", borderRadius: 100, padding: "6px 16px", fontSize: 13, fontWeight: 600, color: COLORS.primary, marginBottom: 24 }}>
            <span style={{ animation: "pulse 2s infinite", color: COLORS.green }}>●</span> Plateforme live — Transactions en temps réel
          </div>
          <h1 style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
            Achetez & Vendez des<br />
            <span style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Crypto-monnaies</span><br />
            via Mobile Money
          </h1>
          <p style={{ fontSize: 18, color: c(COLORS.muted.dark, COLORS.muted.light), maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 }}>
            La première marketplace P2P dédiée à l'Afrique. Achetez USDT, BNB, ETH et plus encore en payant avec MTN, Orange Money, Moov et Wave.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("marketplace")} style={{ ...styles.btn("primary"), fontSize: 16, padding: "14px 32px" }}>
              🚀 Voir les offres
            </button>
            <button onClick={() => navigate("register")} style={{ ...styles.btn("secondary"), fontSize: 16, padding: "14px 32px" }}>
              Créer un compte →
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 80 }}>
          {stats.map(s => (
            <div key={s.label} style={{ ...styles.card, textAlign: "center", padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.primary }}>{s.value}</div>
              <div style={{ fontSize: 14, color: c(COLORS.muted.dark, COLORS.muted.light), marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ marginTop: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 48 }}>Comment ça marche ?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {[
              { step: "01", title: "Créez un compte", desc: "Inscription gratuite en 2 minutes. Votre compte vous donne accès à tous les vendeurs vérifiés.", icon: "👤" },
              { step: "02", title: "Choisissez une offre", desc: "Parcourez les offres par type de crypto. Comparez les taux et choisissez le meilleur vendeur.", icon: "🔍" },
              { step: "03", title: "Payez via Mobile Money", desc: "Saisissez votre adresse wallet, la quantité souhaitée et payez avec MTN, Orange ou autre.", icon: "📱" },
              { step: "04", title: "Recevez vos cryptos", desc: "Le vendeur envoie vos cryptos. Confirmez la réception pour valider la transaction.", icon: "✅" },
            ].map(s => (
              <div key={s.step} style={{ ...styles.card, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -10, right: -10, fontSize: 80, opacity: 0.05, fontWeight: 900 }}>{s.step}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.primary, marginBottom: 8, letterSpacing: 2 }}>ÉTAPE {s.step}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: c(COLORS.muted.dark, COLORS.muted.light), lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Vendeur */}
        <div style={{ marginTop: 80, ...styles.card, background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.1))", border: "1px solid rgba(245,158,11,0.2)", textAlign: "center", padding: 60 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Devenez vendeur</h2>
          <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light), marginBottom: 28, maxWidth: 500, margin: "0 auto 28px" }}>
            Publiez vos offres et vendez vos cryptos à des acheteurs vérifiés. Paiement sécurisé et retraits Mobile Money en moins de 5 minutes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...styles.btn("green"), textDecoration: "none", fontSize: 14 }}>
              📱 WhatsApp : +229 0155237685
            </a>
            <a href="mailto:erickpakpo786@gmail.com" style={{ ...styles.btn("secondary"), textDecoration: "none", fontSize: 14 }}>
              ✉️ erickpakpo786@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}`, padding: "40px 24px", textAlign: "center", color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 14 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: COLORS.primary, marginBottom: 8 }}>CryptoP2P Africa</div>
          <p>© 2026 CryptoP2P — Support : <a href="https://wa.me/22901 55237685" style={{ color: COLORS.primary }}>WhatsApp</a> | <a href="mailto:erickpakpo786@gmail.com" style={{ color: COLORS.primary }}>Email</a></p>
        </div>
      </footer>
    </div>
  );
}

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
function LoginPage({ styles, c, isDark, navigate, login, notify }) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!form.identifier || !form.password) { notify("Remplissez tous les champs", "error"); return; }
    setLoading(true);
    setTimeout(() => {
      // Mock auth — simulate different roles
      const isAdmin = form.identifier === "admin" && form.password === "admin123";
      const isSeller = form.identifier === "vendeur" || form.identifier === "seller";
      login({ id: "u1", name: form.identifier === "admin" ? "Eric Admin" : "Utilisateur Test", email: form.identifier + "@test.com", isAdmin, isSeller });
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div onClick={() => navigate("landing")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 40, justifyContent: "center" }}>
          <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, color: "#000" }}>₿</div>
          <span style={{ fontWeight: 900, fontSize: 24, background: "linear-gradient(135deg, #f59e0b, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CryptoP2P</span>
        </div>
        <div style={styles.card}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Connexion</h1>
          <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light), marginBottom: 28, fontSize: 14 }}>Bienvenue ! Connectez-vous pour continuer.</p>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: c(COLORS.muted.dark, COLORS.muted.light) }}>Email ou nom d'utilisateur</label>
            <input style={styles.input} placeholder="votre@email.com" value={form.identifier} onChange={e => setForm({ ...form, identifier: e.target.value })} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: c(COLORS.muted.dark, COLORS.muted.light) }}>Mot de passe</label>
            <input style={styles.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
          
          <button onClick={handleSubmit} disabled={loading} style={{ ...styles.btn("primary"), width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Connexion..." : "Se connecter →"}
          </button>
          
          <div style={{ marginTop: 20, padding: "14px 16px", background: c("rgba(59,130,246,0.1)", "rgba(59,130,246,0.08)"), borderRadius: 10, fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light) }}>
            <strong>Demo :</strong> Utilisez n'importe quel identifiant/mdp • Admin : admin/admin123 • Vendeur : vendeur/test
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: c(COLORS.muted.dark, COLORS.muted.light) }}>
            Pas encore de compte ? <span onClick={() => navigate("register")} style={{ color: COLORS.primary, cursor: "pointer", fontWeight: 600 }}>S'inscrire</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ styles, c, isDark, navigate, login, notify }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) { notify("Remplissez tous les champs", "error"); return; }
    if (form.password !== form.confirm) { notify("Les mots de passe ne correspondent pas", "error"); return; }
    if (form.password.length < 8) { notify("Mot de passe trop court (8 min)", "error"); return; }
    setLoading(true);
    setTimeout(() => {
      login({ id: "u_new", name: form.name, email: form.email, isAdmin: false, isSeller: false });
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div onClick={() => navigate("landing")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 40, justifyContent: "center" }}>
          <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, color: "#000" }}>₿</div>
          <span style={{ fontWeight: 900, fontSize: 24, background: "linear-gradient(135deg, #f59e0b, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CryptoP2P</span>
        </div>
        <div style={styles.card}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Créer un compte</h1>
          <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light), marginBottom: 28, fontSize: 14 }}>Rejoignez la communauté P2P la plus sûre d'Afrique.</p>
          
          {[
            { key: "name", label: "Nom complet", placeholder: "Jean Dupont" },
            { key: "email", label: "Adresse email", placeholder: "votre@email.com" },
            { key: "password", label: "Mot de passe", placeholder: "••••••••", type: "password" },
            { key: "confirm", label: "Confirmer le mot de passe", placeholder: "••••••••", type: "password" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: c(COLORS.muted.dark, COLORS.muted.light) }}>{f.label}</label>
              <input style={styles.input} type={f.type || "text"} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
          
          <button onClick={handleSubmit} disabled={loading} style={{ ...styles.btn("primary"), width: "100%", justifyContent: "center", marginTop: 12, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Création..." : "Créer mon compte 🚀"}
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: c(COLORS.muted.dark, COLORS.muted.light) }}>
            Déjà un compte ? <span onClick={() => navigate("login")} style={{ color: COLORS.primary, cursor: "pointer", fontWeight: 600 }}>Se connecter</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── MARKETPLACE ──────────────────────────────────────────────────────────────
function MarketplacePage({ styles, c, isDark, navigate, user, logout, offers, selectedCrypto, setSelectedCrypto, theme, setTheme, notify }) {
  const [search, setSearch] = useState("");
  const filtered = offers.filter(o => (o.crypto === selectedCrypto || selectedCrypto === "all") && (search === "" || o.sellerName.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <Navbar styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} theme={theme} setTheme={setTheme} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Marketplace P2P</h1>
          <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 15 }}>Achetez des crypto-monnaies directement auprès de vendeurs vérifiés</p>
        </div>

        {/* Crypto Filter Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          <button onClick={() => setSelectedCrypto("all")} style={{ ...styles.btn(selectedCrypto === "all" ? "primary" : "secondary", "sm") }}>🌐 Tout</button>
          {CRYPTOS.map(cr => (
            <button key={cr.id} onClick={() => setSelectedCrypto(cr.id)} style={{ ...styles.btn(selectedCrypto === cr.id ? "primary" : "secondary", "sm") }}>
              <span style={{ color: cr.color }}>{cr.icon}</span> {cr.symbol} <span style={{ opacity: 0.7, fontSize: 11 }}>{cr.network}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 400, marginBottom: 24 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c(COLORS.muted.dark, COLORS.muted.light) }}>🔍</span>
          <input style={{ ...styles.input, paddingLeft: 42 }} placeholder="Rechercher un vendeur..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Offers Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: c(COLORS.muted.dark, COLORS.muted.light) }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p>Aucune offre trouvée pour ce filtre.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filtered.map(offer => <OfferCard key={offer.id} offer={offer} styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} notify={notify} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferCard({ offer, styles, c, isDark, navigate, user, notify }) {
  const crypto = getCrypto(offer.crypto);
  
  const handleBuy = () => {
    if (!user) { notify("Connectez-vous pour acheter", "error"); navigate("login"); return; }
    navigate("buy", { offer });
  };

  return (
    <div style={{ ...styles.card, padding: 20, transition: "all 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {/* Seller Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 200px" }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #1e3a5f, #0f2035)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: COLORS.primary, border: `2px solid ${offer.verified ? COLORS.green : c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}` }}>
              {offer.sellerAvatar}
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: offer.online ? COLORS.green : "#6b7280", border: "2px solid" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{offer.sellerName}</span>
              {offer.verified && <span style={{ background: "rgba(16,185,129,0.15)", color: COLORS.green, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100 }}>✓ VÉRIFIÉ</span>}
            </div>
            <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light), marginTop: 2 }}>
              {offer.completedTrades} trades • {offer.successRate}% succès
            </div>
          </div>
        </div>

        {/* Crypto & Rate */}
        <div style={{ flex: "1 1 180px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 24, color: crypto.color }}>{crypto.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{crypto.name}</div>
              <div style={{ fontSize: 11, color: c(COLORS.muted.dark, COLORS.muted.light) }}>Réseau {crypto.network}</div>
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.primary }}>
            {fmt(offer.rate)} <span style={{ fontSize: 13, fontWeight: 500, color: c(COLORS.muted.dark, COLORS.muted.light) }}>FCFA / {crypto.symbol}</span>
          </div>
        </div>

        {/* Limits & Methods */}
        <div style={{ flex: "1 1 160px", fontSize: 13 }}>
          <div style={{ color: c(COLORS.muted.dark, COLORS.muted.light), marginBottom: 4 }}>
            Limite : {offer.minAmount} — {fmt(offer.maxAmount)} {crypto.symbol}
          </div>
          <div style={{ color: c(COLORS.muted.dark, COLORS.muted.light), marginBottom: 8 }}>
            Dispo : <span style={{ color: COLORS.green, fontWeight: 600 }}>{fmt(offer.available)} {crypto.symbol}</span>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {offer.paymentMethods.map(m => (
              <span key={m} style={{ background: c("rgba(255,255,255,0.06)", "rgba(0,0,0,0.06)"), borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Action */}
        <button onClick={handleBuy} style={{ ...styles.btn("primary"), whiteSpace: "nowrap", flexShrink: 0 }}>
          Acheter {crypto.symbol} →
        </button>
      </div>
    </div>
  );
}

// ─── BUY PAGE ─────────────────────────────────────────────────────────────────
function BuyPage({ styles, c, isDark, navigate, user, offer, orders, setOrders, notify }) {
  const [step, setStep] = useState(1); // 1: form, 2: payment, 3: success
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [walletError, setWalletError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!offer) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p>Aucune offre sélectionnée</p>
        <button onClick={() => navigate("marketplace")} style={{ ...styles.btn("primary"), marginTop: 16 }}>Retour au marketplace</button>
      </div>
    </div>
  );

  const crypto = getCrypto(offer.crypto);
  const amountFCFA = amount ? Math.round(parseFloat(amount) * offer.rate) : 0;

  const validateWallet = (addr) => {
    if (!addr) { setWalletError(""); return; }
    if (!crypto.addrRegex.test(addr)) {
      setWalletError(`Format invalide. Exemple : ${crypto.addrExample}`);
    } else {
      setWalletError("");
    }
  };

  const handlePay = () => {
    if (!wallet) { notify("Entrez votre adresse wallet", "error"); return; }
    if (walletError) { notify("Adresse wallet invalide", "error"); return; }
    if (!amount || parseFloat(amount) <= 0) { notify("Entrez un montant valide", "error"); return; }
    if (parseFloat(amount) < offer.minAmount) { notify(`Montant minimum : ${offer.minAmount} ${crypto.symbol}`, "error"); return; }
    if (parseFloat(amount) > offer.maxAmount) { notify(`Montant maximum : ${offer.maxAmount} ${crypto.symbol}`, "error"); return; }
    setStep(2);
  };

  const confirmPayment = () => {
    setLoading(true);
    setTimeout(() => {
      const id = `CMD-${Date.now().toString().slice(-6)}`;
      setOrderId(id);
      const newOrder = {
        id, crypto: offer.crypto, amount: parseFloat(amount), amountFCFA, walletAddr: wallet.slice(0, 8) + "..." + wallet.slice(-4),
        seller: offer.sellerName, status: "paid", createdAt: new Date().toISOString(),
      };
      setOrders([newOrder, ...orders]);
      setStep(3);
      setLoading(false);
      notify("Paiement confirmé ! Le vendeur va vous envoyer vos cryptos 🎉");
    }, 2000);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav style={{ background: c("rgba(10,15,30,0.95)", "rgba(255,255,255,0.95)"), backdropFilter: "blur(20px)", borderBottom: `1px solid ${c("rgba(255,255,255,0.08)", "rgba(0,0,0,0.08)")}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 64, gap: 16 }}>
          <button onClick={() => navigate("marketplace")} style={{ ...styles.btn("secondary", "sm") }}>← Retour</button>
          <span style={{ fontWeight: 700 }}>Acheter {crypto.name}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 24px" }}>
        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
          {["Détails", "Paiement", "Confirmation"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: step > i ? COLORS.primary : step === i + 1 ? "linear-gradient(135deg, #f59e0b, #d97706)" : c("rgba(255,255,255,0.1)", "rgba(0,0,0,0.1)"), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: step > i || step === i + 1 ? "#000" : c(COLORS.muted.dark, COLORS.muted.light), marginBottom: 6 }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 11, color: step === i + 1 ? COLORS.primary : c(COLORS.muted.dark, COLORS.muted.light) }}>{s}</span>
              </div>
              {i < 2 && <div style={{ height: 2, flex: 1, background: step > i + 1 ? COLORS.primary : c("rgba(255,255,255,0.1)", "rgba(0,0,0,0.1)"), margin: "0 8px", marginBottom: 20 }} />}
            </div>
          ))}
        </div>

        {/* Seller Summary */}
        <div style={{ ...styles.card, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #1e3a5f, #0f2035)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: COLORS.primary }}>
            {offer.sellerAvatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{offer.sellerName}</div>
            <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light) }}>{offer.completedTrades} trades • {offer.successRate}% succès</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, color: COLORS.primary }}>{fmt(offer.rate)}</div>
            <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light) }}>FCFA / {crypto.symbol}</div>
          </div>
        </div>

        {/* Step 1: Form */}
        {step === 1 && (
          <div style={styles.card}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Détails de la commande</h2>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: c(COLORS.muted.dark, COLORS.muted.light) }}>
                Adresse Wallet {crypto.name} ({crypto.network}) *
              </label>
              <input
                style={{ ...styles.input, borderColor: walletError ? COLORS.red : undefined }}
                placeholder={crypto.addrExample}
                value={wallet}
                onChange={e => { setWallet(e.target.value); validateWallet(e.target.value); }}
              />
              {walletError && <p style={{ color: COLORS.red, fontSize: 12, marginTop: 6 }}>⚠️ {walletError}</p>}
              {wallet && !walletError && <p style={{ color: COLORS.green, fontSize: 12, marginTop: 6 }}>✅ Format d'adresse valide</p>}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: c(COLORS.muted.dark, COLORS.muted.light) }}>
                Quantité de {crypto.symbol} *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...styles.input, paddingRight: 80 }}
                  type="number"
                  placeholder={`Min: ${offer.minAmount}`}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: crypto.color, fontSize: 14 }}>{crypto.symbol}</span>
              </div>
              <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light), marginTop: 6 }}>
                Limites : {offer.minAmount} – {fmt(offer.maxAmount)} {crypto.symbol}
              </div>
            </div>

            {/* Auto-calculation */}
            {amountFCFA > 0 && (
              <div style={{ background: c("rgba(245,158,11,0.08)", "rgba(245,158,11,0.08)"), border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 14 }}>Vous recevez</span>
                  <span style={{ fontWeight: 700 }}>{amount} {crypto.symbol}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 14 }}>Taux</span>
                  <span style={{ fontWeight: 600 }}>{fmt(offer.rate)} FCFA/{crypto.symbol}</span>
                </div>
                <div style={{ height: 1, background: c("rgba(255,255,255,0.1)", "rgba(0,0,0,0.1)"), margin: "12px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>Total à payer</span>
                  <span style={{ fontWeight: 900, fontSize: 20, color: COLORS.primary }}>{fmt(amountFCFA)} FCFA</span>
                </div>
              </div>
            )}

            <button onClick={handlePay} style={{ ...styles.btn("primary"), width: "100%", justifyContent: "center" }}>
              Continuer → Paiement Mobile Money
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div style={styles.card}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Paiement Mobile Money</h2>
            <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 14, marginBottom: 24 }}>Sélectionnez votre opérateur et confirmez le paiement</p>

            {/* Order summary */}
            <div style={{ background: c("rgba(16,185,129,0.08)", "rgba(16,185,129,0.06)"), border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>📋 Récapitulatif</div>
              <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: c(COLORS.muted.dark, COLORS.muted.light) }}>Crypto</span><strong>{amount} {crypto.symbol}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: c(COLORS.muted.dark, COLORS.muted.light) }}>Wallet</span><strong>{wallet.slice(0, 12)}...{wallet.slice(-4)}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: c(COLORS.muted.dark, COLORS.muted.light) }}>Vendeur</span><strong>{offer.sellerName}</strong></div>
                <div style={{ height: 1, background: c("rgba(255,255,255,0.1)", "rgba(0,0,0,0.1)"), margin: "4px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700 }}>Total</span><span style={{ fontWeight: 900, color: COLORS.primary, fontSize: 18 }}>{fmt(amountFCFA)} FCFA</span></div>
              </div>
            </div>

            {/* Mobile Money Methods */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: c(COLORS.muted.dark, COLORS.muted.light), marginBottom: 12 }}>Moyens de paiement acceptés :</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {offer.paymentMethods.map(m => (
                  <div key={m} style={{ border: `2px solid ${COLORS.primary}`, borderRadius: 10, padding: "12px 14px", textAlign: "center", fontWeight: 600, fontSize: 14, background: "rgba(245,158,11,0.05)" }}>
                    📱 {m}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: c("rgba(59,130,246,0.08)", "rgba(59,130,246,0.06)"), border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: 14, marginBottom: 24, fontSize: 13 }}>
              ℹ️ <strong>Info :</strong> En cliquant sur "Payer", vous serez redirigé vers l'interface de paiement Mobile Money de votre opérateur. Le vendeur sera notifié dès confirmation.
            </div>

            <button onClick={confirmPayment} disabled={loading} style={{ ...styles.btn("green"), width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1, fontSize: 16 }}>
              {loading ? "⏳ Traitement..." : `💳 Payer ${fmt(amountFCFA)} FCFA`}
            </button>
            <button onClick={() => setStep(1)} style={{ ...styles.btn("ghost"), width: "100%", justifyContent: "center", marginTop: 8 }}>
              ← Modifier la commande
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={{ ...styles.card, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Paiement confirmé !</h2>
            <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light), marginBottom: 24 }}>
              Votre commande <strong style={{ color: COLORS.primary }}>{orderId}</strong> a été créée. Le vendeur va vous envoyer vos cryptos.
            </p>
            
            <div style={{ background: c("rgba(245,158,11,0.08)", "rgba(245,158,11,0.06)"), borderRadius: 12, padding: 20, marginBottom: 24, textAlign: "left" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📌 Prochaines étapes</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                {[
                  { icon: "🔔", text: "Le vendeur reçoit une notification" },
                  { icon: "📤", text: "Il envoie vos cryptos manuellement" },
                  { icon: "✅", text: "Vous devez confirmer la réception" },
                  { icon: "🔒", text: "Les fonds du vendeur sont libérés" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: c("rgba(255,255,255,0.08)", "rgba(0,0,0,0.06)"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{s.icon}</span>
                    <span style={{ color: c(COLORS.muted.dark, COLORS.muted.light) }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("dashboard")} style={styles.btn("primary")}>Voir mes commandes →</button>
              <button onClick={() => navigate("marketplace")} style={styles.btn("secondary")}>Retour marketplace</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ styles, c, isDark, navigate, user, logout, orders, setOrders, notify, theme, setTheme }) {
  const [activeTab, setActiveTab] = useState("orders");
  const [confirmModal, setConfirmModal] = useState(null);

  const confirmReception = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "confirmed" } : o));
    setConfirmModal(null);
    notify("Réception confirmée ! La transaction est terminée. ✅");
  };

  const openDispute = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "disputed" } : o));
    notify("Litige ouvert. Le support va analyser votre cas.", "error");
  };

  const statusCounts = {
    all: orders.length,
    paid: orders.filter(o => o.status === "paid").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
  };

  return (
    <div>
      <Navbar styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} theme={theme} setTheme={setTheme} />
      
      {/* Confirm Modal */}
      {confirmModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ ...styles.card, maxWidth: 400, width: "100%" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Confirmer la réception ?</h3>
            <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light), marginBottom: 24, fontSize: 14 }}>
              En confirmant, vous attestez avoir bien reçu vos cryptos. Cette action est <strong>irréversible</strong> et libère les fonds du vendeur.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => confirmReception(confirmModal)} style={{ ...styles.btn("green"), flex: 1, justifyContent: "center" }}>✅ Confirmer la réception</button>
              <button onClick={() => setConfirmModal(null)} style={{ ...styles.btn("secondary"), flex: 1, justifyContent: "center" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22, color: "#000" }}>
            {user?.name?.[0] || "U"}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900 }}>Bonjour, {user?.name} 👋</h1>
            <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 14 }}>Gérez vos achats et confirmez vos réceptions</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total commandes", value: orders.length, icon: "📦", color: COLORS.blue },
            { label: "En attente", value: statusCounts.paid, icon: "⏳", color: COLORS.primary },
            { label: "Livrées", value: statusCounts.delivered, icon: "🚚", color: COLORS.purple },
            { label: "Confirmées", value: statusCounts.confirmed, icon: "✅", color: COLORS.green },
          ].map(s => (
            <div key={s.label} style={{ ...styles.card, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: c(COLORS.muted.dark, COLORS.muted.light), marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}`, paddingBottom: 0 }}>
          {[
            { id: "orders", label: "Mes commandes" },
            { id: "profile", label: "Mon profil" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ ...styles.btn(activeTab === tab.id ? "primary" : "ghost", "sm"), borderRadius: "8px 8px 0 0", paddingBottom: 14 }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light) }}>Aucune commande pour l'instant</p>
                <button onClick={() => navigate("marketplace")} style={{ ...styles.btn("primary"), marginTop: 16 }}>Découvrir les offres →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {orders.map(order => {
                  const crypto = getCrypto(order.crypto);
                  const status = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <div key={order.id} style={{ ...styles.card, padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 200px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, color: COLORS.primary }}>{order.id}</span>
                            <span style={{ background: status.bg, color: status.color, padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{status.label}</span>
                          </div>
                          <div style={{ fontSize: 13, color: c(COLORS.muted.dark, COLORS.muted.light) }}>
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div style={{ flex: "1 1 160px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: crypto.color, fontSize: 20 }}>{crypto.icon}</span>
                            <div>
                              <div style={{ fontWeight: 700 }}>{order.amount} {crypto.symbol}</div>
                              <div style={{ fontSize: 13, color: c(COLORS.muted.dark, COLORS.muted.light) }}>{fmt(order.amountFCFA)} FCFA</div>
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: "1 1 160px", fontSize: 13, color: c(COLORS.muted.dark, COLORS.muted.light) }}>
                          <div>Vendeur : <strong>{order.seller}</strong></div>
                          <div>Wallet : {order.walletAddr}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {order.status === "delivered" && (
                            <>
                              <button onClick={() => setConfirmModal(order.id)} style={styles.btn("green", "sm")}>✅ Confirmer réception</button>
                              <button onClick={() => openDispute(order.id)} style={{ ...styles.btn("red", "sm") }}>⚠️ Litige</button>
                            </>
                          )}
                          {order.status === "paid" && (
                            <span style={{ fontSize: 13, color: COLORS.primary, fontStyle: "italic" }}>⏳ En attente d'envoi...</span>
                          )}
                          {order.status === "confirmed" && <span style={{ color: COLORS.green, fontSize: 13, fontWeight: 600 }}>✅ Transaction terminée</span>}
                          {order.status === "disputed" && <span style={{ color: COLORS.red, fontSize: 13, fontWeight: 600 }}>⚠️ Litige en cours</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={styles.card}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Informations du compte</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Nom complet", value: user?.name },
                { label: "Email", value: user?.email },
                { label: "Statut", value: user?.isSeller ? "Vendeur vérifié" : "Acheteur" },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}` }}>
                  <span style={{ color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 14 }}>{f.label}</span>
                  <span style={{ fontWeight: 600 }}>{f.value}</span>
                </div>
              ))}
            </div>
            {!user?.isSeller && (
              <div style={{ marginTop: 24, padding: 20, background: c("rgba(245,158,11,0.08)", "rgba(245,158,11,0.06)"), border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Devenir vendeur</h4>
                <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 13, marginBottom: 16 }}>Contactez notre équipe pour être validé comme vendeur sur la plateforme.</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...styles.btn("green", "sm"), textDecoration: "none" }}>📱 WhatsApp</a>
                  <a href="mailto:erickpakpo786@gmail.com" style={{ ...styles.btn("secondary", "sm"), textDecoration: "none" }}>✉️ Email</a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SELLER PAGE ──────────────────────────────────────────────────────────────
function SellerPage({ styles, c, isDark, navigate, user, logout, offers, setOffers, orders, setOrders, notify, theme, setTheme }) {
  const [activeTab, setActiveTab] = useState("orders");
  const [showNewOffer, setShowNewOffer] = useState(false);
  const [newOffer, setNewOffer] = useState({ crypto: "usdt_trc20", rate: "", minAmount: "", maxAmount: "", available: "", paymentMethods: [] });
  const [withdrawModal, setWithdrawModal] = useState(null);

  // Mock seller orders
  const sellerOrders = orders.map(o => ({
    ...o, status: o.status === "pending" ? "paid" : o.status
  }));

  const myOffers = offers.filter(o => o.sellerId === "v1"); // Mock: first vendor

  const markDelivered = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "delivered" } : o));
    notify("Crypto marquée comme livrée ! En attente de confirmation de l'acheteur.");
  };

  const handleWithdraw = () => {
    setWithdrawModal(null);
    notify("Demande de retrait envoyée ! Traitement en moins de 5 minutes. 💸");
  };

  const createOffer = () => {
    if (!newOffer.rate || !newOffer.minAmount || !newOffer.maxAmount || !newOffer.available) {
      notify("Remplissez tous les champs", "error"); return;
    }
    const crypto = getCrypto(newOffer.crypto);
    const offer = {
      id: `o_${Date.now()}`, sellerId: "v1", sellerName: user.name, sellerAvatar: user.name[0],
      verified: true, crypto: newOffer.crypto, rate: parseFloat(newOffer.rate),
      minAmount: parseFloat(newOffer.minAmount), maxAmount: parseFloat(newOffer.maxAmount),
      available: parseFloat(newOffer.available), paymentMethods: newOffer.paymentMethods.length ? newOffer.paymentMethods : ["MTN MoMo"],
      completedTrades: 0, successRate: 100, online: true,
    };
    setOffers([offer, ...offers]);
    setShowNewOffer(false);
    setNewOffer({ crypto: "usdt_trc20", rate: "", minAmount: "", maxAmount: "", available: "", paymentMethods: [] });
    notify("Offre publiée avec succès ! ✅");
  };

  // Mock earnings
  const earnings = { total: 485000, blocked: 65000, available: 420000 };

  return (
    <div>
      <Navbar styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} theme={theme} setTheme={setTheme} />

      {/* Withdraw Modal */}
      {withdrawModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ ...styles.card, maxWidth: 400, width: "100%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Retrait Mobile Money</h3>
            <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 14, marginBottom: 20 }}>
              Disponible : <strong style={{ color: COLORS.green }}>{fmt(earnings.available)} FCFA</strong>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <input style={styles.input} placeholder="Montant (FCFA)" type="number" />
              <input style={styles.input} placeholder="Réseau (MTN, Orange...)" />
              <input style={styles.input} placeholder="Numéro Mobile Money" />
              <input style={styles.input} placeholder="Nom du bénéficiaire" />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleWithdraw} style={{ ...styles.btn("primary"), flex: 1, justifyContent: "center" }}>💸 Retirer</button>
              <button onClick={() => setWithdrawModal(null)} style={{ ...styles.btn("secondary"), flex: 1, justifyContent: "center" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Espace Vendeur 🏪</h1>
          <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light) }}>Gérez vos offres et commandes</p>
        </div>

        {/* Earnings Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Revenus totaux", value: fmt(earnings.total) + " FCFA", icon: "💰", color: COLORS.primary },
            { label: "Bloqués (24h)", value: fmt(earnings.blocked) + " FCFA", icon: "🔒", color: COLORS.primary, sub: "Disponible après 24h" },
            { label: "Disponibles", value: fmt(earnings.available) + " FCFA", icon: "✅", color: COLORS.green },
            { label: "Commandes actives", value: sellerOrders.filter(o => o.status === "paid").length, icon: "📦", color: COLORS.blue },
          ].map(s => (
            <div key={s.label} style={{ ...styles.card, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: s.value.toString().length > 12 ? 18 : 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light), marginTop: 2 }}>{s.label}</div>
              {s.sub && <div style={{ fontSize: 11, color: c(COLORS.muted.dark, COLORS.muted.light), marginTop: 4, opacity: 0.7 }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "orders", label: "Commandes" },
              { id: "offers", label: "Mes offres" },
              { id: "finance", label: "Finances" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={styles.btn(activeTab === tab.id ? "primary" : "secondary", "sm")}>{tab.label}</button>
            ))}
          </div>
          {activeTab === "offers" && <button onClick={() => setShowNewOffer(true)} style={styles.btn("primary", "sm")}>+ Nouvelle offre</button>}
          {activeTab === "finance" && <button onClick={() => setWithdrawModal(true)} style={styles.btn("green", "sm")}>💸 Retrait</button>}
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {sellerOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: c(COLORS.muted.dark, COLORS.muted.light) }}>
                <div style={{ fontSize: 48 }}>📭</div>
                <p>Aucune commande pour l'instant</p>
              </div>
            ) : sellerOrders.map(order => {
              const crypto = getCrypto(order.crypto);
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div key={order.id} style={{ ...styles.card, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 160px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: COLORS.primary, fontSize: 14 }}>{order.id}</span>
                        <span style={{ background: status.bg, color: status.color, padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{status.label}</span>
                      </div>
                      <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light) }}>
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div style={{ flex: "1 1 140px" }}>
                      <div style={{ fontWeight: 700 }}>{order.amount} {crypto.symbol}</div>
                      <div style={{ fontSize: 13, color: c(COLORS.muted.dark, COLORS.muted.light) }}>{fmt(order.amountFCFA)} FCFA</div>
                    </div>
                    <div style={{ flex: "1 1 140px", fontSize: 13, color: c(COLORS.muted.dark, COLORS.muted.light) }}>
                      Wallet : {order.walletAddr}
                    </div>
                    <div>
                      {order.status === "paid" && (
                        <button onClick={() => markDelivered(order.id)} style={styles.btn("primary", "sm")}>
                          📤 Marquer livré
                        </button>
                      )}
                      {order.status === "delivered" && <span style={{ color: COLORS.purple, fontSize: 13, fontWeight: 600 }}>⏳ Attente confirmation</span>}
                      {order.status === "confirmed" && <span style={{ color: COLORS.green, fontSize: 13, fontWeight: 600 }}>✅ Fonds crédités</span>}
                      {order.status === "disputed" && (
                        <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...styles.btn("red", "sm"), textDecoration: "none" }}>⚠️ Contacter support</a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === "offers" && (
          <div>
            {showNewOffer && (
              <div style={{ ...styles.card, marginBottom: 20, border: `1px solid rgba(245,158,11,0.3)` }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Nouvelle offre</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: c(COLORS.muted.dark, COLORS.muted.light), marginBottom: 6 }}>Crypto-monnaie</label>
                    <select style={{ ...styles.input }} value={newOffer.crypto} onChange={e => setNewOffer({ ...newOffer, crypto: e.target.value })}>
                      {CRYPTOS.map(cr => <option key={cr.id} value={cr.id}>{cr.name} ({cr.network})</option>)}
                    </select>
                  </div>
                  {[
                    { key: "rate", label: "Taux (FCFA / unité)", placeholder: "ex: 650" },
                    { key: "available", label: "Disponible (en crypto)", placeholder: "ex: 10000" },
                    { key: "minAmount", label: "Montant minimum", placeholder: "ex: 10" },
                    { key: "maxAmount", label: "Montant maximum", placeholder: "ex: 5000" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: c(COLORS.muted.dark, COLORS.muted.light), marginBottom: 6 }}>{f.label}</label>
                      <input style={styles.input} type="number" placeholder={f.placeholder} value={newOffer[f.key]} onChange={e => setNewOffer({ ...newOffer, [f.key]: e.target.value })} />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                  <button onClick={createOffer} style={styles.btn("primary", "sm")}>Publier l'offre ✅</button>
                  <button onClick={() => setShowNewOffer(false)} style={styles.btn("secondary", "sm")}>Annuler</button>
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {offers.slice(0, 3).map(offer => {
                const crypto = getCrypto(offer.crypto);
                return (
                  <div key={offer.id} style={{ ...styles.card, padding: 18, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 160px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: crypto.color, fontSize: 22 }}>{crypto.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700 }}>{crypto.name}</div>
                          <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light) }}>Réseau {crypto.network}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: "1 1 140px" }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: COLORS.primary }}>{fmt(offer.rate)} FCFA</div>
                      <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light) }}>Dispo : {fmt(offer.available)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ background: "rgba(16,185,129,0.15)", color: COLORS.green, padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>● Active</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === "finance" && (
          <div>
            <div style={{ ...styles.card, marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>📊 Revenus</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Revenus totaux", value: fmt(earnings.total) + " FCFA", color: COLORS.primary },
                  { label: "Fonds bloqués (24h)", value: fmt(earnings.blocked) + " FCFA", color: COLORS.primary, note: "Disponible après 24h" },
                  { label: "Disponibles pour retrait", value: fmt(earnings.available) + " FCFA", color: COLORS.green },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}`, alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{s.label}</span>
                      {s.note && <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light) }}>{s.note}</div>}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 18, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setWithdrawModal(true)} style={{ ...styles.btn("primary"), marginTop: 20, width: "100%", justifyContent: "center" }}>
                💸 Demander un retrait
              </button>
            </div>

            <div style={{ ...styles.card }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>⏱️ Règles de retrait</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                {[
                  "Les fonds sont bloqués 24h après confirmation de l'acheteur",
                  "Après 24h, vous pouvez demander un retrait",
                  "Traitement en moins de 5 minutes via Mobile Money",
                  "En cas de litige, les fonds restent bloqués jusqu'à résolution",
                ].map((rule, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: COLORS.primary, flexShrink: 0 }}>→</span>
                    <span style={{ color: c(COLORS.muted.dark, COLORS.muted.light) }}>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ styles, c, isDark, navigate, user, logout, offers, orders, setOrders, notify, theme, setTheme }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sellers] = useState([
    { id: "v1", name: "EricPro", email: "eric@test.com", verified: true, trades: 247, volume: 3200000, status: "active" },
    { id: "v2", name: "CryptoKing", email: "king@test.com", verified: true, trades: 523, volume: 7400000, status: "active" },
    { id: "v3", name: "AfriTrade", email: "afri@test.com", verified: false, trades: 12, volume: 180000, status: "pending" },
    { id: "v4", name: "NewTrader", email: "new@test.com", verified: false, trades: 0, volume: 0, status: "pending" },
  ]);
  const [pendingSellers, setPendingSellers] = useState(sellers.filter(s => !s.verified));

  const validateSeller = (id) => {
    setPendingSellers(pendingSellers.filter(s => s.id !== id));
    notify("Vendeur validé ! Il peut maintenant publier des offres. ✅");
  };

  const rejectSeller = (id) => {
    setPendingSellers(pendingSellers.filter(s => s.id !== id));
    notify("Demande refusée.", "error");
  };

  const validateDispute = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "confirmed" } : o));
    notify("Litige résolu. Transaction validée par l'admin. ✅");
  };

  const disputes = orders.filter(o => o.status === "disputed");

  const stats = {
    totalOrders: orders.length,
    totalVolumeFCFA: orders.reduce((s, o) => s + o.amountFCFA, 0),
    pendingValidations: pendingSellers.length,
    activeDisputes: disputes.length,
  };

  return (
    <div>
      <Navbar styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} theme={theme} setTheme={setTheme} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>⚙️</span>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900 }}>Administration</h1>
              <p style={{ color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 14 }}>Panneau de contrôle CryptoP2P</p>
            </div>
          </div>
        </div>

        {/* Admin Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Commandes totales", value: stats.totalOrders, icon: "📦", color: COLORS.blue },
            { label: "Volume total (FCFA)", value: fmt(stats.totalVolumeFCFA), icon: "💰", color: COLORS.primary },
            { label: "Vendeurs en attente", value: stats.pendingValidations, icon: "⏳", color: COLORS.primary },
            { label: "Litiges actifs", value: stats.activeDisputes, icon: "⚠️", color: COLORS.red },
          ].map(s => (
            <div key={s.label} style={{ ...styles.card, padding: 20, borderLeft: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light) }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { id: "overview", label: "Vue d'ensemble" },
            { id: "sellers", label: `Vendeurs (${pendingSellers.length} en attente)` },
            { id: "disputes", label: `Litiges (${disputes.length})` },
            { id: "orders", label: "Commandes" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={styles.btn(activeTab === tab.id ? "primary" : "secondary", "sm")}>{tab.label}</button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={styles.card}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📋 Statut des commandes</h3>
              {Object.entries(statusConfig).map(([k, v]) => {
                const count = orders.filter(o => o.status === k).length;
                return (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}` }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: v.color }} />
                      <span style={{ fontSize: 14 }}>{v.label}</span>
                    </span>
                    <span style={{ fontWeight: 700, background: v.bg, color: v.color, padding: "2px 12px", borderRadius: 100, fontSize: 13 }}>{count}</span>
                  </div>
                );
              })}
            </div>
            <div style={styles.card}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🪙 Cryptos les plus échangées</h3>
              {CRYPTOS.slice(0, 4).map(cr => {
                const count = offers.filter(o => o.crypto === cr.id).length;
                return (
                  <div key={cr.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}` }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: cr.color, fontSize: 18 }}>{cr.icon}</span>
                      <span style={{ fontSize: 14 }}>{cr.name}</span>
                    </span>
                    <span style={{ fontWeight: 700 }}>{count} offres</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sellers Tab */}
        {activeTab === "sellers" && (
          <div>
            {pendingSellers.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: COLORS.primary }}>⏳ Demandes en attente de validation</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {pendingSellers.map(s => (
                    <div key={s.id} style={{ ...styles.card, padding: 18, border: `1px solid rgba(245,158,11,0.3)` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                          <div style={{ color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 13 }}>{s.email}</div>
                        </div>
                        <span style={{ background: "rgba(245,158,11,0.15)", color: COLORS.primary, padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>En attente</span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => validateSeller(s.id)} style={styles.btn("green", "sm")}>✅ Valider</button>
                          <button onClick={() => rejectSeller(s.id)} style={styles.btn("red", "sm")}>❌ Refuser</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Tous les vendeurs</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sellers.map(s => (
                <div key={s.id} style={{ ...styles.card, padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 160px" }}>
                      <div style={{ fontWeight: 700 }}>{s.name}</div>
                      <div style={{ color: c(COLORS.muted.dark, COLORS.muted.light), fontSize: 13 }}>{s.email}</div>
                    </div>
                    <div style={{ flex: "1 1 140px", fontSize: 13 }}>
                      <div>{s.trades} trades</div>
                      <div style={{ color: c(COLORS.muted.dark, COLORS.muted.light) }}>{fmt(s.volume)} FCFA</div>
                    </div>
                    <span style={{ background: s.verified ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: s.verified ? COLORS.green : COLORS.primary, padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                      {s.verified ? "✓ Vérifié" : "⏳ En attente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === "disputes" && (
          <div>
            {disputes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: c(COLORS.muted.dark, COLORS.muted.light) }}>
                <div style={{ fontSize: 48 }}>✅</div>
                <p>Aucun litige actif</p>
              </div>
            ) : disputes.map(order => {
              const crypto = getCrypto(order.crypto);
              return (
                <div key={order.id} style={{ ...styles.card, padding: 20, border: `1px solid rgba(239,68,68,0.3)`, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 160px" }}>
                      <div style={{ fontWeight: 700, color: COLORS.red }}>{order.id}</div>
                      <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light) }}>
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div style={{ flex: "1 1 140px" }}>
                      <div style={{ fontWeight: 700 }}>{order.amount} {crypto.symbol}</div>
                      <div style={{ fontSize: 13, color: c(COLORS.muted.dark, COLORS.muted.light) }}>Vendeur : {order.seller}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => validateDispute(order.id)} style={styles.btn("primary", "sm")}>✅ Valider manuellement</button>
                      <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...styles.btn("secondary", "sm"), textDecoration: "none" }}>💬 Contacter</a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map(order => {
              const crypto = getCrypto(order.crypto);
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div key={order.id} style={{ ...styles.card, padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: "0 0 90px" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.primary }}>{order.id}</div>
                    </div>
                    <div style={{ flex: "1 1 120px" }}>
                      <span style={{ color: crypto.color }}>{crypto.icon}</span> {order.amount} {crypto.symbol}
                      <div style={{ fontSize: 12, color: c(COLORS.muted.dark, COLORS.muted.light) }}>{fmt(order.amountFCFA)} FCFA</div>
                    </div>
                    <div style={{ flex: "1 1 120px", fontSize: 13, color: c(COLORS.muted.dark, COLORS.muted.light) }}>Vendeur : {order.seller}</div>
                    <span style={{ background: status.bg, color: status.color, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
