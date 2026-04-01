import { useState, useCallback } from "react";

const COLORS = {
  bg: { dark: "#0a0f1e", light: "#f4f6fb" },
  card: { dark: "#111827", light: "#ffffff" },
  cardBorder: { dark: "#1e2d45", light: "#e2e8f0" },
  primary: "#f59e0b",
  primaryDark: "#d97706",
  green: "#10b981",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  text: { dark: "#f1f5f9", light: "#0f172a" },
  muted: { dark: "#94a3b8", light: "#64748b" },
};

const CRYPTOS = [
  { id: "usdt_trc20", name: "USDT TRC20", symbol: "USDT", network: "TRON", color: "#26a17b", icon: "₮", addrRegex: /^T[A-Za-z1-9]{33}$/, addrExample: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
  { id: "usdt_bep20", name: "USDT BEP20", symbol: "USDT", network: "BSC", color: "#f0b90b", icon: "₮", addrRegex: /^0x[0-9a-fA-F]{40}$/, addrExample: "0x..." },
  { id: "bnb", name: "BNB", symbol: "BNB", network: "BSC", color: "#f0b90b", icon: "Ⓑ", addrRegex: /^0x[0-9a-fA-F]{40}$/, addrExample: "0x..." },
  { id: "eth", name: "Ethereum", symbol: "ETH", network: "ERC20", color: "#627eea", icon: "Ξ", addrRegex: /^0x[0-9a-fA-F]{40}$/, addrExample: "0x..." },
  { id: "btc", name: "Bitcoin", symbol: "BTC", network: "BTC", color: "#f7931a", icon: "₿", addrRegex: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/, addrExample: "bc1..." },
  { id: "matic", name: "Polygon", symbol: "MATIC", network: "POLYGON", color: "#8247e5", icon: "⬡", addrRegex: /^0x[0-9a-fA-F]{40}$/, addrExample: "0x..." },
];

const MOCK_OFFERS = [
  { id: "o1", sellerId: "admin", sellerName: "EricPro", sellerAvatar: "E", verified: true, crypto: "usdt_trc20", rate: 650, minAmount: 10, maxAmount: 5000, available: 15000, paymentMethods: ["MTN MoMo", "Moov Money"], completedTrades: 247, successRate: 99.2, online: true },
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

// Admin credentials
const ADMIN_EMAIL = "erickpakpo384@gmail.com";
const ADMIN_PASSWORD = "55237685N";

const fmt = (n) => Math.round(n).toLocaleString("fr-FR");
const getCrypto = (id) => CRYPTOS.find(c => c.id === id) || CRYPTOS[0];

const statusConfig = {
  pending:   { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  paid:      { label: "Payé", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  delivered: { label: "Livré", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
  confirmed: { label: "Confirmé", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  disputed:  { label: "Litige", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
};

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  // Registered accounts stored in state (demo only)
  const [accounts, setAccounts] = useState([
    { id: "admin", name: "Eric Admin", email: ADMIN_EMAIL, password: ADMIN_PASSWORD, isAdmin: true, isSeller: true }
  ]);
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState("all");
  const [notification, setNotification] = useState(null);

  const isDark = theme === "dark";
  const c = (d, l) => isDark ? d : l;

  const notify = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setPage(userData.isAdmin ? "admin" : "marketplace");
    notify(`Bienvenue, ${userData.name} !`);
  };

  const logout = () => {
    setUser(null);
    setPage("login");
    notify("Déconnexion réussie", "info");
  };

  const navigate = (p, opts = {}) => {
    if (opts.offer) setSelectedOffer(opts.offer);
    setPage(p);
    window.scrollTo(0, 0);
  };

  const styles = {
    app: { minHeight: "100vh", background: c(COLORS.bg.dark, COLORS.bg.light), color: c(COLORS.text.dark, COLORS.text.light), fontFamily: "'Inter', -apple-system, sans-serif", transition: "background 0.3s, color 0.3s" },
    card: { background: c(COLORS.card.dark, COLORS.card.light), border: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}`, borderRadius: 16, padding: 24 },
    btn: (variant = "primary", size = "md") => ({
      primary:   { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: "#000", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: 10, padding: size === "sm" ? "7px 14px" : "11px 22px", fontSize: size === "sm" ? 13 : 14, transition: "opacity 0.2s, transform 0.1s", display: "inline-flex", alignItems: "center", gap: 6, lineHeight: 1.4 },
      secondary: { background: c("rgba(255,255,255,0.07)", "rgba(0,0,0,0.05)"), color: c(COLORS.text.dark, COLORS.text.light), fontWeight: 600, border: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}`, cursor: "pointer", borderRadius: 10, padding: size === "sm" ? "7px 14px" : "11px 22px", fontSize: size === "sm" ? 13 : 14, transition: "opacity 0.2s", display: "inline-flex", alignItems: "center", gap: 6, lineHeight: 1.4 },
      green:     { background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: 10, padding: size === "sm" ? "7px 14px" : "11px 22px", fontSize: size === "sm" ? 13 : 14, transition: "opacity 0.2s", display: "inline-flex", alignItems: "center", gap: 6, lineHeight: 1.4 },
      red:       { background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: 10, padding: size === "sm" ? "7px 14px" : "11px 22px", fontSize: size === "sm" ? 13 : 14, transition: "opacity 0.2s", display: "inline-flex", alignItems: "center", gap: 6, lineHeight: 1.4 },
      ghost:     { background: "transparent", color: c(COLORS.muted.dark, COLORS.muted.light), fontWeight: 500, border: "none", cursor: "pointer", borderRadius: 10, padding: size === "sm" ? "7px 14px" : "11px 22px", fontSize: size === "sm" ? 13 : 14, transition: "opacity 0.2s", display: "inline-flex", alignItems: "center", gap: 6, lineHeight: 1.4 },
    }[variant] || {}),
    input: { background: c("rgba(255,255,255,0.05)", "rgba(0,0,0,0.03)"), border: `1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}`, borderRadius: 10, padding: "11px 14px", color: c(COLORS.text.dark, COLORS.text.light), fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  };

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#334155; border-radius:3px; }
        input::placeholder, select option { color:#64748b; }
        button:hover { opacity:0.85; }
        button:active { transform:scale(0.98); }
        select { appearance:none; }
      `}</style>

      {notification && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:9999, background: notification.type==="success"?COLORS.green:notification.type==="error"?COLORS.red:COLORS.blue, color:"#fff", padding:"13px 20px", borderRadius:12, fontWeight:600, fontSize:13, boxShadow:"0 8px 32px rgba(0,0,0,0.25)", maxWidth:340, animation:"slideIn 0.3s ease" }}>
          {notification.type==="success"?"✅ ":notification.type==="error"?"❌ ":"ℹ️ "}{notification.msg}
        </div>
      )}

      {page === "login"      && <LoginPage styles={styles} c={c} isDark={isDark} navigate={navigate} login={login} notify={notify} accounts={accounts} theme={theme} setTheme={setTheme} />}
      {page === "register"   && <RegisterPage styles={styles} c={c} isDark={isDark} navigate={navigate} login={login} notify={notify} accounts={accounts} setAccounts={setAccounts} theme={theme} setTheme={setTheme} />}
      {page === "marketplace"&& <MarketplacePage styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} offers={offers} selectedCrypto={selectedCrypto} setSelectedCrypto={setSelectedCrypto} theme={theme} setTheme={setTheme} notify={notify} />}
      {page === "buy"        && <BuyPage styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} offer={selectedOffer} orders={orders} setOrders={setOrders} notify={notify} />}
      {page === "dashboard"  && <DashboardPage styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} orders={orders} setOrders={setOrders} notify={notify} theme={theme} setTheme={setTheme} />}
      {page === "seller"     && <SellerPage styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} offers={offers} setOffers={setOffers} orders={orders} setOrders={setOrders} notify={notify} theme={theme} setTheme={setTheme} />}
      {page === "admin"      && <AdminPage styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} offers={offers} orders={orders} setOrders={setOrders} notify={notify} theme={theme} setTheme={setTheme} accounts={accounts} />}
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ styles, c, isDark, navigate, user, logout, theme, setTheme }) {
  return (
    <nav style={{ background: c("rgba(8,13,26,0.97)", "rgba(255,255,255,0.97)"), backdropFilter:"blur(20px)", borderBottom:`1px solid ${c("rgba(255,255,255,0.07)","rgba(0,0,0,0.07)")}`, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, padding:"0 24px" }}>
        <div onClick={() => navigate(user?.isAdmin ? "admin" : "marketplace")} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }}>
          <div style={{ width:34, height:34, background:"linear-gradient(135deg, #f59e0b, #d97706)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, color:"#000" }}>₿</div>
          <span style={{ fontWeight:900, fontSize:18, background:"linear-gradient(135deg, #f59e0b, #fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CryptoP2P</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {user && !user.isAdmin && <button onClick={() => navigate("marketplace")} style={styles.btn("ghost","sm")}>Marketplace</button>}
          {user && !user.isAdmin && <button onClick={() => navigate("dashboard")} style={styles.btn("ghost","sm")}>Mon compte</button>}
          {user?.isSeller && !user.isAdmin && <button onClick={() => navigate("seller")} style={styles.btn("ghost","sm")}>Vendeur</button>}
          {user?.isAdmin && <button onClick={() => navigate("admin")} style={styles.btn("ghost","sm")}>Administration</button>}

          <button onClick={() => setTheme(theme==="dark"?"light":"dark")} style={{ ...styles.btn("secondary","sm"), padding:"7px 10px", fontSize:15 }}>{theme==="dark"?"☀️":"🌙"}</button>

          {user && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg, #f59e0b, #d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#000", fontSize:13 }}>{user.name[0]}</div>
              <button onClick={logout} style={styles.btn("secondary","sm")}>Déconnexion</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── AUTH LAYOUT ──────────────────────────────────────────────────────────────
function AuthLayout({ styles, c, isDark, theme, setTheme, children }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, background:"linear-gradient(135deg, #f59e0b, #d97706)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, color:"#000" }}>₿</div>
          <span style={{ fontWeight:900, fontSize:18, background:"linear-gradient(135deg, #f59e0b, #fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CryptoP2P</span>
        </div>
        <button onClick={() => setTheme(theme==="dark"?"light":"dark")} style={{ ...styles.btn("secondary","sm"), padding:"7px 10px", fontSize:15 }}>{theme==="dark"?"☀️":"🌙"}</button>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 24px 48px" }}>
        {children}
      </div>
    </div>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ styles, c, isDark, navigate, login, notify, accounts, theme, setTheme }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!form.email || !form.password) { notify("Remplissez tous les champs", "error"); return; }
    setLoading(true);
    setTimeout(() => {
      const found = accounts.find(a => a.email.toLowerCase() === form.email.toLowerCase() && a.password === form.password);
      if (!found) {
        notify("Email ou mot de passe incorrect", "error");
        setLoading(false);
        return;
      }
      login(found);
      setLoading(false);
    }, 900);
  };

  return (
    <AuthLayout styles={styles} c={c} isDark={isDark} theme={theme} setTheme={setTheme}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={styles.card}>
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontSize:22, fontWeight:800, marginBottom:6 }}>Connexion</h1>
            <p style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:14 }}>Accédez à votre compte CryptoP2P</p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 }}>
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(COLORS.muted.dark, COLORS.muted.light) }}>Adresse email</label>
              <input style={styles.input} placeholder="votre@email.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} onKeyDown={e => e.key==="Enter" && handleSubmit()} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(COLORS.muted.dark, COLORS.muted.light) }}>Mot de passe</label>
              <input style={styles.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password:e.target.value})} onKeyDown={e => e.key==="Enter" && handleSubmit()} />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{ ...styles.btn("primary"), width:"100%", justifyContent:"center", opacity:loading?0.7:1 }}>
            {loading ? "Vérification..." : "Se connecter →"}
          </button>

          <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:c(COLORS.muted.dark, COLORS.muted.light) }}>
            Pas encore de compte ?{" "}
            <span onClick={() => navigate("register")} style={{ color:COLORS.primary, cursor:"pointer", fontWeight:600 }}>S'inscrire</span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
function RegisterPage({ styles, c, isDark, navigate, login, notify, accounts, setAccounts, theme, setTheme }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password || !form.confirm) { notify("Remplissez tous les champs", "error"); return; }
    if (form.password !== form.confirm) { notify("Les mots de passe ne correspondent pas", "error"); return; }
    if (form.password.length < 8) { notify("Mot de passe trop court (8 caractères minimum)", "error"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { notify("Format d'email invalide", "error"); return; }
    const exists = accounts.find(a => a.email.toLowerCase() === form.email.toLowerCase());
    if (exists) { notify("Cet email est déjà utilisé", "error"); return; }

    setLoading(true);
    setTimeout(() => {
      const newUser = { id:`u_${Date.now()}`, name:form.name, email:form.email, password:form.password, isAdmin:false, isSeller:false };
      setAccounts(prev => [...prev, newUser]);
      login(newUser);
      setLoading(false);
    }, 1200);
  };

  return (
    <AuthLayout styles={styles} c={c} isDark={isDark} theme={theme} setTheme={setTheme}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={styles.card}>
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontSize:22, fontWeight:800, marginBottom:6 }}>Créer un compte</h1>
            <p style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:14 }}>Rejoignez la marketplace P2P crypto d'Afrique</p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
            {[
              { key:"name", label:"Nom complet", placeholder:"Jean Dupont", type:"text" },
              { key:"email", label:"Adresse email", placeholder:"votre@email.com", type:"email" },
              { key:"password", label:"Mot de passe", placeholder:"Minimum 8 caractères", type:"password" },
              { key:"confirm", label:"Confirmer le mot de passe", placeholder:"••••••••", type:"password" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(COLORS.muted.dark, COLORS.muted.light) }}>{f.label}</label>
                <input style={styles.input} type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({...form, [f.key]:e.target.value})} />
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{ ...styles.btn("primary"), width:"100%", justifyContent:"center", opacity:loading?0.7:1 }}>
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>

          <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:c(COLORS.muted.dark, COLORS.muted.light) }}>
            Déjà un compte ?{" "}
            <span onClick={() => navigate("login")} style={{ color:COLORS.primary, cursor:"pointer", fontWeight:600 }}>Se connecter</span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

// ─── MARKETPLACE ──────────────────────────────────────────────────────────────
function MarketplacePage({ styles, c, isDark, navigate, user, logout, offers, selectedCrypto, setSelectedCrypto, theme, setTheme, notify }) {
  const [search, setSearch] = useState("");
  const filtered = offers.filter(o =>
    (selectedCrypto === "all" || o.crypto === selectedCrypto) &&
    (search === "" || o.sellerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <Navbar styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} theme={theme} setTheme={setTheme} />
      <div style={{ maxWidth:1160, margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:26, fontWeight:900, marginBottom:6 }}>Marketplace P2P</h1>
          <p style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:14 }}>Achetez des crypto-monnaies directement auprès de vendeurs vérifiés</p>
        </div>

        {/* Crypto Filter */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
          <button onClick={() => setSelectedCrypto("all")} style={styles.btn(selectedCrypto==="all"?"primary":"secondary","sm")}>🌐 Tout</button>
          {CRYPTOS.map(cr => (
            <button key={cr.id} onClick={() => setSelectedCrypto(cr.id)} style={styles.btn(selectedCrypto===cr.id?"primary":"secondary","sm")}>
              <span style={{ color:cr.color }}>{cr.icon}</span> {cr.symbol}
              <span style={{ opacity:0.6, fontSize:11 }}>{cr.network}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position:"relative", maxWidth:380, marginBottom:24 }}>
          <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:14 }}>🔍</span>
          <input style={{ ...styles.input, paddingLeft:38 }} placeholder="Rechercher un vendeur..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Offers */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:c(COLORS.muted.dark, COLORS.muted.light) }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <p>Aucune offre trouvée</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
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
    <div style={{ ...styles.card, padding:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        {/* Seller */}
        <div style={{ display:"flex", alignItems:"center", gap:12, flex:"1 1 200px", minWidth:0 }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:46, height:46, borderRadius:"50%", background:"linear-gradient(135deg, #1e3a5f, #0f2035)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:700, color:COLORS.primary, border:`2px solid ${offer.verified?COLORS.green:c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}` }}>
              {offer.sellerAvatar}
            </div>
            <div style={{ position:"absolute", bottom:1, right:1, width:11, height:11, borderRadius:"50%", background:offer.online?COLORS.green:"#6b7280", border:`2px solid ${c(COLORS.card.dark, COLORS.card.light)}` }} />
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontWeight:700, fontSize:14 }}>{offer.sellerName}</span>
              {offer.verified && <span style={{ background:"rgba(16,185,129,0.12)", color:COLORS.green, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:100, whiteSpace:"nowrap" }}>✓ VÉRIFIÉ</span>}
            </div>
            <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light), marginTop:2 }}>
              {offer.completedTrades} trades • {offer.successRate}% succès
            </div>
          </div>
        </div>

        {/* Crypto & Rate */}
        <div style={{ flex:"1 1 170px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
            <span style={{ fontSize:22, color:crypto.color }}>{crypto.icon}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{crypto.name}</div>
              <div style={{ fontSize:11, color:c(COLORS.muted.dark, COLORS.muted.light) }}>Réseau {crypto.network}</div>
            </div>
          </div>
          <div style={{ fontSize:19, fontWeight:900, color:COLORS.primary }}>
            {fmt(offer.rate)} <span style={{ fontSize:12, fontWeight:500, color:c(COLORS.muted.dark, COLORS.muted.light) }}>FCFA/{crypto.symbol}</span>
          </div>
        </div>

        {/* Limits */}
        <div style={{ flex:"1 1 150px", fontSize:12.5, color:c(COLORS.muted.dark, COLORS.muted.light) }}>
          <div style={{ marginBottom:4 }}>Min–Max : {offer.minAmount} — {fmt(offer.maxAmount)} {crypto.symbol}</div>
          <div style={{ marginBottom:8 }}>Dispo : <span style={{ color:COLORS.green, fontWeight:600 }}>{fmt(offer.available)} {crypto.symbol}</span></div>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {offer.paymentMethods.map(m => (
              <span key={m} style={{ background:c("rgba(255,255,255,0.07)","rgba(0,0,0,0.06)"), borderRadius:6, padding:"2px 7px", fontSize:11, fontWeight:600 }}>{m}</span>
            ))}
          </div>
        </div>

        <button onClick={handleBuy} style={{ ...styles.btn("primary"), whiteSpace:"nowrap", flexShrink:0 }}>
          Acheter {crypto.symbol} →
        </button>
      </div>
    </div>
  );
}

// ─── BUY PAGE ─────────────────────────────────────────────────────────────────
function BuyPage({ styles, c, isDark, navigate, user, offer, orders, setOrders, notify }) {
  const [step, setStep] = useState(1);
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [walletError, setWalletError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!offer) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
        <p style={{ marginBottom:20, color:c(COLORS.muted.dark, COLORS.muted.light) }}>Aucune offre sélectionnée</p>
        <button onClick={() => navigate("marketplace")} style={styles.btn("primary")}>← Retour au marketplace</button>
      </div>
    </div>
  );

  const crypto = getCrypto(offer.crypto);
  const amountFCFA = amount ? Math.round(parseFloat(amount) * offer.rate) : 0;

  const validateWallet = (addr) => {
    if (!addr) { setWalletError(""); return; }
    setWalletError(crypto.addrRegex.test(addr) ? "" : `Format invalide. Exemple : ${crypto.addrExample}`);
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
      setOrders(prev => [{ id, crypto:offer.crypto, amount:parseFloat(amount), amountFCFA, walletAddr:wallet.slice(0,8)+"..."+wallet.slice(-4), seller:offer.sellerName, status:"paid", createdAt:new Date().toISOString() }, ...prev]);
      setStep(3);
      setLoading(false);
      notify("Paiement confirmé ! Le vendeur va envoyer vos cryptos.");
    }, 2000);
  };

  const steps = ["Détails", "Paiement", "Confirmation"];

  return (
    <div style={{ minHeight:"100vh" }}>
      <nav style={{ background:c("rgba(8,13,26,0.97)","rgba(255,255,255,0.97)"), backdropFilter:"blur(20px)", borderBottom:`1px solid ${c("rgba(255,255,255,0.07)","rgba(0,0,0,0.07)")}`, padding:"0 24px" }}>
        <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", alignItems:"center", height:60, gap:14 }}>
          <button onClick={() => navigate("marketplace")} style={styles.btn("secondary","sm")}>← Retour</button>
          <span style={{ fontWeight:700, fontSize:15 }}>Acheter {crypto.name}</span>
        </div>
      </nav>

      <div style={{ maxWidth:540, margin:"36px auto", padding:"0 24px" }}>
        {/* Progress Steps */}
        <div style={{ display:"flex", alignItems:"center", marginBottom:36 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:step>i+1?COLORS.green:step===i+1?COLORS.primary:c("rgba(255,255,255,0.1)","rgba(0,0,0,0.1)"), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, color:step>=i+1?"#000":c(COLORS.muted.dark, COLORS.muted.light), marginBottom:5, transition:"background 0.3s" }}>
                  {step>i+1?"✓":i+1}
                </div>
                <span style={{ fontSize:11, color:step===i+1?COLORS.primary:c(COLORS.muted.dark, COLORS.muted.light), whiteSpace:"nowrap" }}>{s}</span>
              </div>
              {i<2 && <div style={{ height:2, flex:1, background:step>i+1?COLORS.green:c("rgba(255,255,255,0.1)","rgba(0,0,0,0.1)"), margin:"0 6px 18px", transition:"background 0.3s" }} />}
            </div>
          ))}
        </div>

        {/* Seller Summary */}
        <div style={{ ...styles.card, padding:16, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg, #1e3a5f, #0f2035)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:COLORS.primary, fontSize:15, flexShrink:0 }}>
            {offer.sellerAvatar}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{offer.sellerName}</div>
            <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light) }}>{offer.completedTrades} trades • {offer.successRate}% succès</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontWeight:800, color:COLORS.primary, fontSize:16 }}>{fmt(offer.rate)}</div>
            <div style={{ fontSize:11, color:c(COLORS.muted.dark, COLORS.muted.light) }}>FCFA / {crypto.symbol}</div>
          </div>
        </div>

        {/* Step 1 */}
        {step===1 && (
          <div style={styles.card}>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:22 }}>Détails de la commande</h2>

            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(COLORS.muted.dark, COLORS.muted.light) }}>
                Adresse Wallet {crypto.name} ({crypto.network}) *
              </label>
              <input
                style={{ ...styles.input, borderColor:walletError?COLORS.red:wallet&&!walletError?COLORS.green:undefined }}
                placeholder={crypto.addrExample}
                value={wallet}
                onChange={e => { setWallet(e.target.value); validateWallet(e.target.value); }}
              />
              {walletError && <p style={{ color:COLORS.red, fontSize:12, marginTop:5 }}>⚠️ {walletError}</p>}
              {wallet && !walletError && <p style={{ color:COLORS.green, fontSize:12, marginTop:5 }}>✅ Adresse valide</p>}
            </div>

            <div style={{ marginBottom:22 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(COLORS.muted.dark, COLORS.muted.light) }}>
                Quantité de {crypto.symbol} *
              </label>
              <div style={{ position:"relative" }}>
                <input
                  style={{ ...styles.input, paddingRight:72 }}
                  type="number"
                  placeholder={`Min: ${offer.minAmount}`}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", fontWeight:700, color:crypto.color, fontSize:13 }}>{crypto.symbol}</span>
              </div>
              <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light), marginTop:5 }}>
                Limites : {offer.minAmount} – {fmt(offer.maxAmount)} {crypto.symbol}
              </div>
            </div>

            {amountFCFA>0 && (
              <div style={{ background:c("rgba(245,158,11,0.07)","rgba(245,158,11,0.07)"), border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:16, marginBottom:22 }}>
                {[
                  ["Vous recevez", `${amount} ${crypto.symbol}`],
                  ["Taux appliqué", `${fmt(offer.rate)} FCFA/${crypto.symbol}`],
                ].map(([l,v]) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                    <span style={{ color:c(COLORS.muted.dark, COLORS.muted.light) }}>{l}</span>
                    <span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ height:1, background:c("rgba(255,255,255,0.1)","rgba(0,0,0,0.1)"), margin:"10px 0" }} />
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontWeight:700 }}>Total à payer</span>
                  <span style={{ fontWeight:900, fontSize:19, color:COLORS.primary }}>{fmt(amountFCFA)} FCFA</span>
                </div>
              </div>
            )}

            <button onClick={handlePay} style={{ ...styles.btn("primary"), width:"100%", justifyContent:"center" }}>
              Continuer → Paiement
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step===2 && (
          <div style={styles.card}>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>Paiement Mobile Money</h2>
            <p style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:13, marginBottom:22 }}>Confirmez votre paiement</p>

            <div style={{ background:c("rgba(16,185,129,0.07)","rgba(16,185,129,0.06)"), border:"1px solid rgba(16,185,129,0.2)", borderRadius:12, padding:16, marginBottom:20 }}>
              <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>📋 Récapitulatif</div>
              {[
                ["Crypto à recevoir", `${amount} ${crypto.symbol}`],
                ["Adresse wallet", `${wallet.slice(0,12)}...${wallet.slice(-4)}`],
                ["Vendeur", offer.sellerName],
              ].map(([l,v]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13 }}>
                  <span style={{ color:c(COLORS.muted.dark, COLORS.muted.light) }}>{l}</span>
                  <strong>{v}</strong>
                </div>
              ))}
              <div style={{ height:1, background:c("rgba(255,255,255,0.1)","rgba(0,0,0,0.1)"), margin:"10px 0" }} />
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontWeight:700 }}>Total</span>
                <span style={{ fontWeight:900, color:COLORS.primary, fontSize:18 }}>{fmt(amountFCFA)} FCFA</span>
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:13, fontWeight:600, color:c(COLORS.muted.dark, COLORS.muted.light), marginBottom:10 }}>Paiements acceptés</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {offer.paymentMethods.map(m => (
                  <div key={m} style={{ border:`1.5px solid ${COLORS.primary}`, borderRadius:10, padding:"11px 14px", textAlign:"center", fontWeight:600, fontSize:13, background:"rgba(245,158,11,0.04)" }}>
                    📱 {m}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button onClick={confirmPayment} disabled={loading} style={{ ...styles.btn("green"), width:"100%", justifyContent:"center", fontSize:15, opacity:loading?0.7:1 }}>
                {loading?"⏳ Traitement...": `💳 Payer ${fmt(amountFCFA)} FCFA`}
              </button>
              <button onClick={() => setStep(1)} style={{ ...styles.btn("ghost"), width:"100%", justifyContent:"center" }}>
                ← Modifier la commande
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step===3 && (
          <div style={{ ...styles.card, textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
            <h2 style={{ fontSize:22, fontWeight:900, marginBottom:8 }}>Paiement confirmé !</h2>
            <p style={{ color:c(COLORS.muted.dark, COLORS.muted.light), marginBottom:24, fontSize:14 }}>
              Commande <strong style={{ color:COLORS.primary }}>{orderId}</strong> créée. Le vendeur va vous envoyer vos cryptos.
            </p>

            <div style={{ background:c("rgba(245,158,11,0.07)","rgba(245,158,11,0.06)"), borderRadius:12, padding:20, marginBottom:24, textAlign:"left" }}>
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>📌 Prochaines étapes</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  ["🔔","Le vendeur reçoit une notification"],
                  ["📤","Il envoie vos cryptos manuellement"],
                  ["✅","Vous confirmez la réception"],
                  ["🔒","Les fonds du vendeur sont libérés"],
                ].map(([icon,text],i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13 }}>
                    <span style={{ fontSize:16 }}>{icon}</span>
                    <span style={{ color:c(COLORS.muted.dark, COLORS.muted.light) }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
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

  const confirmReception = (id) => {
    setOrders(orders.map(o => o.id===id?{...o, status:"confirmed"}:o));
    setConfirmModal(null);
    notify("Réception confirmée ! Transaction terminée. ✅");
  };

  const openDispute = (id) => {
    setOrders(orders.map(o => o.id===id?{...o, status:"disputed"}:o));
    notify("Litige ouvert. Le support va analyser votre cas.", "error");
  };

  const tabs = [{ id:"orders", label:"Mes commandes" }, { id:"profile", label:"Mon profil" }];

  return (
    <div>
      <Navbar styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} theme={theme} setTheme={setTheme} />

      {confirmModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ ...styles.card, maxWidth:400, width:"100%" }}>
            <h3 style={{ fontSize:18, fontWeight:800, marginBottom:10 }}>Confirmer la réception ?</h3>
            <p style={{ color:c(COLORS.muted.dark, COLORS.muted.light), marginBottom:22, fontSize:14, lineHeight:1.6 }}>
              En confirmant, vous attestez avoir reçu vos cryptos. Cette action est <strong>irréversible</strong>.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => confirmReception(confirmModal)} style={{ ...styles.btn("green"), flex:1, justifyContent:"center" }}>✅ Confirmer</button>
              <button onClick={() => setConfirmModal(null)} style={{ ...styles.btn("secondary"), flex:1, justifyContent:"center" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:980, margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28, flexWrap:"wrap" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg, #f59e0b, #d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:20, color:"#000" }}>
            {user?.name?.[0]||"U"}
          </div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:900 }}>Bonjour, {user?.name} 👋</h1>
            <p style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:13, marginTop:2 }}>Gérez vos achats et confirmez vos réceptions</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px,1fr))", gap:12, marginBottom:28 }}>
          {[
            { label:"Total", value:orders.length, icon:"📦", color:COLORS.blue },
            { label:"En attente", value:orders.filter(o=>o.status==="paid").length, icon:"⏳", color:COLORS.primary },
            { label:"Livrées", value:orders.filter(o=>o.status==="delivered").length, icon:"🚚", color:COLORS.purple },
            { label:"Confirmées", value:orders.filter(o=>o.status==="confirmed").length, icon:"✅", color:COLORS.green },
          ].map(s => (
            <div key={s.label} style={{ ...styles.card, padding:18 }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:24, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light), marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:20, borderBottom:`1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}`, paddingBottom:0 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ ...styles.btn(activeTab===tab.id?"primary":"ghost","sm"), borderRadius:"8px 8px 0 0", paddingBottom:13 }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab==="orders" && (
          <div>
            {orders.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:c(COLORS.muted.dark, COLORS.muted.light) }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                <p style={{ marginBottom:16 }}>Aucune commande pour l'instant</p>
                <button onClick={() => navigate("marketplace")} style={styles.btn("primary")}>Découvrir les offres →</button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {orders.map(order => {
                  const crypto = getCrypto(order.crypto);
                  const status = statusConfig[order.status]||statusConfig.pending;
                  return (
                    <div key={order.id} style={{ ...styles.card, padding:18 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                        <div style={{ flex:"1 1 180px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, flexWrap:"wrap" }}>
                            <span style={{ fontWeight:700, color:COLORS.primary, fontSize:13 }}>{order.id}</span>
                            <span style={{ background:status.bg, color:status.color, padding:"2px 9px", borderRadius:100, fontSize:11, fontWeight:700 }}>{status.label}</span>
                          </div>
                          <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light) }}>
                            {new Date(order.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                          </div>
                        </div>
                        <div style={{ flex:"1 1 140px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                            <span style={{ color:crypto.color, fontSize:18 }}>{crypto.icon}</span>
                            <div>
                              <div style={{ fontWeight:700, fontSize:14 }}>{order.amount} {crypto.symbol}</div>
                              <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light) }}>{fmt(order.amountFCFA)} FCFA</div>
                            </div>
                          </div>
                        </div>
                        <div style={{ flex:"1 1 140px", fontSize:12.5, color:c(COLORS.muted.dark, COLORS.muted.light) }}>
                          <div>Vendeur : <strong>{order.seller}</strong></div>
                          <div>Wallet : {order.walletAddr}</div>
                        </div>
                        <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignItems:"center" }}>
                          {order.status==="delivered" && <>
                            <button onClick={() => setConfirmModal(order.id)} style={styles.btn("green","sm")}>✅ Confirmer réception</button>
                            <button onClick={() => openDispute(order.id)} style={styles.btn("red","sm")}>⚠️ Litige</button>
                          </>}
                          {order.status==="paid" && <span style={{ fontSize:12, color:COLORS.primary, fontStyle:"italic" }}>⏳ Attente envoi...</span>}
                          {order.status==="confirmed" && <span style={{ color:COLORS.green, fontSize:12, fontWeight:600 }}>✅ Terminé</span>}
                          {order.status==="disputed" && <span style={{ color:COLORS.red, fontSize:12, fontWeight:600 }}>⚠️ Litige en cours</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab==="profile" && (
          <div style={styles.card}>
            <h3 style={{ fontSize:17, fontWeight:700, marginBottom:20 }}>Informations du compte</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {[
                { label:"Nom complet", value:user?.name },
                { label:"Adresse email", value:user?.email },
                { label:"Statut", value:user?.isSeller?"Vendeur vérifié":"Acheteur" },
              ].map(f => (
                <div key={f.label} style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}` }}>
                  <span style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:14 }}>{f.label}</span>
                  <span style={{ fontWeight:600, fontSize:14 }}>{f.value}</span>
                </div>
              ))}
            </div>
            {!user?.isSeller && (
              <div style={{ marginTop:24, padding:20, background:c("rgba(245,158,11,0.07)","rgba(245,158,11,0.06)"), border:"1px solid rgba(245,158,11,0.2)", borderRadius:12 }}>
                <h4 style={{ fontWeight:700, marginBottom:8 }}>Devenir vendeur</h4>
                <p style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:13, marginBottom:14, lineHeight:1.6 }}>Contactez notre équipe pour être validé comme vendeur.</p>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...styles.btn("green","sm"), textDecoration:"none" }}>📱 WhatsApp</a>
                  <a href="mailto:erickpakpo786@gmail.com" style={{ ...styles.btn("secondary","sm"), textDecoration:"none" }}>✉️ Email</a>
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
  const [newOffer, setNewOffer] = useState({ crypto:"usdt_trc20", rate:"", minAmount:"", maxAmount:"", available:"", paymentMethods:[] });
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount:"", reseau:"", numero:"", nom:"" });

  const sellerOrders = orders.map(o => ({ ...o, status:o.status==="pending"?"paid":o.status }));
  const earnings = { total:485000, blocked:65000, available:420000 };

  const markDelivered = (id) => {
    setOrders(orders.map(o => o.id===id?{...o,status:"delivered"}:o));
    notify("Crypto marquée comme livrée. En attente de confirmation acheteur.");
  };

  const handleWithdraw = () => {
    if (!withdrawForm.amount || !withdrawForm.reseau || !withdrawForm.numero || !withdrawForm.nom) { notify("Remplissez tous les champs", "error"); return; }
    setWithdrawModal(false);
    setWithdrawForm({ amount:"", reseau:"", numero:"", nom:"" });
    notify("Demande de retrait envoyée ! Traitement en moins de 5 minutes. 💸");
  };

  const createOffer = () => {
    if (!newOffer.rate || !newOffer.minAmount || !newOffer.maxAmount || !newOffer.available) { notify("Remplissez tous les champs", "error"); return; }
    const offer = {
      id:`o_${Date.now()}`, sellerId:"v_seller", sellerName:user.name, sellerAvatar:user.name[0],
      verified:true, crypto:newOffer.crypto, rate:parseFloat(newOffer.rate),
      minAmount:parseFloat(newOffer.minAmount), maxAmount:parseFloat(newOffer.maxAmount),
      available:parseFloat(newOffer.available),
      paymentMethods:newOffer.paymentMethods.length?newOffer.paymentMethods:["MTN MoMo"],
      completedTrades:0, successRate:100, online:true,
    };
    setOffers([offer, ...offers]);
    setShowNewOffer(false);
    setNewOffer({ crypto:"usdt_trc20", rate:"", minAmount:"", maxAmount:"", available:"", paymentMethods:[] });
    notify("Offre publiée avec succès ! ✅");
  };

  return (
    <div>
      <Navbar styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} theme={theme} setTheme={setTheme} />

      {withdrawModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ ...styles.card, maxWidth:400, width:"100%" }}>
            <h3 style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>Retrait Mobile Money</h3>
            <p style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:13, marginBottom:20 }}>
              Disponible : <strong style={{ color:COLORS.green }}>{fmt(earnings.available)} FCFA</strong>
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
              {[
                { key:"amount", label:"Montant (FCFA)", placeholder:"Ex: 50000", type:"number" },
                { key:"reseau", label:"Réseau Mobile Money", placeholder:"MTN, Orange, Moov..." },
                { key:"numero", label:"Numéro Mobile Money", placeholder:"+229 XX XX XX XX" },
                { key:"nom", label:"Nom du bénéficiaire", placeholder:"Jean Dupont" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display:"block", fontSize:12, fontWeight:600, color:c(COLORS.muted.dark, COLORS.muted.light), marginBottom:5 }}>{f.label}</label>
                  <input style={styles.input} type={f.type||"text"} placeholder={f.placeholder} value={withdrawForm[f.key]} onChange={e => setWithdrawForm({...withdrawForm,[f.key]:e.target.value})} />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={handleWithdraw} style={{ ...styles.btn("primary"), flex:1, justifyContent:"center" }}>💸 Retirer</button>
              <button onClick={() => setWithdrawModal(false)} style={{ ...styles.btn("secondary"), flex:1, justifyContent:"center" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:980, margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:22, fontWeight:900 }}>Espace Vendeur 🏪</h1>
          <p style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:13, marginTop:4 }}>Gérez vos offres et commandes</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:12, marginBottom:28 }}>
          {[
            { label:"Revenus totaux", value:`${fmt(earnings.total)} FCFA`, icon:"💰", color:COLORS.primary },
            { label:"Fonds bloqués", value:`${fmt(earnings.blocked)} FCFA`, icon:"🔒", color:COLORS.primary },
            { label:"Disponibles", value:`${fmt(earnings.available)} FCFA`, icon:"✅", color:COLORS.green },
            { label:"Commandes actives", value:sellerOrders.filter(o=>o.status==="paid").length, icon:"📦", color:COLORS.blue },
          ].map(s => (
            <div key={s.label} style={{ ...styles.card, padding:18 }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:typeof s.value==="number"?24:16, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light), marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[["orders","Commandes"],["offers","Mes offres"],["finance","Finances"]].map(([id,label]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={styles.btn(activeTab===id?"primary":"secondary","sm")}>{label}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {activeTab==="offers" && <button onClick={() => setShowNewOffer(!showNewOffer)} style={styles.btn("primary","sm")}>+ Nouvelle offre</button>}
            {activeTab==="finance" && <button onClick={() => setWithdrawModal(true)} style={styles.btn("green","sm")}>💸 Retrait</button>}
          </div>
        </div>

        {activeTab==="orders" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {sellerOrders.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:c(COLORS.muted.dark, COLORS.muted.light) }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                <p>Aucune commande pour l'instant</p>
              </div>
            ) : sellerOrders.map(order => {
              const crypto = getCrypto(order.crypto);
              const status = statusConfig[order.status]||statusConfig.pending;
              return (
                <div key={order.id} style={{ ...styles.card, padding:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ flex:"1 1 150px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, color:COLORS.primary, fontSize:13 }}>{order.id}</span>
                        <span style={{ background:status.bg, color:status.color, padding:"2px 8px", borderRadius:100, fontSize:11, fontWeight:700 }}>{status.label}</span>
                      </div>
                      <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light) }}>
                        {new Date(order.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
                      </div>
                    </div>
                    <div style={{ flex:"1 1 130px" }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{order.amount} {crypto.symbol}</div>
                      <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light) }}>{fmt(order.amountFCFA)} FCFA</div>
                    </div>
                    <div style={{ flex:"1 1 130px", fontSize:12.5, color:c(COLORS.muted.dark, COLORS.muted.light) }}>Wallet : {order.walletAddr}</div>
                    <div>
                      {order.status==="paid" && <button onClick={() => markDelivered(order.id)} style={styles.btn("primary","sm")}>📤 Marquer livré</button>}
                      {order.status==="delivered" && <span style={{ color:COLORS.purple, fontSize:12, fontWeight:600 }}>⏳ Attente confirmation</span>}
                      {order.status==="confirmed" && <span style={{ color:COLORS.green, fontSize:12, fontWeight:600 }}>✅ Fonds crédités</span>}
                      {order.status==="disputed" && <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...styles.btn("red","sm"), textDecoration:"none" }}>⚠️ Support</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab==="offers" && (
          <div>
            {showNewOffer && (
              <div style={{ ...styles.card, marginBottom:20, border:`1px solid rgba(245,158,11,0.3)` }}>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Nouvelle offre</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div style={{ gridColumn:"1 / -1" }}>
                    <label style={{ display:"block", fontSize:12, fontWeight:600, color:c(COLORS.muted.dark, COLORS.muted.light), marginBottom:6 }}>Crypto-monnaie</label>
                    <select style={{ ...styles.input }} value={newOffer.crypto} onChange={e => setNewOffer({...newOffer, crypto:e.target.value})}>
                      {CRYPTOS.map(cr => <option key={cr.id} value={cr.id}>{cr.name} ({cr.network})</option>)}
                    </select>
                  </div>
                  {[
                    {key:"rate",label:"Taux (FCFA/unité)",placeholder:"ex: 650"},
                    {key:"available",label:"Disponible (en crypto)",placeholder:"ex: 10000"},
                    {key:"minAmount",label:"Montant minimum",placeholder:"ex: 10"},
                    {key:"maxAmount",label:"Montant maximum",placeholder:"ex: 5000"},
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display:"block", fontSize:12, fontWeight:600, color:c(COLORS.muted.dark, COLORS.muted.light), marginBottom:6 }}>{f.label}</label>
                      <input style={styles.input} type="number" placeholder={f.placeholder} value={newOffer[f.key]} onChange={e => setNewOffer({...newOffer,[f.key]:e.target.value})} />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16, display:"flex", gap:8 }}>
                  <button onClick={createOffer} style={styles.btn("primary","sm")}>Publier ✅</button>
                  <button onClick={() => setShowNewOffer(false)} style={styles.btn("secondary","sm")}>Annuler</button>
                </div>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {offers.slice(0,4).map(offer => {
                const crypto = getCrypto(offer.crypto);
                return (
                  <div key={offer.id} style={{ ...styles.card, padding:18, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ flex:"1 1 150px", display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ color:crypto.color, fontSize:22 }}>{crypto.icon}</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14 }}>{crypto.name}</div>
                        <div style={{ fontSize:11, color:c(COLORS.muted.dark, COLORS.muted.light) }}>Réseau {crypto.network}</div>
                      </div>
                    </div>
                    <div style={{ flex:"1 1 130px" }}>
                      <div style={{ fontWeight:800, fontSize:17, color:COLORS.primary }}>{fmt(offer.rate)} FCFA</div>
                      <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light) }}>Dispo : {fmt(offer.available)}</div>
                    </div>
                    <span style={{ background:"rgba(16,185,129,0.12)", color:COLORS.green, padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>● Active</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab==="finance" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={styles.card}>
              <h3 style={{ fontWeight:700, fontSize:17, marginBottom:20 }}>📊 Bilan financier</h3>
              {[
                { label:"Revenus totaux", value:`${fmt(earnings.total)} FCFA`, color:COLORS.primary },
                { label:"Fonds bloqués (24h)", value:`${fmt(earnings.blocked)} FCFA`, color:COLORS.primary, note:"Disponible après 24h" },
                { label:"Disponibles pour retrait", value:`${fmt(earnings.available)} FCFA`, color:COLORS.green },
              ].map(s => (
                <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:`1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}` }}>
                  <div>
                    <span style={{ fontWeight:600, fontSize:14 }}>{s.label}</span>
                    {s.note && <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light), marginTop:2 }}>{s.note}</div>}
                  </div>
                  <span style={{ fontWeight:800, fontSize:17, color:s.color }}>{s.value}</span>
                </div>
              ))}
              <button onClick={() => setWithdrawModal(true)} style={{ ...styles.btn("primary"), marginTop:20, width:"100%", justifyContent:"center" }}>
                💸 Demander un retrait
              </button>
            </div>
            <div style={styles.card}>
              <h3 style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>⏱️ Règles de retrait</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10, fontSize:13, color:c(COLORS.muted.dark, COLORS.muted.light) }}>
                {[
                  "Les fonds sont bloqués 24h après confirmation de l'acheteur",
                  "Après 24h, vous pouvez demander un retrait",
                  "Traitement en moins de 5 minutes via Mobile Money",
                  "En cas de litige, les fonds restent bloqués jusqu'à résolution",
                ].map((rule,i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", lineHeight:1.5 }}>
                    <span style={{ color:COLORS.primary, flexShrink:0 }}>→</span>
                    <span>{rule}</span>
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
function AdminPage({ styles, c, isDark, navigate, user, logout, offers, orders, setOrders, notify, theme, setTheme, accounts }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [allSellers] = useState([
    { id:"v1", name:"EricPro", email:"eric@pro.com", verified:true, trades:247, volume:3200000 },
    { id:"v2", name:"CryptoKing", email:"king@crypto.com", verified:true, trades:523, volume:7400000 },
    { id:"v3", name:"AfriTrade", email:"afri@trade.com", verified:false, trades:12, volume:180000 },
    { id:"v4", name:"NewTrader", email:"new@trader.com", verified:false, trades:0, volume:0 },
  ]);
  const [pendingSellers, setPendingSellers] = useState(allSellers.filter(s => !s.verified));
  const disputes = orders.filter(o => o.status==="disputed");

  const validateSeller = (id) => {
    setPendingSellers(pendingSellers.filter(s => s.id!==id));
    notify("Vendeur validé ! Il peut maintenant publier des offres. ✅");
  };
  const rejectSeller = (id) => {
    setPendingSellers(pendingSellers.filter(s => s.id!==id));
    notify("Demande refusée.", "error");
  };
  const validateDispute = (orderId) => {
    setOrders(orders.map(o => o.id===orderId?{...o,status:"confirmed"}:o));
    notify("Litige résolu. Transaction validée par l'admin. ✅");
  };

  const stats = {
    totalOrders: orders.length,
    totalVolume: orders.reduce((s,o) => s+o.amountFCFA, 0),
    pendingValidations: pendingSellers.length,
    activeDisputes: disputes.length,
    totalUsers: accounts.length,
  };

  const adminTabs = [
    {id:"overview", label:"Vue d'ensemble"},
    {id:"sellers", label:`Vendeurs${pendingSellers.length>0?` (${pendingSellers.length})`:""}`},
    {id:"disputes", label:`Litiges${disputes.length>0?` (${disputes.length})`:""}`},
    {id:"orders", label:"Commandes"},
    {id:"users", label:"Utilisateurs"},
  ];

  return (
    <div>
      <Navbar styles={styles} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} theme={theme} setTheme={setTheme} />

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <span style={{ fontSize:28 }}>⚙️</span>
          <div>
            <h1 style={{ fontSize:22, fontWeight:900 }}>Administration</h1>
            <p style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:13, marginTop:2 }}>Panneau de contrôle CryptoP2P</p>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:12, marginBottom:28 }}>
          {[
            { label:"Commandes", value:stats.totalOrders, icon:"📦", color:COLORS.blue },
            { label:"Volume FCFA", value:fmt(stats.totalVolume), icon:"💰", color:COLORS.primary },
            { label:"Utilisateurs", value:stats.totalUsers, icon:"👥", color:COLORS.purple },
            { label:"Vendeurs en attente", value:stats.pendingValidations, icon:"⏳", color:COLORS.primary },
            { label:"Litiges actifs", value:stats.activeDisputes, icon:"⚠️", color:COLORS.red },
          ].map(s => (
            <div key={s.label} style={{ ...styles.card, padding:18, borderLeft:`3px solid ${s.color}` }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light), marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:24, flexWrap:"wrap" }}>
          {adminTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={styles.btn(activeTab===tab.id?"primary":"secondary","sm")}>{tab.label}</button>
          ))}
        </div>

        {activeTab==="overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div style={styles.card}>
              <h3 style={{ fontWeight:700, marginBottom:16, fontSize:15 }}>📋 Statut des commandes</h3>
              {Object.entries(statusConfig).map(([k,v]) => {
                const count = orders.filter(o=>o.status===k).length;
                return (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}` }}>
                    <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:v.color, display:"inline-block" }} />
                      {v.label}
                    </span>
                    <span style={{ fontWeight:700, background:v.bg, color:v.color, padding:"2px 10px", borderRadius:100, fontSize:12 }}>{count}</span>
                  </div>
                );
              })}
            </div>
            <div style={styles.card}>
              <h3 style={{ fontWeight:700, marginBottom:16, fontSize:15 }}>🪙 Cryptos en offres</h3>
              {CRYPTOS.slice(0,5).map(cr => {
                const count = offers.filter(o=>o.crypto===cr.id).length;
                return (
                  <div key={cr.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${c(COLORS.cardBorder.dark, COLORS.cardBorder.light)}` }}>
                    <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                      <span style={{ color:cr.color, fontSize:16 }}>{cr.icon}</span>
                      {cr.name}
                    </span>
                    <span style={{ fontWeight:700, fontSize:13 }}>{count} offre{count!==1?"s":""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab==="sellers" && (
          <div>
            {pendingSellers.length>0 && (
              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14, color:COLORS.primary }}>⏳ Demandes en attente</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {pendingSellers.map(s => (
                    <div key={s.id} style={{ ...styles.card, padding:18, border:`1px solid rgba(245,158,11,0.25)` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:14 }}>{s.name}</div>
                          <div style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:12, marginTop:2 }}>{s.email}</div>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={() => validateSeller(s.id)} style={styles.btn("green","sm")}>✅ Valider</button>
                          <button onClick={() => rejectSeller(s.id)} style={styles.btn("red","sm")}>❌ Refuser</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Tous les vendeurs</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {allSellers.map(s => (
                <div key={s.id} style={{ ...styles.card, padding:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ flex:"1 1 150px" }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{s.name}</div>
                      <div style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:12 }}>{s.email}</div>
                    </div>
                    <div style={{ flex:"1 1 130px", fontSize:13, color:c(COLORS.muted.dark, COLORS.muted.light) }}>
                      <div>{s.trades} trades</div>
                      <div>{fmt(s.volume)} FCFA</div>
                    </div>
                    <span style={{ background:s.verified?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.12)", color:s.verified?COLORS.green:COLORS.primary, padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>
                      {s.verified?"✓ Vérifié":"⏳ En attente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==="disputes" && (
          <div>
            {disputes.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:c(COLORS.muted.dark, COLORS.muted.light) }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <p>Aucun litige actif</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {disputes.map(order => {
                  const crypto = getCrypto(order.crypto);
                  return (
                    <div key={order.id} style={{ ...styles.card, padding:18, border:`1px solid rgba(239,68,68,0.25)` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                        <div style={{ flex:"1 1 150px" }}>
                          <div style={{ fontWeight:700, color:COLORS.red, fontSize:13 }}>{order.id}</div>
                          <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light) }}>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</div>
                        </div>
                        <div style={{ flex:"1 1 130px" }}>
                          <div style={{ fontWeight:700, fontSize:14 }}>{order.amount} {crypto.symbol}</div>
                          <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light) }}>Vendeur : {order.seller}</div>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={() => validateDispute(order.id)} style={styles.btn("primary","sm")}>✅ Valider manuellement</button>
                          <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...styles.btn("secondary","sm"), textDecoration:"none" }}>💬 Contacter</a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab==="orders" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {orders.map(order => {
              const crypto = getCrypto(order.crypto);
              const status = statusConfig[order.status]||statusConfig.pending;
              return (
                <div key={order.id} style={{ ...styles.card, padding:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <span style={{ fontWeight:700, fontSize:13, color:COLORS.primary, flex:"0 0 90px" }}>{order.id}</span>
                    <div style={{ flex:"1 1 120px" }}>
                      <span style={{ color:crypto.color }}>{crypto.icon}</span> {order.amount} {crypto.symbol}
                      <div style={{ fontSize:12, color:c(COLORS.muted.dark, COLORS.muted.light) }}>{fmt(order.amountFCFA)} FCFA</div>
                    </div>
                    <div style={{ flex:"1 1 110px", fontSize:13, color:c(COLORS.muted.dark, COLORS.muted.light) }}>{order.seller}</div>
                    <span style={{ background:status.bg, color:status.color, padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab==="users" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ ...styles.card, padding:14, background:c("rgba(245,158,11,0.07)","rgba(245,158,11,0.06)"), border:"1px solid rgba(245,158,11,0.2)", marginBottom:6 }}>
              <p style={{ fontSize:13, color:c(COLORS.muted.dark, COLORS.muted.light) }}>
                <strong>{accounts.length}</strong> compte{accounts.length>1?"s":""} enregistré{accounts.length>1?"s":""}
              </p>
            </div>
            {accounts.map(acc => (
              <div key={acc.id} style={{ ...styles.card, padding:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg, #1e3a5f, #0f2035)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:COLORS.primary, fontSize:14, flexShrink:0 }}>
                    {acc.name[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{acc.name}</div>
                    <div style={{ color:c(COLORS.muted.dark, COLORS.muted.light), fontSize:12 }}>{acc.email}</div>
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {acc.isAdmin && <span style={{ background:"rgba(239,68,68,0.12)", color:COLORS.red, padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>Admin</span>}
                    {acc.isSeller && <span style={{ background:"rgba(16,185,129,0.12)", color:COLORS.green, padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>Vendeur</span>}
                    {!acc.isAdmin && !acc.isSeller && <span style={{ background:c("rgba(255,255,255,0.07)","rgba(0,0,0,0.06)"), color:c(COLORS.muted.dark, COLORS.muted.light), padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:600 }}>Acheteur</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
