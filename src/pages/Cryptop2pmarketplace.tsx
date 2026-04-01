import { useState, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ADMIN_EMAIL    = "erickpakpo384@gmail.com";
const ADMIN_PASSWORD = "55237685N";

const C = {
  bg:         { dark: "#0a0f1e",  light: "#f4f6fb" },
  card:       { dark: "#111827",  light: "#ffffff" },
  border:     { dark: "#1e2d45",  light: "#e2e8f0" },
  sidebar:    { dark: "#080d1a",  light: "#1a2540" },
  gold:    "#f59e0b",
  goldD:   "#d97706",
  green:   "#10b981",
  red:     "#ef4444",
  blue:    "#3b82f6",
  purple:  "#8b5cf6",
  text:    { dark: "#f1f5f9", light: "#0f172a" },
  muted:   { dark: "#94a3b8", light: "#64748b" },
};

const CRYPTOS = [
  { id:"usdt_trc20", name:"USDT TRC20", symbol:"USDT", network:"TRON",    color:"#26a17b", icon:"₮", addrRegex:/^T[A-Za-z1-9]{33}$/,           addrEx:"TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
  { id:"usdt_bep20", name:"USDT BEP20", symbol:"USDT", network:"BSC",     color:"#f0b90b", icon:"₮", addrRegex:/^0x[0-9a-fA-F]{40}$/,           addrEx:"0x..." },
  { id:"bnb",        name:"BNB",        symbol:"BNB",  network:"BSC",     color:"#f0b90b", icon:"Ⓑ", addrRegex:/^0x[0-9a-fA-F]{40}$/,           addrEx:"0x..." },
  { id:"eth",        name:"Ethereum",   symbol:"ETH",  network:"ERC20",   color:"#627eea", icon:"Ξ", addrRegex:/^0x[0-9a-fA-F]{40}$/,           addrEx:"0x..." },
  { id:"btc",        name:"Bitcoin",    symbol:"BTC",  network:"BTC",     color:"#f7931a", icon:"₿", addrRegex:/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/, addrEx:"bc1..." },
  { id:"matic",      name:"Polygon",    symbol:"MATIC",network:"POLYGON", color:"#8247e5", icon:"⬡", addrRegex:/^0x[0-9a-fA-F]{40}$/,           addrEx:"0x..." },
];

const STATUS = {
  pending:   { label:"En attente de paiement", color:"#f59e0b", bg:"rgba(245,158,11,0.15)" },
  paid:      { label:"Paiement déclaré",        color:"#3b82f6", bg:"rgba(59,130,246,0.15)" },
  confirmed: { label:"Confirmé — Crypto envoyée", color:"#10b981", bg:"rgba(16,185,129,0.15)" },
  disputed:  { label:"Litige",                  color:"#ef4444", bg:"rgba(239,68,68,0.15)" },
};

const fmt   = (n) => Math.round(n).toLocaleString("fr-FR");
const getCr = (id) => CRYPTOS.find(c => c.id === id) || CRYPTOS[0];
const uid   = () => `u_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

// ─── INITIAL STATE — ONLY ADMIN EXISTS ───────────────────────────────────────
const INIT_ACCOUNTS = [
  { id:"admin", name:"Eric Admin", email:ADMIN_EMAIL, password:ADMIN_PASSWORD, isAdmin:true, isSeller:false,
    paymentInfo:{ reseau:"", numero:"", lienPaiement:"" } }
];

// ─── HAMBURGER ────────────────────────────────────────────────────────────────
function Hamburger({ onClick, color = "#f59e0b" }) {
  return (
    <button onClick={onClick} aria-label="Menu" style={{ background:"transparent", border:"none", cursor:"pointer", padding:"6px 8px", borderRadius:8, display:"flex", flexDirection:"column", gap:5, alignItems:"center" }}>
      {[0,1,2].map(i => <span key={i} style={{ display:"block", width:22, height:2, borderRadius:2, background:color }} />)}
    </button>
  );
}

// ─── SIDEBAR LAYOUT ───────────────────────────────────────────────────────────
function SidebarLayout({ s, c, user, logout, navigate, theme, setTheme, active, setActive, menu, title, children }) {
  const [open, setOpen] = useState(false);
  const sidebarBg = theme==="dark" ? C.sidebar.dark : C.sidebar.light;

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      {open && <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:199 }} />}

      <aside style={{ position:"fixed", top:0, left:0, height:"100vh", zIndex:200, width:248, background:sidebarBg, borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", transform:open?"translateX(0)":"translateX(-100%)", transition:"transform 0.28s cubic-bezier(.4,0,.2,1)" }}>
        {/* Logo */}
        <div style={{ padding:"18px 18px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:32, height:32, background:"linear-gradient(135deg,#f59e0b,#d97706)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:"#000" }}>₿</div>
            <span style={{ fontWeight:900, fontSize:16, background:"linear-gradient(135deg,#f59e0b,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CryptoP2P</span>
          </div>
          <button onClick={()=>setOpen(false)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:16, padding:4 }}>✕</button>
        </div>

        {/* User */}
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#f59e0b,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, color:"#000", flexShrink:0 }}>{user?.name?.[0]||"U"}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:13, color:"#f1f5f9", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name}</div>
              <div style={{ fontSize:11, color:"#64748b" }}>{user?.isAdmin?"Administrateur":user?.isSeller?"Vendeur":"Acheteur"}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"10px", overflowY:"auto" }}>
          {menu.map(item => (
            <button key={item.id} onClick={()=>{ setActive(item.id); setOpen(false); }} style={{ width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:11, padding:"10px 12px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:2, fontSize:13, fontWeight:600, transition:"background 0.15s", background:active===item.id?"rgba(245,158,11,0.14)":"transparent", color:active===item.id?C.gold:"#94a3b8", borderLeft:`3px solid ${active===item.id?C.gold:"transparent"}` }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge>0 && <span style={{ background:C.red, color:"#fff", fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:100 }}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:"10px 10px 20px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={()=>setTheme(theme==="dark"?"light":"dark")} style={{ width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:11, padding:"9px 12px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:3, fontSize:13, fontWeight:600, background:"transparent", color:"#94a3b8" }}>
            <span style={{ fontSize:15 }}>{theme==="dark"?"☀️":"🌙"}</span>
            <span>{theme==="dark"?"Mode clair":"Mode sombre"}</span>
          </button>
          {!user?.isAdmin && (
            <button onClick={()=>{ navigate("marketplace"); setOpen(false); }} style={{ width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:11, padding:"9px 12px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:3, fontSize:13, fontWeight:600, background:"transparent", color:"#94a3b8" }}>
              <span style={{ fontSize:15 }}>🛒</span><span>Marketplace</span>
            </button>
          )}
          <button onClick={logout} style={{ width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:11, padding:"9px 12px", borderRadius:10, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:"transparent", color:C.red }}>
            <span style={{ fontSize:15 }}>🚪</span><span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <header style={{ position:"sticky", top:0, zIndex:100, background:c("rgba(8,13,26,0.97)","rgba(255,255,255,0.97)"), backdropFilter:"blur(20px)", borderBottom:`1px solid ${c("rgba(255,255,255,0.07)","rgba(0,0,0,0.07)")}`, height:60, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Hamburger onClick={()=>setOpen(true)} color={C.gold} />
            <h1 style={{ fontSize:16, fontWeight:800, margin:0, color:c(C.text.dark,C.text.light) }}>{title}</h1>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:13, fontWeight:700, color:c(C.text.dark,C.text.light) }}>{user?.name}</div>
              <div style={{ fontSize:11, color:c(C.muted.dark,C.muted.light) }}>{user?.isAdmin?"Admin":user?.isSeller?"Vendeur":"Acheteur"}</div>
            </div>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#f59e0b,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:"#000" }}>{user?.name?.[0]||"U"}</div>
          </div>
        </header>
        <main style={{ flex:1, padding:"26px 22px", width:"100%", maxWidth:1080, margin:"0 auto", boxSizing:"border-box" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [theme,    setTheme]    = useState("dark");
  const [page,     setPage]     = useState("login");
  const [user,     setUser]     = useState(null);
  const [accounts, setAccounts] = useState(INIT_ACCOUNTS);
  const [offers,   setOffers]   = useState([]);   // Empty — vendors create their own
  const [orders,   setOrders]   = useState([]);   // Empty — created by real purchases
  const [selOffer, setSelOffer] = useState(null);
  const [notif,    setNotif]    = useState(null);

  const isDark = theme === "dark";
  const c = (d, l) => isDark ? d : l;

  const notify = useCallback((msg, type="success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4500);
  }, []);

  const login = (acc) => {
    setUser(acc);
    setPage(acc.isAdmin ? "admin" : acc.isSeller ? "seller" : "marketplace");
    notify(`Bienvenue, ${acc.name} !`);
  };

  const logout = () => { setUser(null); setPage("login"); notify("Déconnexion réussie","info"); };

  const navigate = (p, opts={}) => {
    if (opts.offer) setSelOffer(opts.offer);
    setPage(p);
    window.scrollTo(0,0);
  };

  // Promote user to seller (called by admin)
  const promoteToSeller = (userId) => {
    setAccounts(prev => prev.map(a => a.id===userId ? {...a, isSeller:true} : a));
    notify("Utilisateur promu vendeur ! ✅");
  };

  // Update account data (e.g. payment info)
  const updateAccount = (userId, patch) => {
    setAccounts(prev => prev.map(a => a.id===userId ? {...a, ...patch} : a));
    if (user?.id === userId) setUser(prev => ({...prev, ...patch}));
  };

  const s = { card:{ background:c(C.card.dark,C.card.light), border:`1px solid ${c(C.border.dark,C.border.light)}`, borderRadius:16, padding:22 }, btn:(v="primary",sz="md")=>({ primary:{ background:`linear-gradient(135deg,${C.gold},${C.goldD})`, color:"#000", fontWeight:700, border:"none", cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 }, secondary:{ background:c("rgba(255,255,255,0.07)","rgba(0,0,0,0.05)"), color:c(C.text.dark,C.text.light), fontWeight:600, border:`1px solid ${c(C.border.dark,C.border.light)}`, cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 }, green:{ background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:700, border:"none", cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 }, red:{ background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", fontWeight:700, border:"none", cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 }, ghost:{ background:"transparent", color:c(C.muted.dark,C.muted.light), fontWeight:500, border:"none", cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 } }[v]||{}), input:{ background:c("rgba(255,255,255,0.05)","rgba(0,0,0,0.03)"), border:`1px solid ${c(C.border.dark,C.border.light)}`, borderRadius:10, padding:"11px 14px", color:c(C.text.dark,C.text.light), fontSize:14, width:"100%", outline:"none", boxSizing:"border-box" } };

  const shared = { s, c, isDark, navigate, theme, setTheme, user, notify };

  return (
    <div style={{ minHeight:"100vh", background:c(C.bg.dark,C.bg.light), color:c(C.text.dark,C.text.light), fontFamily:"'Inter',-apple-system,sans-serif", transition:"background 0.3s,color 0.3s" }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}} *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px} input::placeholder,textarea::placeholder{color:#64748b} button:hover{opacity:0.87} button:active{transform:scale(0.98)} select{appearance:none}`}</style>

      {notif && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:9999, background:notif.type==="success"?C.green:notif.type==="error"?C.red:C.blue, color:"#fff", padding:"13px 20px", borderRadius:12, fontWeight:600, fontSize:13, maxWidth:360, animation:"slideIn 0.3s ease", zIndex:10000 }}>
          {notif.type==="success"?"✅ ":notif.type==="error"?"❌ ":"ℹ️ "}{notif.msg}
        </div>
      )}

      {page==="login"      && <LoginPage     {...shared} accounts={accounts} login={login} />}
      {page==="register"   && <RegisterPage  {...shared} accounts={accounts} setAccounts={setAccounts} login={login} />}
      {page==="marketplace"&& <MarketplacePage {...shared} logout={logout} offers={offers} orders={orders} setOrders={setOrders} accounts={accounts} />}
      {page==="buy"        && <BuyPage       {...shared} logout={logout} offer={selOffer} orders={orders} setOrders={setOrders} accounts={accounts} />}
      {page==="dashboard"  && <DashboardPage {...shared} logout={logout} orders={orders} setOrders={setOrders} />}
      {page==="seller"     && <SellerPage    {...shared} logout={logout} offers={offers} setOffers={setOffers} orders={orders} setOrders={setOrders} updateAccount={updateAccount} />}
      {page==="admin"      && <AdminPage     {...shared} logout={logout} offers={offers} setOffers={setOffers} orders={orders} setOrders={setOrders} accounts={accounts} setAccounts={setAccounts} promoteToSeller={promoteToSeller} />}
    </div>
  );
}

// ─── AUTH WRAPPER ─────────────────────────────────────────────────────────────
function AuthWrap({ s, c, isDark, theme, setTheme, children }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, background:"linear-gradient(135deg,#f59e0b,#d97706)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, color:"#000" }}>₿</div>
          <span style={{ fontWeight:900, fontSize:18, background:"linear-gradient(135deg,#f59e0b,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CryptoP2P</span>
        </div>
        <button onClick={()=>setTheme(theme==="dark"?"light":"dark")} style={{ ...s.btn("secondary","sm"), padding:"7px 10px", fontSize:15 }}>{theme==="dark"?"☀️":"🌙"}</button>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 24px 48px" }}>{children}</div>
    </div>
  );
}

function LoginPage({ s, c, isDark, navigate, theme, setTheme, accounts, login, notify }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const go = () => {
    if (!form.email||!form.password) { notify("Remplissez tous les champs","error"); return; }
    setLoading(true);
    setTimeout(() => {
      const found = accounts.find(a => a.email.toLowerCase()===form.email.toLowerCase() && a.password===form.password);
      if (!found) { notify("Email ou mot de passe incorrect","error"); setLoading(false); return; }
      login(found); setLoading(false);
    }, 800);
  };
  return (
    <AuthWrap s={s} c={c} isDark={isDark} theme={theme} setTheme={setTheme}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={s.card}>
          <h1 style={{ fontSize:22, fontWeight:800, marginBottom:6 }}>Connexion</h1>
          <p style={{ color:c(C.muted.dark,C.muted.light), fontSize:14, marginBottom:28 }}>Accédez à votre compte CryptoP2P</p>
          <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 }}>
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(C.muted.dark,C.muted.light) }}>Adresse email</label>
              <input style={s.input} placeholder="votre@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&go()} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(C.muted.dark,C.muted.light) }}>Mot de passe</label>
              <input style={s.input} type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&go()} />
            </div>
          </div>
          <button onClick={go} disabled={loading} style={{ ...s.btn("primary"), width:"100%", justifyContent:"center", opacity:loading?0.7:1 }}>
            {loading?"Vérification...":"Se connecter →"}
          </button>
          <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:c(C.muted.dark,C.muted.light) }}>
            Pas de compte ? <span onClick={()=>navigate("register")} style={{ color:C.gold, cursor:"pointer", fontWeight:600 }}>S'inscrire</span>
          </p>
        </div>
      </div>
    </AuthWrap>
  );
}

function RegisterPage({ s, c, isDark, navigate, theme, setTheme, accounts, setAccounts, login, notify }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const go = () => {
    if (!form.name||!form.email||!form.password||!form.confirm) { notify("Remplissez tous les champs","error"); return; }
    if (form.password!==form.confirm) { notify("Les mots de passe ne correspondent pas","error"); return; }
    if (form.password.length<8) { notify("Mot de passe trop court (8 min)","error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { notify("Email invalide","error"); return; }
    if (accounts.find(a=>a.email.toLowerCase()===form.email.toLowerCase())) { notify("Email déjà utilisé","error"); return; }
    setLoading(true);
    setTimeout(() => {
      const nu = { id:uid(), name:form.name, email:form.email, password:form.password, isAdmin:false, isSeller:false, paymentInfo:{ reseau:"", numero:"", lienPaiement:"" } };
      setAccounts(p=>[...p,nu]); login(nu); setLoading(false);
    }, 1000);
  };
  return (
    <AuthWrap s={s} c={c} isDark={isDark} theme={theme} setTheme={setTheme}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={s.card}>
          <h1 style={{ fontSize:22, fontWeight:800, marginBottom:6 }}>Créer un compte</h1>
          <p style={{ color:c(C.muted.dark,C.muted.light), fontSize:14, marginBottom:28 }}>Rejoignez la marketplace P2P crypto d'Afrique</p>
          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
            {[{k:"name",l:"Nom complet",p:"Jean Dupont",t:"text"},{k:"email",l:"Email",p:"votre@email.com",t:"email"},{k:"password",l:"Mot de passe",p:"Minimum 8 caractères",t:"password"},{k:"confirm",l:"Confirmer le mot de passe",p:"••••••••",t:"password"}].map(f=>(
              <div key={f.k}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(C.muted.dark,C.muted.light) }}>{f.l}</label>
                <input style={s.input} type={f.t} placeholder={f.p} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} />
              </div>
            ))}
          </div>
          <button onClick={go} disabled={loading} style={{ ...s.btn("primary"), width:"100%", justifyContent:"center", opacity:loading?0.7:1 }}>
            {loading?"Création...":"Créer mon compte"}
          </button>
          <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:c(C.muted.dark,C.muted.light) }}>
            Déjà un compte ? <span onClick={()=>navigate("login")} style={{ color:C.gold, cursor:"pointer", fontWeight:600 }}>Se connecter</span>
          </p>
        </div>
      </div>
    </AuthWrap>
  );
}

// ─── TOP NAV (Marketplace) ────────────────────────────────────────────────────
function TopNav({ s, c, isDark, navigate, user, logout, theme, setTheme }) {
  return (
    <nav style={{ background:c("rgba(8,13,26,0.97)","rgba(255,255,255,0.97)"), backdropFilter:"blur(20px)", borderBottom:`1px solid ${c("rgba(255,255,255,0.07)","rgba(0,0,0,0.07)")}`, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, padding:"0 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, background:"linear-gradient(135deg,#f59e0b,#d97706)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, color:"#000" }}>₿</div>
          <span style={{ fontWeight:900, fontSize:18, background:"linear-gradient(135deg,#f59e0b,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CryptoP2P</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {user && <button onClick={()=>navigate("dashboard")} style={s.btn("secondary","sm")}>Mon compte</button>}
          {user?.isSeller && <button onClick={()=>navigate("seller")} style={s.btn("secondary","sm")}>Espace vendeur</button>}
          <button onClick={()=>setTheme(theme==="dark"?"light":"dark")} style={{ ...s.btn("secondary","sm"), padding:"7px 10px", fontSize:15 }}>{theme==="dark"?"☀️":"🌙"}</button>
          {user
            ? <><div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#f59e0b,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#000", fontSize:13 }}>{user.name[0]}</div><button onClick={logout} style={s.btn("secondary","sm")}>Déconnexion</button></>
            : <button onClick={()=>navigate("login")} style={s.btn("primary","sm")}>Connexion</button>
          }
        </div>
      </div>
    </nav>
  );
}

// ─── MARKETPLACE ──────────────────────────────────────────────────────────────
function MarketplacePage({ s, c, isDark, navigate, user, logout, offers, orders, setOrders, accounts, theme, setTheme, notify }) {
  const [selCrypto, setSelCrypto] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = offers.filter(o =>
    (selCrypto==="all" || o.crypto===selCrypto) &&
    (search==="" || o.sellerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <TopNav s={s} c={c} isDark={isDark} navigate={navigate} user={user} logout={logout} theme={theme} setTheme={setTheme} />
      <div style={{ maxWidth:1160, margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:26, fontWeight:900, marginBottom:6 }}>Marketplace P2P</h1>
          <p style={{ color:c(C.muted.dark,C.muted.light), fontSize:14 }}>Achetez des crypto-monnaies auprès de vendeurs vérifiés</p>
        </div>

        {/* Crypto tabs */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
          <button onClick={()=>setSelCrypto("all")} style={s.btn(selCrypto==="all"?"primary":"secondary","sm")}>🌐 Tout</button>
          {CRYPTOS.map(cr=>(
            <button key={cr.id} onClick={()=>setSelCrypto(cr.id)} style={s.btn(selCrypto===cr.id?"primary":"secondary","sm")}>
              <span style={{ color:cr.color }}>{cr.icon}</span> {cr.symbol} <span style={{ opacity:0.6, fontSize:11 }}>{cr.network}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position:"relative", maxWidth:380, marginBottom:24 }}>
          <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:c(C.muted.dark,C.muted.light), fontSize:14 }}>🔍</span>
          <input style={{ ...s.input, paddingLeft:38 }} placeholder="Rechercher un vendeur..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        {filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:"80px 0", color:c(C.muted.dark,C.muted.light) }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🏪</div>
            <p style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>Aucune offre disponible</p>
            <p style={{ fontSize:13 }}>Les vendeurs publient leurs offres ici. Revenez bientôt !</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.map(offer=><OfferCard key={offer.id} offer={offer} s={s} c={c} isDark={isDark} navigate={navigate} user={user} notify={notify} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferCard({ offer, s, c, isDark, navigate, user, notify }) {
  const cr = getCr(offer.crypto);
  const go = () => {
    if (!user) { notify("Connectez-vous pour acheter","error"); navigate("login"); return; }
    navigate("buy", { offer });
  };
  return (
    <div style={{ ...s.card, padding:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        {/* Seller */}
        <div style={{ display:"flex", alignItems:"center", gap:12, flex:"1 1 200px" }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:46, height:46, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a5f,#0f2035)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:700, color:C.gold, border:`2px solid ${C.green}` }}>{offer.sellerAvatar}</div>
            <div style={{ position:"absolute", bottom:1, right:1, width:11, height:11, borderRadius:"50%", background:C.green, border:`2px solid ${c(C.card.dark,C.card.light)}` }} />
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontWeight:700, fontSize:14 }}>{offer.sellerName}</span>
              <span style={{ background:"rgba(16,185,129,0.12)", color:C.green, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:100 }}>✓ VENDEUR</span>
            </div>
            <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light), marginTop:2 }}>{offer.completedTrades} trades réalisés</div>
          </div>
        </div>
        {/* Crypto & rate */}
        <div style={{ flex:"1 1 160px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
            <span style={{ fontSize:22, color:cr.color }}>{cr.icon}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{cr.name}</div>
              <div style={{ fontSize:11, color:c(C.muted.dark,C.muted.light) }}>{cr.network}</div>
            </div>
          </div>
          <div style={{ fontSize:19, fontWeight:900, color:C.gold }}>{fmt(offer.rate)} <span style={{ fontSize:12, fontWeight:500, color:c(C.muted.dark,C.muted.light) }}>FCFA/{cr.symbol}</span></div>
        </div>
        {/* Limits & payments */}
        <div style={{ flex:"1 1 150px", fontSize:12.5, color:c(C.muted.dark,C.muted.light) }}>
          <div style={{ marginBottom:4 }}>Min–Max : {offer.minAmount} — {fmt(offer.maxAmount)} {cr.symbol}</div>
          <div style={{ marginBottom:8 }}>Dispo : <span style={{ color:C.green, fontWeight:600 }}>{fmt(offer.available)} {cr.symbol}</span></div>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {offer.paymentMethods.map(m=><span key={m} style={{ background:c("rgba(255,255,255,0.07)","rgba(0,0,0,0.06)"), borderRadius:6, padding:"2px 7px", fontSize:11, fontWeight:600 }}>{m}</span>)}
          </div>
        </div>
        <button onClick={go} style={{ ...s.btn("primary"), whiteSpace:"nowrap", flexShrink:0 }}>Acheter {cr.symbol} →</button>
      </div>
    </div>
  );
}

// ─── BUY PAGE ─────────────────────────────────────────────────────────────────
function BuyPage({ s, c, isDark, navigate, user, offer, orders, setOrders, accounts, notify }) {
  const [step,    setStep]    = useState(1);
  const [wallet,  setWallet]  = useState("");
  const [amount,  setAmount]  = useState("");
  const [wErr,    setWErr]    = useState("");
  const [payMsg,  setPayMsg]  = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!offer) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
        <p style={{ marginBottom:20, color:c(C.muted.dark,C.muted.light) }}>Aucune offre sélectionnée</p>
        <button onClick={()=>navigate("marketplace")} style={s.btn("primary")}>← Retour</button>
      </div>
    </div>
  );

  // Get seller's payment info
  const sellerAcc = accounts.find(a=>a.id===offer.sellerId) || {};
  const pi = sellerAcc.paymentInfo || {};

  const cr = getCr(offer.crypto);
  const amountFCFA = amount ? Math.round(parseFloat(amount)*offer.rate) : 0;

  const vw = (addr) => {
    if (!addr) { setWErr(""); return; }
    setWErr(cr.addrRegex.test(addr) ? "" : `Format invalide. Ex : ${cr.addrEx}`);
  };

  const handleStep1 = () => {
    if (!wallet) { notify("Entrez votre adresse wallet","error"); return; }
    if (wErr) { notify("Adresse wallet invalide","error"); return; }
    if (!amount||parseFloat(amount)<=0) { notify("Montant invalide","error"); return; }
    if (parseFloat(amount)<offer.minAmount) { notify(`Min : ${offer.minAmount} ${cr.symbol}`,"error"); return; }
    if (parseFloat(amount)>offer.maxAmount) { notify(`Max : ${offer.maxAmount} ${cr.symbol}`,"error"); return; }
    setStep(2);
  };

  const handleConfirmPay = () => {
    if (!payMsg.trim()) { notify("Entrez votre message de confirmation de paiement","error"); return; }
    setLoading(true);
    setTimeout(()=>{
      const id = `CMD-${Date.now().toString().slice(-6)}`;
      setOrderId(id);
      setOrders(p=>[{
        id, crypto:offer.crypto, amount:parseFloat(amount), amountFCFA,
        walletAddr:wallet, seller:offer.sellerName, sellerId:offer.sellerId,
        buyerId:user.id, buyerName:user.name,
        paymentMessage:payMsg, status:"paid",
        createdAt:new Date().toISOString()
      }, ...p]);
      setStep(3); setLoading(false);
      notify("Déclaration de paiement envoyée ! Le vendeur va vérifier et confirmer.");
    }, 1200);
  };

  return (
    <div style={{ minHeight:"100vh" }}>
      <nav style={{ background:c("rgba(8,13,26,0.97)","rgba(255,255,255,0.97)"), backdropFilter:"blur(20px)", borderBottom:`1px solid ${c("rgba(255,255,255,0.07)","rgba(0,0,0,0.07)")}`, padding:"0 24px" }}>
        <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", alignItems:"center", height:60, gap:14 }}>
          <button onClick={()=>navigate("marketplace")} style={s.btn("secondary","sm")}>← Retour</button>
          <span style={{ fontWeight:700, fontSize:15 }}>Acheter {cr.name}</span>
        </div>
      </nav>

      <div style={{ maxWidth:560, margin:"36px auto", padding:"0 24px" }}>
        {/* Steps */}
        <div style={{ display:"flex", alignItems:"center", marginBottom:36 }}>
          {["Détails","Paiement","Terminé"].map((st,i)=>(
            <div key={st} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:step>i+1?C.green:step===i+1?C.gold:c("rgba(255,255,255,0.1)","rgba(0,0,0,0.1)"), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, color:step>=i+1?"#000":c(C.muted.dark,C.muted.light), marginBottom:5, transition:"background 0.3s" }}>
                  {step>i+1?"✓":i+1}
                </div>
                <span style={{ fontSize:11, color:step===i+1?C.gold:c(C.muted.dark,C.muted.light), whiteSpace:"nowrap" }}>{st}</span>
              </div>
              {i<2 && <div style={{ height:2, flex:1, background:step>i+1?C.green:c("rgba(255,255,255,0.1)","rgba(0,0,0,0.1)"), margin:"0 6px 18px", transition:"background 0.3s" }} />}
            </div>
          ))}
        </div>

        {/* Seller summary */}
        <div style={{ ...s.card, padding:16, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a5f,#0f2035)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.gold, fontSize:15, flexShrink:0 }}>{offer.sellerAvatar}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{offer.sellerName}</div>
            <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>{offer.completedTrades} trades réalisés</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontWeight:800, color:C.gold, fontSize:16 }}>{fmt(offer.rate)}</div>
            <div style={{ fontSize:11, color:c(C.muted.dark,C.muted.light) }}>FCFA / {cr.symbol}</div>
          </div>
        </div>

        {/* Step 1 — Order details */}
        {step===1 && (
          <div style={s.card}>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:22 }}>Détails de la commande</h2>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(C.muted.dark,C.muted.light) }}>Votre adresse Wallet {cr.name} ({cr.network}) *</label>
              <input style={{ ...s.input, borderColor:wErr?C.red:wallet&&!wErr?C.green:undefined }} placeholder={cr.addrEx} value={wallet} onChange={e=>{ setWallet(e.target.value); vw(e.target.value); }} />
              {wErr && <p style={{ color:C.red, fontSize:12, marginTop:5 }}>⚠️ {wErr}</p>}
              {wallet&&!wErr && <p style={{ color:C.green, fontSize:12, marginTop:5 }}>✅ Adresse valide</p>}
            </div>
            <div style={{ marginBottom:22 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(C.muted.dark,C.muted.light) }}>Quantité de {cr.symbol} *</label>
              <div style={{ position:"relative" }}>
                <input style={{ ...s.input, paddingRight:72 }} type="number" placeholder={`Min: ${offer.minAmount}`} value={amount} onChange={e=>setAmount(e.target.value)} />
                <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", fontWeight:700, color:cr.color, fontSize:13 }}>{cr.symbol}</span>
              </div>
              <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light), marginTop:5 }}>Limites : {offer.minAmount} – {fmt(offer.maxAmount)} {cr.symbol}</div>
            </div>
            {amountFCFA>0 && (
              <div style={{ background:c("rgba(245,158,11,0.07)","rgba(245,158,11,0.07)"), border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:16, marginBottom:22 }}>
                {[["Vous recevez",`${amount} ${cr.symbol}`],["Taux",`${fmt(offer.rate)} FCFA/${cr.symbol}`]].map(([l,v])=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                    <span style={{ color:c(C.muted.dark,C.muted.light) }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ height:1, background:c("rgba(255,255,255,0.1)","rgba(0,0,0,0.1)"), margin:"10px 0" }} />
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontWeight:700 }}>Total à payer</span>
                  <span style={{ fontWeight:900, fontSize:19, color:C.gold }}>{fmt(amountFCFA)} FCFA</span>
                </div>
              </div>
            )}
            <button onClick={handleStep1} style={{ ...s.btn("primary"), width:"100%", justifyContent:"center" }}>Voir les infos de paiement →</button>
          </div>
        )}

        {/* Step 2 — Payment instructions */}
        {step===2 && (
          <div style={s.card}>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>Effectuez le paiement</h2>
            <p style={{ color:c(C.muted.dark,C.muted.light), fontSize:13, marginBottom:22 }}>Payez le vendeur via Mobile Money puis confirmez ci-dessous</p>

            {/* Amount recap */}
            <div style={{ background:c("rgba(245,158,11,0.07)","rgba(245,158,11,0.06)"), border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:16, marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontWeight:700, fontSize:14 }}>Montant à envoyer</span>
                <span style={{ fontWeight:900, fontSize:22, color:C.gold }}>{fmt(amountFCFA)} FCFA</span>
              </div>
            </div>

            {/* Seller payment info */}
            <div style={{ background:c("rgba(16,185,129,0.07)","rgba(16,185,129,0.05)"), border:"1px solid rgba(16,185,129,0.2)", borderRadius:12, padding:18, marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>📱 Coordonnées de paiement du vendeur</div>
              {pi.reseau && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10, fontSize:14 }}>
                  <span style={{ color:c(C.muted.dark,C.muted.light) }}>Réseau</span>
                  <strong>{pi.reseau}</strong>
                </div>
              )}
              {pi.numero && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ color:c(C.muted.dark,C.muted.light), fontSize:14 }}>Numéro</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <strong style={{ fontSize:18, letterSpacing:1 }}>{pi.numero}</strong>
                    <button onClick={()=>{ navigator.clipboard?.writeText(pi.numero); notify("Numéro copié !"); }} style={{ ...s.btn("secondary","sm"), padding:"4px 10px", fontSize:11 }}>Copier</button>
                  </div>
                </div>
              )}
              {pi.lienPaiement && (
                <div style={{ marginTop:10 }}>
                  <a href={pi.lienPaiement.startsWith("http")?pi.lienPaiement:`https://${pi.lienPaiement}`} target="_blank" rel="noreferrer" style={{ ...s.btn("green"), width:"100%", justifyContent:"center", textDecoration:"none", fontSize:14 }}>
                    💳 Payer via le lien du vendeur
                  </a>
                </div>
              )}
              {!pi.numero && !pi.lienPaiement && (
                <p style={{ color:C.gold, fontSize:13, fontStyle:"italic" }}>⚠️ Le vendeur n'a pas encore configuré ses infos de paiement. Contactez-le directement.</p>
              )}
            </div>

            {/* Confirmation message */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(C.muted.dark,C.muted.light) }}>
                Votre message de confirmation de paiement *
              </label>
              <textarea
                style={{ ...s.input, resize:"vertical", minHeight:90, lineHeight:1.5 }}
                placeholder={`Ex: J'ai envoyé ${fmt(amountFCFA)} FCFA sur le ${pi.reseau||"réseau"} ${pi.numero||""} à ${new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}. Référence : XXXXXXX`}
                value={payMsg}
                onChange={e=>setPayMsg(e.target.value)}
              />
              <p style={{ fontSize:12, color:c(C.muted.dark,C.muted.light), marginTop:5 }}>Décrivez votre paiement : montant, heure, référence de transaction…</p>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button onClick={handleConfirmPay} disabled={loading} style={{ ...s.btn("green"), width:"100%", justifyContent:"center", fontSize:15, opacity:loading?0.7:1 }}>
                {loading?"⏳ Envoi...":"✅ J'ai payé — Confirmer mon paiement"}
              </button>
              <button onClick={()=>setStep(1)} style={{ ...s.btn("ghost"), width:"100%", justifyContent:"center" }}>← Modifier la commande</button>
            </div>
          </div>
        )}

        {/* Step 3 — Success */}
        {step===3 && (
          <div style={{ ...s.card, textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
            <h2 style={{ fontSize:22, fontWeight:900, marginBottom:8 }}>Paiement déclaré !</h2>
            <p style={{ color:c(C.muted.dark,C.muted.light), marginBottom:24, fontSize:14, lineHeight:1.6 }}>
              Commande <strong style={{ color:C.gold }}>{orderId}</strong> en attente.<br/>
              Le vendeur va vérifier votre paiement et vous envoyer vos cryptos.
            </p>
            <div style={{ background:c("rgba(245,158,11,0.07)","rgba(245,158,11,0.06)"), borderRadius:12, padding:20, marginBottom:24, textAlign:"left" }}>
              {[["⏳","Le vendeur reçoit votre déclaration de paiement"],["🔍","Il vérifie le paiement sur son compte Mobile Money"],["💸","Il envoie vos cryptos à votre wallet"],["✅","La commande passe en statut Confirmé"]].map(([ic,tx],i)=>(
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:13, marginBottom:10 }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{ic}</span>
                  <span style={{ color:c(C.muted.dark,C.muted.light), lineHeight:1.5 }}>{tx}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={()=>navigate("dashboard")} style={s.btn("primary")}>Voir mes commandes →</button>
              <button onClick={()=>navigate("marketplace")} style={s.btn("secondary")}>Retour marketplace</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD (buyer) ────────────────────────────────────────────────────────
function DashboardPage({ s, c, isDark, navigate, user, logout, orders, setOrders, notify, theme, setTheme }) {
  const [active, setActive] = useState("orders");

  const myOrders = orders.filter(o=>o.buyerId===user?.id);
  const menu = [
    { id:"orders",  label:"Mes commandes", icon:"📦", badge:myOrders.filter(o=>o.status==="paid").length },
    { id:"profile", label:"Mon profil",    icon:"👤", badge:0 },
    { id:"support", label:"Support",       icon:"💬", badge:0 },
  ];

  const openDispute = (id) => {
    setOrders(orders.map(o=>o.id===id?{...o,status:"disputed"}:o));
    notify("Litige ouvert. Le support va analyser.","error");
  };

  const counts = { total:myOrders.length, waiting:myOrders.filter(o=>o.status==="paid").length, done:myOrders.filter(o=>o.status==="confirmed").length };
  const titles = { orders:"Mes commandes", profile:"Mon profil", support:"Support" };

  return (
    <SidebarLayout s={s} c={c} user={user} logout={logout} navigate={navigate} theme={theme} setTheme={setTheme} active={active} setActive={setActive} menu={menu} title={titles[active]||"Tableau de bord"}>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:28 }}>
        {[{l:"Total",v:counts.total,i:"📦",color:C.blue},{l:"En attente vendeur",v:counts.waiting,i:"⏳",color:C.gold},{l:"Confirmées",v:counts.done,i:"✅",color:C.green}].map(stat=>(
          <div key={stat.l} style={{ ...s.card, padding:18 }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{stat.i}</div>
            <div style={{ fontSize:26, fontWeight:900, color:stat.color }}>{stat.v}</div>
            <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light), marginTop:2 }}>{stat.l}</div>
          </div>
        ))}
      </div>

      {active==="orders" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ fontSize:16, fontWeight:800 }}>Historique des commandes</h2>
            <button onClick={()=>navigate("marketplace")} style={s.btn("primary","sm")}>+ Nouvel achat</button>
          </div>
          {myOrders.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:c(C.muted.dark,C.muted.light) }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
              <p style={{ marginBottom:16 }}>Aucune commande pour l'instant</p>
              <button onClick={()=>navigate("marketplace")} style={s.btn("primary")}>Découvrir les offres →</button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {myOrders.map(order=>{
                const cr = getCr(order.crypto);
                const st = STATUS[order.status]||STATUS.paid;
                return (
                  <div key={order.id} style={{ ...s.card, padding:18 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                      <div style={{ flex:"1 1 180px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, flexWrap:"wrap" }}>
                          <span style={{ fontWeight:700, color:C.gold, fontSize:13 }}>{order.id}</span>
                          <span style={{ background:st.bg, color:st.color, padding:"2px 9px", borderRadius:100, fontSize:11, fontWeight:700 }}>{st.label}</span>
                        </div>
                        <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>{new Date(order.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                      </div>
                      <div style={{ flex:"1 1 140px", display:"flex", alignItems:"center", gap:7 }}>
                        <span style={{ color:cr.color, fontSize:18 }}>{cr.icon}</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14 }}>{order.amount} {cr.symbol}</div>
                          <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>{fmt(order.amountFCFA)} FCFA</div>
                        </div>
                      </div>
                      <div style={{ flex:"1 1 140px", fontSize:12.5, color:c(C.muted.dark,C.muted.light) }}>
                        <div>Vendeur : <strong>{order.seller}</strong></div>
                        <div style={{ wordBreak:"break-all", marginTop:2, fontSize:11 }}>Wallet : {order.walletAddr?.slice(0,14)}…</div>
                      </div>
                      <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
                        {order.status==="paid" && <span style={{ fontSize:12, color:C.gold, fontStyle:"italic" }}>⏳ Attente confirmation vendeur…</span>}
                        {order.status==="confirmed" && <span style={{ color:C.green, fontSize:12, fontWeight:600 }}>✅ Crypto envoyée — Terminé</span>}
                        {order.status==="disputed" && <span style={{ color:C.red, fontSize:12, fontWeight:600 }}>⚠️ Litige en cours</span>}
                        {order.status==="paid" && <button onClick={()=>openDispute(order.id)} style={s.btn("red","sm")}>⚠️ Litige</button>}
                      </div>
                    </div>
                    {/* Payment message */}
                    {order.paymentMessage && (
                      <div style={{ marginTop:12, padding:"10px 14px", background:c("rgba(255,255,255,0.04)","rgba(0,0,0,0.04)"), borderRadius:10, fontSize:12.5, color:c(C.muted.dark,C.muted.light), borderLeft:`3px solid ${C.gold}` }}>
                        <strong style={{ color:c(C.text.dark,C.text.light) }}>Votre message : </strong>{order.paymentMessage}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {active==="profile" && (
        <div style={s.card}>
          <h3 style={{ fontSize:17, fontWeight:700, marginBottom:20 }}>Informations du compte</h3>
          {[{l:"Nom complet",v:user?.name},{l:"Email",v:user?.email},{l:"Statut",v:user?.isSeller?"Vendeur":"Acheteur"}].map(f=>(
            <div key={f.l} style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${c(C.border.dark,C.border.light)}` }}>
              <span style={{ color:c(C.muted.dark,C.muted.light), fontSize:14 }}>{f.l}</span>
              <span style={{ fontWeight:600, fontSize:14 }}>{f.v}</span>
            </div>
          ))}
          {!user?.isSeller && (
            <div style={{ marginTop:22, padding:18, background:c("rgba(245,158,11,0.07)","rgba(245,158,11,0.06)"), border:"1px solid rgba(245,158,11,0.2)", borderRadius:12 }}>
              <h4 style={{ fontWeight:700, marginBottom:8 }}>Devenir vendeur ?</h4>
              <p style={{ color:c(C.muted.dark,C.muted.light), fontSize:13, marginBottom:14, lineHeight:1.6 }}>Contactez l'administrateur pour demander l'accès vendeur.</p>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...s.btn("green","sm"), textDecoration:"none" }}>📱 WhatsApp</a>
                <a href="mailto:erickpakpo384@gmail.com" style={{ ...s.btn("secondary","sm"), textDecoration:"none" }}>✉️ Email admin</a>
              </div>
            </div>
          )}
        </div>
      )}

      {active==="support" && (
        <div style={s.card}>
          <h3 style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>Contacter le support</h3>
          <p style={{ color:c(C.muted.dark,C.muted.light), fontSize:14, marginBottom:22, lineHeight:1.6 }}>Notre équipe est disponible pour résoudre vos problèmes.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...s.btn("green"), textDecoration:"none", justifyContent:"center", fontSize:15 }}>📱 WhatsApp : +229 0155237685</a>
            <a href="mailto:erickpakpo384@gmail.com" style={{ ...s.btn("secondary"), textDecoration:"none", justifyContent:"center" }}>✉️ erickpakpo384@gmail.com</a>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}

// ─── SELLER PAGE ──────────────────────────────────────────────────────────────
function SellerPage({ s, c, isDark, navigate, user, logout, offers, setOffers, orders, setOrders, updateAccount, notify, theme, setTheme }) {
  const [active, setActive] = useState("orders");
  const [showForm, setShowForm] = useState(false);
  const [offerForm, setOfferForm] = useState({ crypto:"usdt_trc20", rate:"", minAmount:"", maxAmount:"", available:"" });
  const [payForm, setPayForm] = useState({ reseau:user?.paymentInfo?.reseau||"", numero:user?.paymentInfo?.numero||"", lienPaiement:user?.paymentInfo?.lienPaiement||"" });
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [wf, setWf] = useState({ amount:"", reseau:"", numero:"", nom:"" });

  const myOffers = offers.filter(o=>o.sellerId===user?.id);
  const myOrders = orders.filter(o=>o.sellerId===user?.id);

  const menu = [
    { id:"orders",  label:"Commandes reçues", icon:"📦", badge:myOrders.filter(o=>o.status==="paid").length },
    { id:"offers",  label:"Mes annonces",      icon:"🏷️", badge:0 },
    { id:"payment", label:"Infos de paiement", icon:"💳", badge:(!user?.paymentInfo?.numero&&!user?.paymentInfo?.lienPaiement)?1:0 },
    { id:"finance", label:"Finances",          icon:"💰", badge:0 },
  ];

  const confirmOrder = (id) => {
    setOrders(orders.map(o=>o.id===id?{...o,status:"confirmed"}:o));
    notify("Commande confirmée ! Les cryptos sont considérées comme envoyées. ✅");
  };

  const disputeOrder = (id) => {
    setOrders(orders.map(o=>o.id===id?{...o,status:"disputed"}:o));
    notify("Litige ouvert sur cette commande.","error");
  };

  const createOffer = () => {
    if (!offerForm.rate||!offerForm.minAmount||!offerForm.maxAmount||!offerForm.available) { notify("Remplissez tous les champs","error"); return; }
    if (!user?.paymentInfo?.numero && !user?.paymentInfo?.lienPaiement) { notify("Configurez d'abord vos infos de paiement (onglet 💳)","error"); setActive("payment"); return; }
    const cr = getCr(offerForm.crypto);
    setOffers(p=>[{
      id:`off_${Date.now()}`, sellerId:user.id, sellerName:user.name, sellerAvatar:user.name[0],
      crypto:offerForm.crypto, rate:parseFloat(offerForm.rate),
      minAmount:parseFloat(offerForm.minAmount), maxAmount:parseFloat(offerForm.maxAmount),
      available:parseFloat(offerForm.available),
      paymentMethods:[user.paymentInfo?.reseau||"Mobile Money"],
      completedTrades:0, createdAt:new Date().toISOString()
    }, ...p]);
    setOfferForm({ crypto:"usdt_trc20", rate:"", minAmount:"", maxAmount:"", available:"" });
    setShowForm(false);
    notify("Annonce publiée sur le marketplace ! ✅");
  };

  const savePayment = () => {
    if (!payForm.reseau) { notify("Entrez le réseau de paiement","error"); return; }
    if (!payForm.numero && !payForm.lienPaiement) { notify("Entrez un numéro ou un lien de paiement","error"); return; }
    updateAccount(user.id, { paymentInfo:{ reseau:payForm.reseau, numero:payForm.numero, lienPaiement:payForm.lienPaiement } });
    notify("Infos de paiement sauvegardées ! ✅");
  };

  const doWithdraw = () => {
    if (!wf.amount||!wf.reseau||!wf.numero||!wf.nom) { notify("Remplissez tous les champs","error"); return; }
    setWithdrawModal(false); setWf({ amount:"", reseau:"", numero:"", nom:"" });
    notify("Demande de retrait envoyée ! Traitement en moins de 5 minutes. 💸");
  };

  const earnings = myOrders.filter(o=>o.status==="confirmed").reduce((sum,o)=>sum+o.amountFCFA,0);
  const titles = { orders:"Commandes reçues", offers:"Mes annonces", payment:"Infos de paiement", finance:"Finances" };

  return (
    <>
      {withdrawModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ ...s.card, maxWidth:400, width:"100%", zIndex:1001 }}>
            <h3 style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>Retrait Mobile Money</h3>
            <p style={{ color:c(C.muted.dark,C.muted.light), fontSize:13, marginBottom:20 }}>Revenus confirmés : <strong style={{ color:C.green }}>{fmt(earnings)} FCFA</strong></p>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
              {[{k:"amount",l:"Montant (FCFA)",p:"Ex: 50000",t:"number"},{k:"reseau",l:"Réseau",p:"MTN, Orange, Moov…"},{k:"numero",l:"Numéro",p:"+229 XX XX XX XX"},{k:"nom",l:"Bénéficiaire",p:"Jean Dupont"}].map(f=>(
                <div key={f.k}>
                  <label style={{ display:"block", fontSize:12, fontWeight:600, color:c(C.muted.dark,C.muted.light), marginBottom:5 }}>{f.l}</label>
                  <input style={s.input} type={f.t||"text"} placeholder={f.p} value={wf[f.k]} onChange={e=>setWf({...wf,[f.k]:e.target.value})} />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={doWithdraw} style={{ ...s.btn("primary"), flex:1, justifyContent:"center" }}>💸 Retirer</button>
              <button onClick={()=>setWithdrawModal(false)} style={{ ...s.btn("secondary"), flex:1, justifyContent:"center" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <SidebarLayout s={s} c={c} user={user} logout={logout} navigate={navigate} theme={theme} setTheme={setTheme} active={active} setActive={setActive} menu={menu} title={titles[active]||"Espace Vendeur"}>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:12, marginBottom:28 }}>
          {[{l:"Revenus confirmés",v:`${fmt(earnings)} FCFA`,i:"💰",color:C.green},{l:"Commandes en attente",v:myOrders.filter(o=>o.status==="paid").length,i:"⏳",color:C.gold},{l:"Total commandes",v:myOrders.length,i:"📦",color:C.blue},{l:"Mes annonces",v:myOffers.length,i:"🏷️",color:C.purple}].map(stat=>(
            <div key={stat.l} style={{ ...s.card, padding:18 }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{stat.i}</div>
              <div style={{ fontSize:typeof stat.v==="number"?26:14, fontWeight:900, color:stat.color, lineHeight:1.2 }}>{stat.v}</div>
              <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light), marginTop:3 }}>{stat.l}</div>
            </div>
          ))}
        </div>

        {/* ORDERS tab */}
        {active==="orders" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {myOrders.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:c(C.muted.dark,C.muted.light) }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                <p>Aucune commande reçue pour l'instant</p>
              </div>
            ) : myOrders.map(order=>{
              const cr = getCr(order.crypto);
              const st = STATUS[order.status]||STATUS.paid;
              return (
                <div key={order.id} style={{ ...s.card, padding:18 }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:14, flexWrap:"wrap" }}>
                    <div style={{ flex:"1 1 180px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, color:C.gold, fontSize:13 }}>{order.id}</span>
                        <span style={{ background:st.bg, color:st.color, padding:"2px 9px", borderRadius:100, fontSize:11, fontWeight:700 }}>{st.label}</span>
                      </div>
                      <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>{new Date(order.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                      <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light), marginTop:2 }}>Acheteur : <strong>{order.buyerName}</strong></div>
                    </div>
                    <div style={{ flex:"1 1 140px", display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ color:cr.color, fontSize:18 }}>{cr.icon}</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14 }}>{order.amount} {cr.symbol}</div>
                        <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>{fmt(order.amountFCFA)} FCFA</div>
                      </div>
                    </div>
                    <div style={{ flex:"1 1 160px", fontSize:11.5, color:c(C.muted.dark,C.muted.light) }}>
                      <div>Wallet : <span style={{ wordBreak:"break-all" }}>{order.walletAddr?.slice(0,18)}…</span></div>
                    </div>
                    <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignItems:"center" }}>
                      {order.status==="paid" && (
                        <>
                          <button onClick={()=>confirmOrder(order.id)} style={s.btn("green","sm")}>✅ Confirmer envoi crypto</button>
                          <button onClick={()=>disputeOrder(order.id)} style={s.btn("red","sm")}>⚠️ Litige</button>
                        </>
                      )}
                      {order.status==="confirmed" && <span style={{ color:C.green, fontSize:12, fontWeight:600 }}>✅ Crypto envoyée</span>}
                      {order.status==="disputed" && <span style={{ color:C.red, fontSize:12, fontWeight:600 }}>⚠️ Litige en cours</span>}
                    </div>
                  </div>
                  {/* Payment message from buyer */}
                  {order.paymentMessage && (
                    <div style={{ marginTop:12, padding:"12px 16px", background:order.status==="paid"?c("rgba(59,130,246,0.08)","rgba(59,130,246,0.06)"):c("rgba(16,185,129,0.08)","rgba(16,185,129,0.06)"), borderRadius:10, fontSize:13, borderLeft:`3px solid ${order.status==="paid"?C.blue:C.green}` }}>
                      <div style={{ fontWeight:700, marginBottom:4, fontSize:12, color:c(C.muted.dark,C.muted.light) }}>💬 Message de paiement de l'acheteur :</div>
                      <div style={{ color:c(C.text.dark,C.text.light), lineHeight:1.5 }}>{order.paymentMessage}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* OFFERS tab */}
        {active==="offers" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h2 style={{ fontSize:16, fontWeight:800 }}>Mes annonces publiées</h2>
              <button onClick={()=>setShowForm(!showForm)} style={s.btn("primary","sm")}>+ Nouvelle annonce</button>
            </div>

            {showForm && (
              <div style={{ ...s.card, marginBottom:20, border:"1px solid rgba(245,158,11,0.3)" }}>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Publier une annonce</h3>
                {(!user?.paymentInfo?.numero && !user?.paymentInfo?.lienPaiement) && (
                  <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:10, padding:12, marginBottom:16, fontSize:13, color:C.red }}>
                    ⚠️ <strong>Configurez d'abord vos infos de paiement</strong> (onglet 💳) avant de publier une annonce.
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={{ display:"block", fontSize:12, fontWeight:600, color:c(C.muted.dark,C.muted.light), marginBottom:6 }}>Crypto-monnaie à vendre</label>
                    <select style={s.input} value={offerForm.crypto} onChange={e=>setOfferForm({...offerForm,crypto:e.target.value})}>
                      {CRYPTOS.map(cr=><option key={cr.id} value={cr.id}>{cr.name} ({cr.network})</option>)}
                    </select>
                  </div>
                  {[{k:"rate",l:"Taux de vente (FCFA / 1 unité)",p:"ex: 650"},{k:"available",l:"Quantité disponible",p:"ex: 1000"},{k:"minAmount",l:"Montant minimum",p:"ex: 10"},{k:"maxAmount",l:"Montant maximum",p:"ex: 5000"}].map(f=>(
                    <div key={f.k}>
                      <label style={{ display:"block", fontSize:12, fontWeight:600, color:c(C.muted.dark,C.muted.light), marginBottom:6 }}>{f.l}</label>
                      <input style={s.input} type="number" placeholder={f.p} value={offerForm[f.k]} onChange={e=>setOfferForm({...offerForm,[f.k]:e.target.value})} />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16, display:"flex", gap:8 }}>
                  <button onClick={createOffer} style={s.btn("primary","sm")}>Publier l'annonce ✅</button>
                  <button onClick={()=>setShowForm(false)} style={s.btn("secondary","sm")}>Annuler</button>
                </div>
              </div>
            )}

            {myOffers.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:c(C.muted.dark,C.muted.light) }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
                <p>Aucune annonce publiée</p>
                <button onClick={()=>setShowForm(true)} style={{ ...s.btn("primary"), marginTop:16 }}>Créer ma première annonce</button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {myOffers.map(offer=>{
                  const cr = getCr(offer.crypto);
                  const offOrders = orders.filter(o=>o.crypto===offer.crypto&&o.sellerId===user.id);
                  return (
                    <div key={offer.id} style={{ ...s.card, padding:18 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                        <div style={{ flex:"1 1 150px", display:"flex", alignItems:"center", gap:10 }}>
                          <span style={{ color:cr.color, fontSize:22 }}>{cr.icon}</span>
                          <div><div style={{ fontWeight:700, fontSize:14 }}>{cr.name}</div><div style={{ fontSize:11, color:c(C.muted.dark,C.muted.light) }}>{cr.network}</div></div>
                        </div>
                        <div style={{ flex:"1 1 130px" }}>
                          <div style={{ fontWeight:800, fontSize:17, color:C.gold }}>{fmt(offer.rate)} FCFA</div>
                          <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>Dispo : {fmt(offer.available)} {cr.symbol}</div>
                        </div>
                        <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>{offOrders.length} commande{offOrders.length!==1?"s":""}</div>
                        <div style={{ display:"flex", gap:8 }}>
                          <span style={{ background:"rgba(16,185,129,0.12)", color:C.green, padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>● Active</span>
                          <button onClick={()=>setOffers(offers.filter(o=>o.id!==offer.id))} style={{ ...s.btn("red","sm"), padding:"4px 10px", fontSize:11 }}>Supprimer</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PAYMENT INFO tab */}
        {active==="payment" && (
          <div style={s.card}>
            <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>💳 Infos de paiement Mobile Money</h3>
            <p style={{ color:c(C.muted.dark,C.muted.light), fontSize:13, marginBottom:24, lineHeight:1.6 }}>
              Ces informations seront affichées aux acheteurs pour qu'ils vous paient. Configurez au moins un numéro ou un lien de paiement.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(C.muted.dark,C.muted.light) }}>Réseau Mobile Money *</label>
                <input style={s.input} placeholder="Ex: MTN MoMo, Orange Money, Moov Money…" value={payForm.reseau} onChange={e=>setPayForm({...payForm,reseau:e.target.value})} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(C.muted.dark,C.muted.light) }}>Numéro Mobile Money</label>
                <input style={s.input} placeholder="Ex: +229 01 55 23 76 85" value={payForm.numero} onChange={e=>setPayForm({...payForm,numero:e.target.value})} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:c(C.muted.dark,C.muted.light) }}>Lien de paiement (optionnel)</label>
                <input style={s.input} placeholder="Ex: https://pay.wave.com/m/votre-id ou lien PayDunya…" value={payForm.lienPaiement} onChange={e=>setPayForm({...payForm,lienPaiement:e.target.value})} />
                <p style={{ fontSize:12, color:c(C.muted.dark,C.muted.light), marginTop:5 }}>Vous pouvez mettre un lien Wave, PayDunya, FedaPay, etc.</p>
              </div>
            </div>

            {/* Preview */}
            {(payForm.reseau||payForm.numero||payForm.lienPaiement) && (
              <div style={{ marginTop:20, padding:16, background:c("rgba(16,185,129,0.07)","rgba(16,185,129,0.05)"), border:"1px solid rgba(16,185,129,0.2)", borderRadius:12 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:10, color:C.green }}>👁️ Aperçu — ce que voient les acheteurs</div>
                {payForm.reseau && <div style={{ fontSize:13, marginBottom:6 }}>Réseau : <strong>{payForm.reseau}</strong></div>}
                {payForm.numero && <div style={{ fontSize:13, marginBottom:6 }}>Numéro : <strong style={{ fontSize:16 }}>{payForm.numero}</strong></div>}
                {payForm.lienPaiement && <div style={{ fontSize:13 }}>Lien : <span style={{ color:C.blue }}>{payForm.lienPaiement}</span></div>}
              </div>
            )}

            <button onClick={savePayment} style={{ ...s.btn("primary"), marginTop:22, width:"100%", justifyContent:"center" }}>
              💾 Sauvegarder mes infos de paiement
            </button>
          </div>
        )}

        {/* FINANCE tab */}
        {active==="finance" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={s.card}>
              <h3 style={{ fontWeight:700, fontSize:17, marginBottom:20 }}>📊 Bilan financier</h3>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:`1px solid ${c(C.border.dark,C.border.light)}` }}>
                <span style={{ fontWeight:600, fontSize:14 }}>Revenus confirmés</span>
                <span style={{ fontWeight:900, fontSize:20, color:C.green }}>{fmt(earnings)} FCFA</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:`1px solid ${c(C.border.dark,C.border.light)}` }}>
                <div><span style={{ fontWeight:600, fontSize:14 }}>En attente de confirmation</span><div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>Paiements déclarés non encore confirmés</div></div>
                <span style={{ fontWeight:800, fontSize:17, color:C.gold }}>{fmt(myOrders.filter(o=>o.status==="paid").reduce((sum,o)=>sum+o.amountFCFA,0))} FCFA</span>
              </div>
              <button onClick={()=>setWithdrawModal(true)} style={{ ...s.btn("primary"), marginTop:20, width:"100%", justifyContent:"center" }}>💸 Demander un retrait</button>
            </div>
            <div style={s.card}>
              <h3 style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>⏱️ Règles de retrait</h3>
              {["Vérifiez le paiement Mobile Money avant de confirmer","Confirmez uniquement quand vous avez reçu le paiement","Les retraits sont traités en moins de 5 minutes","En cas de litige, contactez le support immédiatement"].map((r,i)=>(
                <div key={i} style={{ display:"flex", gap:10, fontSize:13, color:c(C.muted.dark,C.muted.light), marginBottom:10, lineHeight:1.5 }}>
                  <span style={{ color:C.gold, flexShrink:0 }}>→</span><span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </SidebarLayout>
    </>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ s, c, isDark, navigate, user, logout, offers, setOffers, orders, setOrders, accounts, setAccounts, promoteToSeller, notify, theme, setTheme }) {
  const [active, setActive] = useState("overview");

  const disputes = orders.filter(o=>o.status==="disputed");
  const pendingPromos = accounts.filter(a=>!a.isAdmin && !a.isSeller); // buyers who could be promoted
  const sellers = accounts.filter(a=>a.isSeller && !a.isAdmin);

  const menu = [
    { id:"overview",  label:"Vue d'ensemble",      icon:"📊", badge:0 },
    { id:"users",     label:"Utilisateurs",         icon:"👥", badge:pendingPromos.length },
    { id:"sellers",   label:"Vendeurs",             icon:"🏪", badge:0 },
    { id:"orders",    label:"Toutes les commandes", icon:"📦", badge:0 },
    { id:"disputes",  label:"Litiges",              icon:"⚠️", badge:disputes.length },
    { id:"offers",    label:"Toutes les annonces",  icon:"🏷️", badge:0 },
  ];

  const resolveDispute = (orderId, favor) => {
    if (favor==="buyer") {
      setOrders(orders.map(o=>o.id===orderId?{...o,status:"disputed_resolved_buyer"}:o));
    } else {
      setOrders(orders.map(o=>o.id===orderId?{...o,status:"confirmed"}:o));
    }
    notify(`Litige résolu en faveur du ${favor==="buyer"?"l'acheteur":"vendeur"}. ✅`);
  };

  const titles = { overview:"Vue d'ensemble", users:"Gestion des utilisateurs", sellers:"Vendeurs actifs", orders:"Toutes les commandes", disputes:"Litiges actifs", offers:"Toutes les annonces" };

  return (
    <SidebarLayout s={s} c={c} user={user} logout={logout} navigate={navigate} theme={theme} setTheme={setTheme} active={active} setActive={setActive} menu={menu} title={titles[active]||"Administration"}>
      {/* Admin stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:28 }}>
        {[{l:"Utilisateurs",v:accounts.length-1,i:"👥",color:C.purple},{l:"Vendeurs actifs",v:sellers.length,i:"🏪",color:C.green},{l:"Commandes",v:orders.length,i:"📦",color:C.blue},{l:"Annonces",v:offers.length,i:"🏷️",color:C.gold},{l:"Litiges",v:disputes.length,i:"⚠️",color:C.red}].map(stat=>(
          <div key={stat.l} style={{ ...s.card, padding:18, borderLeft:`3px solid ${stat.color}`, borderRadius:16 }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{stat.i}</div>
            <div style={{ fontSize:22, fontWeight:900, color:stat.color }}>{stat.v}</div>
            <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light), marginTop:2 }}>{stat.l}</div>
          </div>
        ))}
      </div>

      {/* OVERVIEW */}
      {active==="overview" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div style={s.card}>
            <h3 style={{ fontWeight:700, marginBottom:16, fontSize:15 }}>📋 Statut des commandes</h3>
            {Object.entries(STATUS).map(([k,v])=>{
              const count = orders.filter(o=>o.status===k).length;
              return <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${c(C.border.dark,C.border.light)}` }}>
                <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}><span style={{ width:8,height:8,borderRadius:"50%",background:v.color,display:"inline-block" }}/>{v.label}</span>
                <span style={{ fontWeight:700, background:v.bg, color:v.color, padding:"2px 10px", borderRadius:100, fontSize:12 }}>{count}</span>
              </div>;
            })}
          </div>
          <div style={s.card}>
            <h3 style={{ fontWeight:700, marginBottom:16, fontSize:15 }}>🏷️ Cryptos en vente</h3>
            {CRYPTOS.map(cr=>{
              const count = offers.filter(o=>o.crypto===cr.id).length;
              return <div key={cr.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${c(C.border.dark,C.border.light)}` }}>
                <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}><span style={{ color:cr.color, fontSize:16 }}>{cr.icon}</span>{cr.name}</span>
                <span style={{ fontWeight:700, fontSize:13 }}>{count} annonce{count!==1?"s":""}</span>
              </div>;
            })}
          </div>
        </div>
      )}

      {/* USERS — promote to seller */}
      {active==="users" && (
        <div>
          <div style={{ ...s.card, padding:14, marginBottom:20, background:c("rgba(245,158,11,0.07)","rgba(245,158,11,0.06)"), border:"1px solid rgba(245,158,11,0.2)" }}>
            <p style={{ fontSize:13, color:c(C.muted.dark,C.muted.light) }}>
              Ici vous pouvez <strong>promouvoir un utilisateur en vendeur</strong>. Il aura alors accès à l'espace vendeur et pourra publier des annonces.
            </p>
          </div>
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Acheteurs — Accorder le rôle vendeur</h3>
          {pendingPromos.length===0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:c(C.muted.dark,C.muted.light) }}>
              <div style={{ fontSize:40, marginBottom:10 }}>👤</div>
              <p>Aucun utilisateur à promouvoir pour l'instant</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {pendingPromos.map(acc=>(
                <div key={acc.id} style={{ ...s.card, padding:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a5f,#0f2035)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.gold, fontSize:15, flexShrink:0 }}>{acc.name[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{acc.name}</div>
                      <div style={{ color:c(C.muted.dark,C.muted.light), fontSize:12, marginTop:2 }}>{acc.email}</div>
                    </div>
                    <span style={{ background:c("rgba(255,255,255,0.07)","rgba(0,0,0,0.06)"), color:c(C.muted.dark,C.muted.light), padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:600 }}>Acheteur</span>
                    <button onClick={()=>{ promoteToSeller(acc.id); notify(`${acc.name} est maintenant vendeur ! ✅`); }} style={s.btn("primary","sm")}>
                      🏪 Promouvoir vendeur
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SELLERS */}
      {active==="sellers" && (
        <div>
          {sellers.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:c(C.muted.dark,C.muted.light) }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🏪</div>
              <p>Aucun vendeur actif pour l'instant</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {sellers.map(acc=>{
                const sellerOffers = offers.filter(o=>o.sellerId===acc.id);
                const sellerOrders = orders.filter(o=>o.sellerId===acc.id);
                const revenue = sellerOrders.filter(o=>o.status==="confirmed").reduce((sum,o)=>sum+o.amountFCFA,0);
                const pi = acc.paymentInfo||{};
                return (
                  <div key={acc.id} style={{ ...s.card, padding:18 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                      <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a5f,#0f2035)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.gold, fontSize:16, flexShrink:0 }}>{acc.name[0]}</div>
                      <div style={{ flex:"1 1 150px" }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{acc.name}</div>
                        <div style={{ color:c(C.muted.dark,C.muted.light), fontSize:12 }}>{acc.email}</div>
                      </div>
                      <div style={{ flex:"1 1 130px", fontSize:13, color:c(C.muted.dark,C.muted.light) }}>
                        <div>{sellerOffers.length} annonce{sellerOffers.length!==1?"s":""}</div>
                        <div>{sellerOrders.length} commande{sellerOrders.length!==1?"s":""}</div>
                        <div style={{ color:C.green, fontWeight:600 }}>{fmt(revenue)} FCFA</div>
                      </div>
                      {pi.reseau && <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>{pi.reseau} {pi.numero&&`• ${pi.numero}`}</div>}
                      <span style={{ background:"rgba(16,185,129,0.12)", color:C.green, padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>✓ Vendeur</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ALL ORDERS */}
      {active==="orders" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {orders.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:c(C.muted.dark,C.muted.light) }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📭</div><p>Aucune commande</p>
            </div>
          ) : orders.map(order=>{
            const cr = getCr(order.crypto);
            const st = STATUS[order.status]||STATUS.paid;
            return (
              <div key={order.id} style={{ ...s.card, padding:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                  <span style={{ fontWeight:700, fontSize:13, color:C.gold, flex:"0 0 100px" }}>{order.id}</span>
                  <div style={{ flex:"1 1 120px" }}>
                    <span style={{ color:cr.color }}>{cr.icon}</span> {order.amount} {cr.symbol}
                    <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>{fmt(order.amountFCFA)} FCFA</div>
                  </div>
                  <div style={{ flex:"1 1 120px", fontSize:12.5, color:c(C.muted.dark,C.muted.light) }}>
                    <div>Acheteur : {order.buyerName}</div>
                    <div>Vendeur : {order.seller}</div>
                  </div>
                  <span style={{ background:st.bg, color:st.color, padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISPUTES */}
      {active==="disputes" && (
        <div>
          {disputes.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:c(C.muted.dark,C.muted.light) }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div><p>Aucun litige actif</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {disputes.map(order=>{
                const cr = getCr(order.crypto);
                return (
                  <div key={order.id} style={{ ...s.card, padding:18, border:"1px solid rgba(239,68,68,0.25)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:12 }}>
                      <div style={{ flex:"1 1 150px" }}>
                        <div style={{ fontWeight:700, color:C.red, fontSize:13 }}>{order.id}</div>
                        <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</div>
                      </div>
                      <div style={{ flex:"1 1 130px" }}>
                        <div style={{ fontWeight:700 }}>{order.amount} {cr.symbol}</div>
                        <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>{fmt(order.amountFCFA)} FCFA</div>
                      </div>
                      <div style={{ flex:"1 1 130px", fontSize:12.5, color:c(C.muted.dark,C.muted.light) }}>
                        <div>Acheteur : <strong>{order.buyerName}</strong></div>
                        <div>Vendeur : <strong>{order.seller}</strong></div>
                      </div>
                    </div>
                    {order.paymentMessage && (
                      <div style={{ padding:"10px 14px", background:c("rgba(255,255,255,0.04)","rgba(0,0,0,0.04)"), borderRadius:10, fontSize:12.5, marginBottom:14, borderLeft:`3px solid ${C.blue}` }}>
                        <strong>Message paiement : </strong>{order.paymentMessage}
                      </div>
                    )}
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      <button onClick={()=>resolveDispute(order.id,"seller")} style={s.btn("green","sm")}>✅ Valider en faveur du vendeur</button>
                      <button onClick={()=>resolveDispute(order.id,"buyer")} style={s.btn("red","sm")}>↩️ Rembourser l'acheteur</button>
                      <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...s.btn("secondary","sm"), textDecoration:"none" }}>💬 Contacter les parties</a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ALL OFFERS */}
      {active==="offers" && (
        <div>
          {offers.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:c(C.muted.dark,C.muted.light) }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🏷️</div><p>Aucune annonce publiée</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {offers.map(offer=>{
                const cr = getCr(offer.crypto);
                return (
                  <div key={offer.id} style={{ ...s.card, padding:18 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                      <div style={{ flex:"1 1 140px", display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ color:cr.color, fontSize:22 }}>{cr.icon}</span>
                        <div><div style={{ fontWeight:700, fontSize:14 }}>{cr.name}</div><div style={{ fontSize:11, color:c(C.muted.dark,C.muted.light) }}>{cr.network}</div></div>
                      </div>
                      <div style={{ flex:"1 1 120px" }}>
                        <div style={{ fontWeight:800, fontSize:16, color:C.gold }}>{fmt(offer.rate)} FCFA</div>
                        <div style={{ fontSize:12, color:c(C.muted.dark,C.muted.light) }}>Dispo : {fmt(offer.available)}</div>
                      </div>
                      <div style={{ flex:"1 1 120px", fontSize:13, color:c(C.muted.dark,C.muted.light) }}>Vendeur : <strong>{offer.sellerName}</strong></div>
                      <div style={{ display:"flex", gap:8 }}>
                        <span style={{ background:"rgba(16,185,129,0.12)", color:C.green, padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>● Active</span>
                        <button onClick={()=>{ setOffers(offers.filter(o=>o.id!==offer.id)); notify("Annonce supprimée.","info"); }} style={{ ...s.btn("red","sm"), padding:"4px 10px", fontSize:11 }}>Supprimer</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </SidebarLayout>
  );
}
