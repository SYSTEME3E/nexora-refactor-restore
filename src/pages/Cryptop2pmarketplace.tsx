import { useState, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ADMIN_EMAIL    = "erickpakpo384@gmail.com";
const ADMIN_PASSWORD = "55237685N";
const ADMIN_CODE     = "5523"; // Authorization code to enter admin

// Dark-navy theme (dark mode mixed with deep blue)
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
  sidebar: "#04070e",
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
  pending:   { label:"En attente de paiement",   color:"#f59e0b", bg:"rgba(245,158,11,0.15)" },
  paid:      { label:"Paiement déclaré",          color:"#3b82f6", bg:"rgba(59,130,246,0.15)" },
  confirmed: { label:"Confirmé — Crypto envoyée", color:"#10b981", bg:"rgba(16,185,129,0.15)" },
  disputed:  { label:"Litige",                    color:"#ef4444", bg:"rgba(239,68,68,0.15)" },
};

const SELLER_STATUS = {
  active:     { label:"Actif",     color:"#10b981", bg:"rgba(16,185,129,0.15)" },
  restricted: { label:"Restreint", color:"#f59e0b", bg:"rgba(245,158,11,0.15)" },
  blocked:    { label:"Bloqué",    color:"#ef4444", bg:"rgba(239,68,68,0.15)" },
};

const fmt  = (n) => Math.round(n).toLocaleString("fr-FR");
const getCr = (id) => CRYPTOS.find(c => c.id === id) || CRYPTOS[0];
const uid  = () => `u_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

const INIT_ACCOUNTS = [
  {
    id:"admin", name:"Eric Admin", email:ADMIN_EMAIL, password:ADMIN_PASSWORD,
    isAdmin:true, isSeller:false, sellerStatus:"active",
    paymentInfo:{ reseau:"", numero:"", lienPaiement:"" },
    sellerLimits:{ reserve:0, maxSell:0, minSell:0 },
    whatsapp:"",
  }
];

// ─── STYLES HELPER ────────────────────────────────────────────────────────────
const makeStyles = () => ({
  card: { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22 },
  card2: { background:C.bgCard2, border:`1px solid ${C.border}`, borderRadius:16, padding:22 },
  btn: (v="primary", sz="md") => ({
    primary:   { background:`linear-gradient(135deg,${C.gold},${C.goldD})`, color:"#000", fontWeight:700, border:"none", cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6, transition:"opacity 0.2s" },
    secondary: { background:"rgba(255,255,255,0.05)", color:C.text, fontWeight:600, border:`1px solid ${C.border}`, cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6, transition:"opacity 0.2s" },
    green:     { background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:700, border:"none", cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 },
    red:       { background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", fontWeight:700, border:"none", cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 },
    cyan:      { background:"linear-gradient(135deg,#06b6d4,#0891b2)", color:"#fff", fontWeight:700, border:"none", cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 },
    ghost:     { background:"transparent", color:C.muted, fontWeight:500, border:"none", cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 },
    danger:    { background:"rgba(239,68,68,0.1)", color:C.red, fontWeight:600, border:`1px solid rgba(239,68,68,0.3)`, cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 },
  }[v]||{}),
  input: { background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:10, padding:"11px 14px", color:C.text, fontSize:14, width:"100%", outline:"none", boxSizing:"border-box" as const },
  label: { display:"block", fontSize:13, fontWeight:600, marginBottom:6, color:C.muted },
});

// ─── HAMBURGER ────────────────────────────────────────────────────────────────
function Ham({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Menu" style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, cursor:"pointer", padding:"8px 10px", borderRadius:10, display:"flex", flexDirection:"column", gap:5, alignItems:"center", justifyContent:"center", width:42, height:42 }}>
      {[0,1,2].map(i=><span key={i} style={{ display:"block", width:18, height:2, borderRadius:2, background:C.gold }}/>)}
    </button>
  );
}

// ─── SIDEBAR LAYOUT ───────────────────────────────────────────────────────────
function SidebarLayout({ user, logout, navigate, active, setActive, menu, title, children }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg }}>
      {open && <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:199, backdropFilter:"blur(3px)" }}/>}
      <aside style={{ position:"fixed", top:0, left:0, height:"100vh", zIndex:200, width:252, background:C.sidebar, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", transform:open?"translateX(0)":"translateX(-100%)", transition:"transform 0.28s cubic-bezier(.4,0,.2,1)", overflowY:"auto" }}>
        {/* Logo */}
        <div style={{ padding:"18px 18px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:34, height:34, background:`linear-gradient(135deg,${C.gold},${C.goldD})`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, color:"#000" }}>₿</div>
            <span style={{ fontWeight:900, fontSize:17, background:`linear-gradient(135deg,${C.gold},#fbbf24)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CryptoP2P</span>
          </div>
          <button onClick={()=>setOpen(false)} style={{ background:"transparent", border:"none", cursor:"pointer", color:C.muted, fontSize:18, padding:4, lineHeight:1 }}>✕</button>
        </div>
        {/* User */}
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.goldD})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:16, color:"#000", flexShrink:0 }}>{user?.name?.[0]||"U"}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:13, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{user?.isAdmin?"Administrateur":user?.isSeller?"Vendeur":"Acheteur"}</div>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ flex:1, padding:"10px" }}>
          {menu.map(item=>(
            <button key={item.id} onClick={()=>{ setActive(item.id); setOpen(false); }} style={{ width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:11, padding:"10px 12px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:3, fontSize:13, fontWeight:600, background:active===item.id?"rgba(245,158,11,0.12)":"transparent", color:active===item.id?C.gold:C.muted, borderLeft:`3px solid ${active===item.id?C.gold:"transparent"}`, transition:"all 0.15s" }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge>0&&<span style={{ background:C.red, color:"#fff", fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:100, minWidth:18, textAlign:"center" }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        {/* Footer */}
        <div style={{ padding:"10px 10px 20px", borderTop:`1px solid ${C.border}` }}>
          {!user?.isAdmin&&(
            <button onClick={()=>{ navigate("marketplace"); setOpen(false); }} style={{ width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:11, padding:"9px 12px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:3, fontSize:13, fontWeight:600, background:"transparent", color:C.muted }}>
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
        <header style={{ position:"sticky", top:0, zIndex:100, background:"rgba(6,9,15,0.97)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}`, height:62, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Ham onClick={()=>setOpen(true)}/>
            <h1 style={{ fontSize:16, fontWeight:800, margin:0, color:C.text }}>{title}</h1>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{user?.name}</div>
              <div style={{ fontSize:11, color:C.muted }}>{user?.isAdmin?"Admin":user?.isSeller?"Vendeur":"Acheteur"}</div>
            </div>
            <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.goldD})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:"#000" }}>{user?.name?.[0]||"U"}</div>
          </div>
        </header>
        <main style={{ flex:1, padding:"26px 22px", maxWidth:1080, width:"100%", margin:"0 auto", boxSizing:"border-box" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── AUTH WRAP ────────────────────────────────────────────────────────────────
function AuthWrap({ children }) {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"18px 28px", display:"flex", alignItems:"center", gap:9 }}>
        <div style={{ width:34, height:34, background:`linear-gradient(135deg,${C.gold},${C.goldD})`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, color:"#000" }}>₿</div>
        <span style={{ fontWeight:900, fontSize:18, background:`linear-gradient(135deg,${C.gold},#fbbf24)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CryptoP2P</span>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px 24px 48px" }}>{children}</div>
    </div>
  );
}

function LoginPage({ navigate, login, notify, accounts }) {
  const st = makeStyles();
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const go = () => {
    if (!form.email||!form.password) { notify("Remplissez tous les champs","error"); return; }
    setLoading(true);
    setTimeout(()=>{
      const found = accounts.find(a=>a.email.toLowerCase()===form.email.toLowerCase()&&a.password===form.password);
      if (!found) { notify("Email ou mot de passe incorrect","error"); setLoading(false); return; }
      if (found.sellerStatus==="blocked") { notify("Votre compte vendeur est bloqué. Contactez l'admin.","error"); setLoading(false); return; }
      if (found.isAdmin) { navigate("admin-code", { pendingUser:found }); setLoading(false); return; }
      login(found); setLoading(false);
    }, 800);
  };
  return (
    <AuthWrap>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={st.card}>
          <h1 style={{ fontSize:22, fontWeight:800, marginBottom:6, color:C.text }}>Connexion</h1>
          <p style={{ color:C.muted, fontSize:14, marginBottom:28 }}>Accédez à votre compte CryptoP2P</p>
          <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 }}>
            <div>
              <label style={st.label}>Adresse email</label>
              <input style={st.input} placeholder="votre@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&go()} />
            </div>
            <div>
              <label style={st.label}>Mot de passe</label>
              <input style={st.input} type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&go()} />
            </div>
          </div>
          <button onClick={go} disabled={loading} style={{ ...st.btn("primary"), width:"100%", justifyContent:"center", opacity:loading?0.7:1 }}>{loading?"Vérification...":"Se connecter →"}</button>
          <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:C.muted }}>Pas de compte ? <span onClick={()=>navigate("register")} style={{ color:C.gold, cursor:"pointer", fontWeight:600 }}>S'inscrire</span></p>
        </div>
      </div>
    </AuthWrap>
  );
}

function AdminCodePage({ navigate, login, notify, pendingUser }) {
  const st = makeStyles();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const go = () => {
    if (!code) { notify("Entrez le code d'autorisation","error"); return; }
    setLoading(true);
    setTimeout(()=>{
      if (code !== ADMIN_CODE) { notify("Code d'autorisation incorrect","error"); setLoading(false); return; }
      login(pendingUser); setLoading(false);
    }, 600);
  };
  return (
    <AuthWrap>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={st.card}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🔐</div>
            <h1 style={{ fontSize:20, fontWeight:800, marginBottom:6, color:C.text }}>Accès Administrateur</h1>
            <p style={{ color:C.muted, fontSize:14 }}>Entrez le code d'autorisation pour accéder au panneau d'administration</p>
          </div>
          <div style={{ marginBottom:22 }}>
            <label style={st.label}>Code d'autorisation</label>
            <input style={{ ...st.input, fontSize:24, textAlign:"center", letterSpacing:8, fontWeight:700 }} type="password" placeholder="••••" maxLength={6} value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} />
          </div>
          <button onClick={go} disabled={loading} style={{ ...st.btn("primary"), width:"100%", justifyContent:"center", opacity:loading?0.7:1 }}>{loading?"Vérification...":"Accéder →"}</button>
          <button onClick={()=>navigate("login")} style={{ ...st.btn("ghost"), width:"100%", justifyContent:"center", marginTop:8 }}>← Retour</button>
        </div>
      </div>
    </AuthWrap>
  );
}

function RegisterPage({ navigate, login, notify, accounts, setAccounts }) {
  const st = makeStyles();
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const go = () => {
    if (!form.name||!form.email||!form.password||!form.confirm) { notify("Remplissez tous les champs","error"); return; }
    if (form.password!==form.confirm) { notify("Les mots de passe ne correspondent pas","error"); return; }
    if (form.password.length<8) { notify("Mot de passe trop court (8 min)","error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { notify("Email invalide","error"); return; }
    if (accounts.find(a=>a.email.toLowerCase()===form.email.toLowerCase())) { notify("Email déjà utilisé","error"); return; }
    setLoading(true);
    setTimeout(()=>{
      const nu = { id:uid(), name:form.name, email:form.email, password:form.password, isAdmin:false, isSeller:false, sellerStatus:"active", paymentInfo:{ reseau:"", numero:"", lienPaiement:"" }, sellerLimits:{ reserve:0, maxSell:0, minSell:0 }, whatsapp:"" };
      setAccounts(p=>[...p,nu]); login(nu); setLoading(false);
    }, 1000);
  };
  return (
    <AuthWrap>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={st.card}>
          <h1 style={{ fontSize:22, fontWeight:800, marginBottom:6, color:C.text }}>Créer un compte</h1>
          <p style={{ color:C.muted, fontSize:14, marginBottom:28 }}>Rejoignez la marketplace P2P crypto</p>
          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
            {[{k:"name",l:"Nom complet",p:"Jean Dupont",t:"text"},{k:"email",l:"Email",p:"votre@email.com",t:"email"},{k:"password",l:"Mot de passe",p:"Minimum 8 caractères",t:"password"},{k:"confirm",l:"Confirmer le mot de passe",p:"••••••••",t:"password"}].map(f=>(
              <div key={f.k}>
                <label style={st.label}>{f.l}</label>
                <input style={st.input} type={f.t} placeholder={f.p} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} />
              </div>
            ))}
          </div>
          <button onClick={go} disabled={loading} style={{ ...st.btn("primary"), width:"100%", justifyContent:"center", opacity:loading?0.7:1 }}>{loading?"Création...":"Créer mon compte"}</button>
          <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:C.muted }}>Déjà un compte ? <span onClick={()=>navigate("login")} style={{ color:C.gold, cursor:"pointer", fontWeight:600 }}>Se connecter</span></p>
        </div>
      </div>
    </AuthWrap>
  );
}



function TopNav({ navigate, user, logout }) {
  const st = makeStyles();
  return (
    <nav style={{ background:"rgba(6,9,15,0.97)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:62, padding:"0 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, background:`linear-gradient(135deg,${C.gold},${C.goldD})`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, color:"#000" }}>₿</div>
          <span style={{ fontWeight:900, fontSize:18, background:`linear-gradient(135deg,${C.gold},#fbbf24)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CryptoP2P</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {user && <button onClick={()=>navigate("dashboard")} style={st.btn("secondary","sm")}>Mon compte</button>}
          {user?.isSeller && <button onClick={()=>navigate("seller")} style={st.btn("secondary","sm")}>Espace vendeur</button>}
          {user ? (
            <><div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.goldD})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#000", fontSize:13 }}>{user.name[0]}</div><button onClick={logout} style={st.btn("secondary","sm")}>Déconnexion</button></>
          ) : (
            <button onClick={()=>navigate("login")} style={st.btn("primary","sm")}>Connexion</button>
          )}
        </div>
      </div>
    </nav>
  );
}

function MarketplacePage({ navigate, user, logout, offers, notify }) {
  const st = makeStyles();
  const [selCrypto, setSelCrypto] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = offers.filter(o=>(selCrypto==="all"||o.crypto===selCrypto)&&(search===""||o.sellerName.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{ background:C.bg, minHeight:"100vh" }}>
      <TopNav navigate={navigate} user={user} logout={logout} />
      <div style={{ maxWidth:1160, margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:26, fontWeight:900, marginBottom:6, color:C.text }}>Marketplace P2P</h1>
          <p style={{ color:C.muted, fontSize:14 }}>Achetez des crypto-monnaies auprès de vendeurs vérifiés</p>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
          <button onClick={()=>setSelCrypto("all")} style={st.btn(selCrypto==="all"?"primary":"secondary","sm")}>🌐 Tout</button>
          {CRYPTOS.map(cr=>(
            <button key={cr.id} onClick={()=>setSelCrypto(cr.id)} style={st.btn(selCrypto===cr.id?"primary":"secondary","sm")}>
              <span style={{ color:cr.color }}>{cr.icon}</span>{cr.symbol}<span style={{ opacity:0.6, fontSize:11 }}>{cr.network}</span>
            </button>
          ))}
        </div>
        <div style={{ position:"relative", maxWidth:380, marginBottom:24 }}>
          <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:C.muted, fontSize:14 }}>🔍</span>
          <input style={{ ...st.input, paddingLeft:38 }} placeholder="Rechercher un vendeur..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:"80px 0", color:C.muted }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🏪</div>
            <p style={{ fontSize:16, fontWeight:600, marginBottom:8, color:C.text }}>Aucune offre disponible</p>
            <p style={{ fontSize:13 }}>Les vendeurs publient leurs offres ici.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.map(offer=><OfferCard key={offer.id} offer={offer} navigate={navigate} user={user} notify={notify} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferCard({ offer, navigate, user, notify }) {
  const st = makeStyles();
  const cr = getCr(offer.crypto);
  const go = () => {
    if (!user) { notify("Connectez-vous pour acheter","error"); navigate("login"); return; }
    navigate("buy", { offer });
  };
  return (
    <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, flex:"1 1 200px" }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:46, height:46, borderRadius:"50%", background:`linear-gradient(135deg,#0f2035,#1e3a5f)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:700, color:C.gold, border:`2px solid ${C.green}` }}>{offer.sellerAvatar}</div>
            <div style={{ position:"absolute", bottom:1, right:1, width:11, height:11, borderRadius:"50%", background:C.green, border:`2px solid ${C.bgCard}` }}/>
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{offer.sellerName}</span>
              <span style={{ background:"rgba(16,185,129,0.12)", color:C.green, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:100 }}>✓ VENDEUR</span>
            </div>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{offer.completedTrades} trades réalisés</div>
          </div>
        </div>
        <div style={{ flex:"1 1 160px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
            <span style={{ fontSize:22, color:cr.color }}>{cr.icon}</span>
            <div><div style={{ fontWeight:700, fontSize:14, color:C.text }}>{cr.name}</div><div style={{ fontSize:11, color:C.muted }}>{cr.network}</div></div>
          </div>
          <div style={{ fontSize:19, fontWeight:900, color:C.gold }}>{fmt(offer.rate)} <span style={{ fontSize:12, fontWeight:500, color:C.muted }}>FCFA/{cr.symbol}</span></div>
        </div>
        <div style={{ flex:"1 1 160px", fontSize:12.5, color:C.muted }}>
          <div style={{ marginBottom:4 }}>Min–Max : {offer.minAmount} — {fmt(offer.maxAmount)} {cr.symbol}</div>
          <div style={{ marginBottom:4 }}>Dispo : <span style={{ color:C.green, fontWeight:600 }}>{fmt(offer.available)} {cr.symbol}</span></div>
          {offer.networkFee>0 && <div style={{ color:C.gold }}>+ Frais réseau : {fmt(offer.networkFee)} FCFA</div>}
          <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:6 }}>
            {offer.paymentMethods?.map(m=><span key={m} style={{ background:"rgba(255,255,255,0.05)", borderRadius:6, padding:"2px 7px", fontSize:11, fontWeight:600, color:C.text }}>{m}</span>)}
          </div>
        </div>
        <button onClick={go} style={{ ...st.btn("primary"), whiteSpace:"nowrap", flexShrink:0 }}>Acheter {cr.symbol} →</button>
      </div>
    </div>
  );
}

function BuyPage({ navigate, user, offer, orders, setOrders, accounts, notify }) {
  const st = makeStyles();
  const [step, setStep]       = useState(1);
  const [wallet, setWallet]   = useState("");
  const [amount, setAmount]   = useState("");
  const [wapp, setWapp]       = useState(user?.whatsapp||"");
  const [wErr, setWErr]       = useState("");
  const [payMsg, setPayMsg]   = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!offer) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
        <p style={{ marginBottom:20, color:C.muted }}>Aucune offre sélectionnée</p>
        <button onClick={()=>navigate("marketplace")} style={st.btn("primary")}>← Retour</button>
      </div>
    </div>
  );

  const sellerAcc = accounts.find(a=>a.id===offer.sellerId)||{};
  const pi = sellerAcc.paymentInfo||{};
  const cr = getCr(offer.crypto);
  const baseAmount = amount ? Math.round(parseFloat(amount)*offer.rate) : 0;
  const networkFee = offer.networkFee||0;
  const totalFCFA  = baseAmount + networkFee;

  const vw = (addr) => { if(!addr){setWErr("");return;} setWErr(cr.addrRegex.test(addr)?"":` Format invalide. Ex : ${cr.addrEx}`); };

  const handleStep1 = () => {
    if (!wallet) { notify("Entrez votre adresse wallet","error"); return; }
    if (wErr) { notify("Adresse wallet invalide","error"); return; }
    if (!amount||parseFloat(amount)<=0) { notify("Montant invalide","error"); return; }
    if (parseFloat(amount)<offer.minAmount) { notify(`Min : ${offer.minAmount} ${cr.symbol}`,"error"); return; }
    if (parseFloat(amount)>offer.maxAmount) { notify(`Max : ${offer.maxAmount} ${cr.symbol}`,"error"); return; }
    if (!wapp||wapp.length<8) { notify("Numéro WhatsApp obligatoire","error"); return; }
    setStep(2);
  };

  const handleConfirm = () => {
    if (!payMsg.trim()) { notify("Décrivez votre paiement","error"); return; }
    setLoading(true);
    setTimeout(()=>{
      const id = `CMD-${Date.now().toString().slice(-6)}`;
      setOrderId(id);
      setOrders(p=>[{ id, crypto:offer.crypto, amount:parseFloat(amount), amountFCFA:baseAmount, networkFee, totalFCFA, walletAddr:wallet, seller:offer.sellerName, sellerId:offer.sellerId, buyerId:user.id, buyerName:user.name, buyerWhatsapp:wapp, paymentMessage:payMsg, status:"paid", createdAt:new Date().toISOString() }, ...p]);
      setStep(3); setLoading(false);
      notify("Déclaration de paiement envoyée !");
    }, 1200);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <nav style={{ background:"rgba(6,9,15,0.97)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}`, padding:"0 24px" }}>
        <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", alignItems:"center", height:62, gap:14 }}>
          <button onClick={()=>navigate("marketplace")} style={st.btn("secondary","sm")}>← Retour</button>
          <span style={{ fontWeight:700, fontSize:15, color:C.text }}>Acheter {cr.name}</span>
        </div>
      </nav>
      <div style={{ maxWidth:560, margin:"36px auto", padding:"0 24px" }}>
        {/* Progress */}
        <div style={{ display:"flex", alignItems:"center", marginBottom:36 }}>
          {["Détails","Paiement","Terminé"].map((s2,i)=>(
            <div key={s2} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:step>i+1?C.green:step===i+1?C.gold:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, color:step>=i+1?"#000":C.muted, marginBottom:5, transition:"background 0.3s" }}>{step>i+1?"✓":i+1}</div>
                <span style={{ fontSize:11, color:step===i+1?C.gold:C.muted, whiteSpace:"nowrap" }}>{s2}</span>
              </div>
              {i<2&&<div style={{ height:2, flex:1, background:step>i+1?C.green:"rgba(255,255,255,0.08)", margin:"0 6px 18px", transition:"background 0.3s" }}/>}
            </div>
          ))}
        </div>

        {/* Seller card */}
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:16, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#0f2035,#1e3a5f)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.gold, fontSize:15, flexShrink:0 }}>{offer.sellerAvatar}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{offer.sellerName}</div>
            <div style={{ fontSize:12, color:C.muted }}>{offer.completedTrades} trades réalisés</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontWeight:800, color:C.gold, fontSize:16 }}>{fmt(offer.rate)}</div>
            <div style={{ fontSize:11, color:C.muted }}>FCFA / {cr.symbol}</div>
          </div>
        </div>

        {/* STEP 1 */}
        {step===1 && (
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:22, color:C.text }}>Détails de la commande</h2>

            {/* WhatsApp - OBLIGATOIRE */}
            <div style={{ marginBottom:18 }}>
              <label style={{ ...st.label, color:C.gold }}>📱 Numéro WhatsApp * (obligatoire)</label>
              <input style={st.input} placeholder="+229 01 XX XX XX XX" value={wapp} onChange={e=>setWapp(e.target.value)} />
              <p style={{ fontSize:12, color:C.muted, marginTop:5 }}>Le vendeur vous contactera sur WhatsApp pour confirmer.</p>
            </div>

            {/* Wallet */}
            <div style={{ marginBottom:18 }}>
              <label style={st.label}>Votre adresse Wallet {cr.name} ({cr.network}) *</label>
              <input style={{ ...st.input, borderColor:wErr?C.red:wallet&&!wErr?C.green:undefined }} placeholder={cr.addrEx} value={wallet} onChange={e=>{ setWallet(e.target.value); vw(e.target.value); }} />
              {wErr&&<p style={{ color:C.red, fontSize:12, marginTop:5 }}>⚠️{wErr}</p>}
              {wallet&&!wErr&&<p style={{ color:C.green, fontSize:12, marginTop:5 }}>✅ Adresse valide</p>}
            </div>

            {/* Amount */}
            <div style={{ marginBottom:22 }}>
              <label style={st.label}>Quantité de {cr.symbol} *</label>
              <div style={{ position:"relative" }}>
                <input style={{ ...st.input, paddingRight:72 }} type="number" placeholder={`Min: ${offer.minAmount}`} value={amount} onChange={e=>setAmount(e.target.value)} />
                <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", fontWeight:700, color:cr.color, fontSize:13 }}>{cr.symbol}</span>
              </div>
              <div style={{ fontSize:12, color:C.muted, marginTop:5 }}>Limites : {offer.minAmount} – {fmt(offer.maxAmount)} {cr.symbol}</div>
            </div>

            {/* Recap */}
            {baseAmount>0&&(
              <div style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:16, marginBottom:22 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                  <span style={{ color:C.muted }}>Crypto à recevoir</span><span style={{ fontWeight:600, color:C.text }}>{amount} {cr.symbol}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                  <span style={{ color:C.muted }}>Taux de change</span><span style={{ fontWeight:600, color:C.text }}>{fmt(offer.rate)} FCFA/{cr.symbol}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                  <span style={{ color:C.muted }}>Sous-total</span><span style={{ fontWeight:600, color:C.text }}>{fmt(baseAmount)} FCFA</span>
                </div>
                {networkFee>0&&(
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                    <span style={{ color:C.gold }}>+ Frais de réseau</span><span style={{ fontWeight:600, color:C.gold }}>{fmt(networkFee)} FCFA</span>
                  </div>
                )}
                <div style={{ height:1, background:"rgba(255,255,255,0.08)", margin:"10px 0" }}/>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontWeight:700, color:C.text }}>Total à payer</span>
                  <span style={{ fontWeight:900, fontSize:20, color:C.gold }}>{fmt(totalFCFA)} FCFA</span>
                </div>
              </div>
            )}
            <button onClick={handleStep1} style={{ ...st.btn("primary"), width:"100%", justifyContent:"center" }}>Voir les infos de paiement →</button>
          </div>
        )}

        {/* STEP 2 */}
        {step===2&&(
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:6, color:C.text }}>Effectuez le paiement</h2>
            <p style={{ color:C.muted, fontSize:13, marginBottom:22 }}>Payez le vendeur puis confirmez ci-dessous</p>

            {/* Amount */}
            <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:12, padding:16, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontWeight:700, fontSize:14, color:C.text }}>Montant total à envoyer</span>
              <span style={{ fontWeight:900, fontSize:22, color:C.gold }}>{fmt(totalFCFA)} FCFA</span>
            </div>

            {/* Seller payment info */}
            <div style={{ background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:12, padding:18, marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:C.text }}>📱 Coordonnées de paiement du vendeur</div>
              {pi.reseau&&<div style={{ display:"flex", justifyContent:"space-between", marginBottom:10, fontSize:14 }}><span style={{ color:C.muted }}>Réseau</span><strong style={{ color:C.text }}>{pi.reseau}</strong></div>}
              {pi.numero&&(
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ color:C.muted, fontSize:14 }}>Numéro Mobile Money</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <strong style={{ fontSize:18, letterSpacing:1, color:C.text }}>{pi.numero}</strong>
                    <button onClick={()=>{ navigator.clipboard?.writeText(pi.numero); notify("Numéro copié !"); }} style={{ ...st.btn("secondary","sm"), padding:"4px 10px", fontSize:11 }}>📋 Copier</button>
                  </div>
                </div>
              )}
              {pi.lienPaiement&&(
                <div style={{ marginTop:10 }}>
                  <a href={pi.lienPaiement.startsWith("http")?pi.lienPaiement:`https://${pi.lienPaiement}`} target="_blank" rel="noreferrer" style={{ ...st.btn("green"), width:"100%", justifyContent:"center", textDecoration:"none", fontSize:14 }}>💳 Payer via le lien du vendeur</a>
                </div>
              )}
              {!pi.numero&&!pi.lienPaiement&&<p style={{ color:C.gold, fontSize:13, fontStyle:"italic" }}>⚠️ Contactez directement le vendeur.</p>}
            </div>

            {/* Payment message */}
            <div style={{ marginBottom:20 }}>
              <label style={{ ...st.label, color:C.text }}>Votre message de confirmation de paiement *</label>
              <textarea style={{ ...st.input, resize:"vertical", minHeight:90, lineHeight:1.6 }} placeholder={`Ex : J'ai envoyé ${fmt(totalFCFA)} FCFA sur ${pi.reseau||"le réseau"} ${pi.numero||""} à ${new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}. Réf : XXXXXXX`} value={payMsg} onChange={e=>setPayMsg(e.target.value)} />
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button onClick={handleConfirm} disabled={loading} style={{ ...st.btn("green"), width:"100%", justifyContent:"center", fontSize:15, opacity:loading?0.7:1 }}>{loading?"⏳ Envoi...":"✅ J'ai payé — Confirmer mon paiement"}</button>
              <button onClick={()=>setStep(1)} style={{ ...st.btn("ghost"), width:"100%", justifyContent:"center" }}>← Modifier</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step===3&&(
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22, textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
            <h2 style={{ fontSize:22, fontWeight:900, marginBottom:8, color:C.text }}>Paiement déclaré !</h2>
            <p style={{ color:C.muted, marginBottom:24, fontSize:14, lineHeight:1.6 }}>Commande <strong style={{ color:C.gold }}>{orderId}</strong> en attente.<br/>Le vendeur va vérifier et vous envoyer vos cryptos.</p>
            <div style={{ background:"rgba(245,158,11,0.07)", borderRadius:12, padding:20, marginBottom:24, textAlign:"left" }}>
              {[["⏳","Le vendeur reçoit votre déclaration"],["🔍","Il vérifie sur son compte Mobile Money"],["💸","Il envoie vos cryptos à votre wallet"],["✅","Commande confirmée"]].map(([ic,tx],i)=>(
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:13, marginBottom:10 }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{ic}</span>
                  <span style={{ color:C.muted, lineHeight:1.5 }}>{tx}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={()=>navigate("dashboard")} style={st.btn("primary")}>Voir mes commandes →</button>
              <button onClick={()=>navigate("marketplace")} style={st.btn("secondary")}>Retour marketplace</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardPage({ navigate, user, logout, orders, setOrders, notify }) {
  const st = makeStyles();
  const [active, setActive] = useState("orders");

  const myOrders = orders.filter(o=>o.buyerId===user?.id);
  const menu = [
    { id:"orders",  label:"Mes commandes", icon:"📦", badge:myOrders.filter(o=>o.status==="paid").length },
    { id:"profile", label:"Mon profil",    icon:"👤", badge:0 },
    { id:"support", label:"Support",       icon:"💬", badge:0 },
  ];
  const titles = { orders:"Mes commandes", profile:"Mon profil", support:"Support" };

  const disputeOrder = (id) => { setOrders(orders.map(o=>o.id===id?{...o,status:"disputed"}:o)); notify("Litige ouvert.","error"); };

  return (
    <SidebarLayout user={user} logout={logout} navigate={navigate} active={active} setActive={setActive} menu={menu} title={titles[active]||"Tableau de bord"}>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:28 }}>
        {[{l:"Total",v:myOrders.length,i:"📦",col:C.blue},{l:"En attente",v:myOrders.filter(o=>o.status==="paid").length,i:"⏳",col:C.gold},{l:"Confirmées",v:myOrders.filter(o=>o.status==="confirmed").length,i:"✅",col:C.green}].map(stat=>(
          <div key={stat.l} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{stat.i}</div>
            <div style={{ fontSize:26, fontWeight:900, color:stat.col }}>{stat.v}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{stat.l}</div>
          </div>
        ))}
      </div>

      {active==="orders"&&(
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:C.text }}>Historique des commandes</h2>
            <button onClick={()=>navigate("marketplace")} style={st.btn("primary","sm")}>+ Nouvel achat</button>
          </div>
          {myOrders.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
              <p style={{ marginBottom:16 }}>Aucune commande pour l'instant</p>
              <button onClick={()=>navigate("marketplace")} style={st.btn("primary")}>Découvrir les offres →</button>
            </div>
          ) : myOrders.map(order=>{
            const cr2 = getCr(order.crypto);
            const status = STATUS[order.status]||STATUS.paid;
            return (
              <div key={order.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18, marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                  <div style={{ flex:"1 1 180px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, color:C.gold, fontSize:13 }}>{order.id}</span>
                      <span style={{ background:status.bg, color:status.color, padding:"2px 9px", borderRadius:100, fontSize:11, fontWeight:700 }}>{status.label}</span>
                    </div>
                    <div style={{ fontSize:12, color:C.muted }}>{new Date(order.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                  <div style={{ flex:"1 1 140px", display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ color:cr2.color, fontSize:18 }}>{cr2.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{order.amount} {cr2.symbol}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{fmt(order.totalFCFA||order.amountFCFA)} FCFA</div>
                    </div>
                  </div>
                  <div style={{ flex:"1 1 140px", fontSize:12.5, color:C.muted }}>
                    <div>Vendeur : <strong style={{ color:C.text }}>{order.seller}</strong></div>
                    <div style={{ fontSize:11, wordBreak:"break-all", marginTop:2 }}>Wallet : {order.walletAddr?.slice(0,16)}…</div>
                  </div>
                  <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
                    {order.status==="paid"&&<span style={{ fontSize:12, color:C.gold, fontStyle:"italic" }}>⏳ Attente vendeur…</span>}
                    {order.status==="confirmed"&&<span style={{ color:C.green, fontSize:12, fontWeight:600 }}>✅ Terminé</span>}
                    {order.status==="disputed"&&<span style={{ color:C.red, fontSize:12, fontWeight:600 }}>⚠️ Litige</span>}
                    {order.status==="paid"&&<button onClick={()=>disputeOrder(order.id)} style={st.btn("red","sm")}>⚠️ Litige</button>}
                  </div>
                </div>
                {order.paymentMessage&&(
                  <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:10, fontSize:12.5, color:C.muted, borderLeft:`3px solid ${C.gold}` }}>
                    <strong style={{ color:C.text }}>Votre message : </strong>{order.paymentMessage}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {active==="profile"&&(
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
          <h3 style={{ fontSize:17, fontWeight:700, marginBottom:20, color:C.text }}>Informations du compte</h3>
          {[{l:"Nom complet",v:user?.name},{l:"Email",v:user?.email},{l:"Statut",v:user?.isSeller?"Vendeur":"Acheteur"},{l:"WhatsApp",v:user?.whatsapp||"Non renseigné"}].map(f=>(
            <div key={f.l} style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ color:C.muted, fontSize:14 }}>{f.l}</span>
              <span style={{ fontWeight:600, fontSize:14, color:C.text }}>{f.v}</span>
            </div>
          ))}
          {!user?.isSeller&&(
            <div style={{ marginTop:22, padding:18, background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12 }}>
              <h4 style={{ fontWeight:700, marginBottom:8, color:C.text }}>Devenir vendeur ?</h4>
              <p style={{ color:C.muted, fontSize:13, marginBottom:14, lineHeight:1.6 }}>Contactez l'administrateur pour demander l'accès vendeur.</p>
              <a href="mailto:erickpakpo384@gmail.com" style={{ ...st.btn("primary","sm"), textDecoration:"none" }}>✉️ Contacter l'admin</a>
            </div>
          )}
        </div>
      )}

      {active==="support"&&(
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
          <h3 style={{ fontSize:17, fontWeight:700, marginBottom:16, color:C.text }}>Contacter le support</h3>
          <p style={{ color:C.muted, fontSize:14, marginBottom:22, lineHeight:1.6 }}>Disponible 7j/7 pour résoudre vos problèmes.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...st.btn("green"), textDecoration:"none", justifyContent:"center", fontSize:15 }}>📱 WhatsApp : +229 0155237685</a>
            <a href="mailto:erickpakpo384@gmail.com" style={{ ...st.btn("secondary"), textDecoration:"none", justifyContent:"center" }}>✉️ erickpakpo384@gmail.com</a>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}


function SellerPage({ navigate, user, logout, offers, setOffers, orders, setOrders, updateAccount, accounts, notify }) {
  const st = makeStyles();
  const [active, setActive] = useState("orders");
  const [showForm, setShowForm] = useState(false);
  const [offerForm, setOfferForm] = useState({ crypto:"usdt_trc20", rate:"", minAmount:"", maxAmount:"", available:"", networkFee:"" });
  const [payForm, setPayForm] = useState({ reseau:user?.paymentInfo?.reseau||"", numero:user?.paymentInfo?.numero||"", lienPaiement:user?.paymentInfo?.lienPaiement||"" });
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [wf, setWf] = useState({ amount:"", reseau:"", numero:"", nom:"" });
  const [financeBlocked, setFinanceBlocked] = useState(false);

  const myOffers = offers.filter(o=>o.sellerId===user?.id);
  const myOrders = orders.filter(o=>o.sellerId===user?.id);
  const limits   = user?.sellerLimits||{ reserve:0, maxSell:0, minSell:0 };
  const earnings = myOrders.filter(o=>o.status==="confirmed").reduce((s,o)=>s+o.amountFCFA,0);
  const pending  = myOrders.filter(o=>o.status==="paid").reduce((s,o)=>s+o.totalFCFA,0);

  const menu = [
    { id:"orders",  label:"Commandes reçues", icon:"📦", badge:myOrders.filter(o=>o.status==="paid").length },
    { id:"offers",  label:"Mes annonces",      icon:"🏷️", badge:0 },
    { id:"payment", label:"Infos de paiement", icon:"💳", badge:(!user?.paymentInfo?.numero&&!user?.paymentInfo?.lienPaiement)?1:0 },
    { id:"finance", label:"Finances",          icon:"💰", badge:0 },
  ];
  const titles = { orders:"Commandes reçues", offers:"Mes annonces", payment:"Infos de paiement", finance:"Finances" };

  const confirmOrder = (id) => { setOrders(orders.map(o=>o.id===id?{...o,status:"confirmed"}:o)); notify("Commande confirmée ! Crypto envoyée. ✅"); };
  const disputeOrder = (id) => { setOrders(orders.map(o=>o.id===id?{...o,status:"disputed"}:o)); notify("Litige ouvert.","error"); };

  const createOffer = () => {
    if (!offerForm.rate||!offerForm.minAmount||!offerForm.maxAmount||!offerForm.available) { notify("Remplissez tous les champs obligatoires","error"); return; }
    if (!user?.paymentInfo?.numero&&!user?.paymentInfo?.lienPaiement) { notify("Configurez d'abord vos infos de paiement (onglet 💳)","error"); setActive("payment"); return; }
    const minA = parseFloat(offerForm.minAmount);
    const maxA = parseFloat(offerForm.maxAmount);
    if (limits.minSell>0 && minA<limits.minSell) { notify(`Minimum autorisé par l'admin : ${limits.minSell}`,"error"); return; }
    if (limits.maxSell>0 && maxA>limits.maxSell) { notify(`Maximum autorisé par l'admin : ${limits.maxSell}`,"error"); return; }
    setOffers(p=>[{ id:`off_${Date.now()}`, sellerId:user.id, sellerName:user.name, sellerAvatar:user.name[0], crypto:offerForm.crypto, rate:parseFloat(offerForm.rate), minAmount:minA, maxAmount:maxA, available:parseFloat(offerForm.available), networkFee:parseFloat(offerForm.networkFee)||0, paymentMethods:[user.paymentInfo?.reseau||"Mobile Money"], completedTrades:0, createdAt:new Date().toISOString() }, ...p]);
    setOfferForm({ crypto:"usdt_trc20", rate:"", minAmount:"", maxAmount:"", available:"", networkFee:"" });
    setShowForm(false);
    notify("Annonce publiée ! ✅");
  };

  const savePayment = () => {
    if (!payForm.reseau) { notify("Entrez le réseau de paiement","error"); return; }
    if (!payForm.numero&&!payForm.lienPaiement) { notify("Entrez un numéro ou un lien de paiement","error"); return; }
    updateAccount(user.id,{ paymentInfo:{ reseau:payForm.reseau, numero:payForm.numero, lienPaiement:payForm.lienPaiement } });
    notify("Infos de paiement sauvegardées ! ✅");
  };

  const doWithdraw = () => {
    if (!wf.amount||!wf.reseau||!wf.numero||!wf.nom) { notify("Remplissez tous les champs","error"); return; }
    setWithdrawModal(false); setWf({ amount:"", reseau:"", numero:"", nom:"" });
    notify("Demande de retrait envoyée ! 💸");
  };

  // Finance blocked screen
  if (active==="finance" && financeBlocked) {
    return (
      <SidebarLayout user={user} logout={logout} navigate={navigate} active={active} setActive={(id)=>{ setFinanceBlocked(false); setActive(id); }} menu={menu} title="Finances">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
          <div style={{ textAlign:"center", padding:40, background:C.bgCard, border:"1px solid rgba(239,68,68,0.4)", borderRadius:20, maxWidth:420 }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🚫</div>
            <h2 style={{ fontSize:20, fontWeight:800, color:C.red, marginBottom:12 }}>Accès refusé</h2>
            <p style={{ color:C.muted, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
              Vous n'avez pas accès à cette fonctionnalité.<br/>
              Contactez l'administrateur pour plus d'informations.
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              <a href="mailto:erickpakpo384@gmail.com" style={{ ...st.btn("danger"), textDecoration:"none" }}>✉️ Contacter l'admin</a>
              <button onClick={()=>{ setFinanceBlocked(false); setActive("orders"); }} style={st.btn("secondary","sm")}>← Retour</button>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <>
      {withdrawModal&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22, maxWidth:400, width:"100%", zIndex:1001 }}>
            <h3 style={{ fontSize:18, fontWeight:800, marginBottom:6, color:C.text }}>Retrait Mobile Money</h3>
            <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Revenus confirmés : <strong style={{ color:C.green }}>{fmt(earnings)} FCFA</strong></p>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
              {[{k:"amount",l:"Montant (FCFA)",p:"Ex: 50000",t:"number"},{k:"reseau",l:"Réseau",p:"MTN, Orange…"},{k:"numero",l:"Numéro",p:"+229 XX XX XX XX"},{k:"nom",l:"Bénéficiaire",p:"Jean Dupont"}].map(f=>(
                <div key={f.k}>
                  <label style={st.label}>{f.l}</label>
                  <input style={st.input} type={f.t||"text"} placeholder={f.p} value={wf[f.k]} onChange={e=>setWf({...wf,[f.k]:e.target.value})} />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={doWithdraw} style={{ ...st.btn("primary"), flex:1, justifyContent:"center" }}>💸 Retirer</button>
              <button onClick={()=>setWithdrawModal(false)} style={{ ...st.btn("secondary"), flex:1, justifyContent:"center" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <SidebarLayout user={user} logout={logout} navigate={navigate}
        active={active}
        setActive={(id)=>{ if(id==="finance"){ setFinanceBlocked(true); } setActive(id); }}
        menu={menu} title={titles[active]||"Espace Vendeur"}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:12, marginBottom:28 }}>
          {[{l:"Revenus confirmés",v:`${fmt(earnings)} F`,i:"💰",col:C.green},{l:"En attente",v:`${fmt(pending)} F`,i:"⏳",col:C.gold},{l:"Commandes",v:myOrders.length,i:"📦",col:C.blue},{l:"Annonces actives",v:myOffers.length,i:"🏷️",col:C.purple}].map(stat=>(
            <div key={stat.l} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{stat.i}</div>
              <div style={{ fontSize:typeof stat.v==="number"?26:14, fontWeight:900, color:stat.col, lineHeight:1.2 }}>{stat.v}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>{stat.l}</div>
            </div>
          ))}
        </div>

        {/* Limits banner */}
        {limits.maxSell>0&&(
          <div style={{ background:"rgba(6,182,212,0.07)", border:`1px solid rgba(6,182,212,0.2)`, borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", gap:20, flexWrap:"wrap", fontSize:13 }}>
            <span style={{ color:C.muted }}>Limites définies par l'admin :</span>
            <span style={{ color:C.cyan }}>Min : <strong>{limits.minSell}</strong></span>
            <span style={{ color:C.cyan }}>Max : <strong>{fmt(limits.maxSell)}</strong></span>
            <span style={{ color:C.gold }}>Réserve bloquée : <strong>{fmt(limits.reserve)} FCFA</strong></span>
          </div>
        )}

        {/* ORDERS */}
        {active==="orders"&&(
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {myOrders.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}><div style={{ fontSize:48, marginBottom:12 }}>📭</div><p>Aucune commande reçue</p></div>
            ) : myOrders.map(order=>{
              const cr2 = getCr(order.crypto);
              const status = STATUS[order.status]||STATUS.paid;
              return (
                <div key={order.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:14, flexWrap:"wrap" }}>
                    <div style={{ flex:"1 1 180px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, color:C.gold, fontSize:13 }}>{order.id}</span>
                        <span style={{ background:status.bg, color:status.color, padding:"2px 9px", borderRadius:100, fontSize:11, fontWeight:700 }}>{status.label}</span>
                      </div>
                      <div style={{ fontSize:12, color:C.muted }}>{new Date(order.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                      <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Acheteur : <strong style={{ color:C.text }}>{order.buyerName}</strong></div>
                      {order.buyerWhatsapp&&(
                        <a href={`https://wa.me/${order.buyerWhatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:4, fontSize:12, color:C.green, textDecoration:"none" }}>
                          📱 {order.buyerWhatsapp}
                        </a>
                      )}
                    </div>
                    <div style={{ flex:"1 1 140px", display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ color:cr2.color, fontSize:18 }}>{cr2.icon}</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{order.amount} {cr2.symbol}</div>
                        <div style={{ fontSize:12, color:C.muted }}>{fmt(order.totalFCFA||order.amountFCFA)} FCFA</div>
                        {order.networkFee>0&&<div style={{ fontSize:11, color:C.gold }}>dont {fmt(order.networkFee)} F frais réseau</div>}
                      </div>
                    </div>
                    <div style={{ flex:"1 1 160px", fontSize:11.5, color:C.muted }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span>Wallet :</span>
                        <span style={{ fontFamily:"monospace", fontSize:11, wordBreak:"break-all" }}>{order.walletAddr?.slice(0,20)}…</span>
                        <button onClick={()=>{ navigator.clipboard?.writeText(order.walletAddr); notify("Adresse copiée !"); }} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, padding:"2px 6px", fontSize:10, color:C.gold, cursor:"pointer" }}>📋</button>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignItems:"center" }}>
                      {order.status==="paid"&&<><button onClick={()=>confirmOrder(order.id)} style={st.btn("green","sm")}>✅ Confirmer crypto envoyée</button><button onClick={()=>disputeOrder(order.id)} style={st.btn("red","sm")}>⚠️ Litige</button></>}
                      {order.status==="confirmed"&&<span style={{ color:C.green, fontSize:12, fontWeight:600 }}>✅ Terminé</span>}
                      {order.status==="disputed"&&<span style={{ color:C.red, fontSize:12, fontWeight:600 }}>⚠️ Litige</span>}
                    </div>
                  </div>
                  {order.paymentMessage&&(
                    <div style={{ marginTop:12, padding:"12px 16px", background:order.status==="paid"?"rgba(59,130,246,0.07)":"rgba(16,185,129,0.07)", borderRadius:10, fontSize:13, borderLeft:`3px solid ${order.status==="paid"?C.blue:C.green}` }}>
                      <div style={{ fontWeight:700, marginBottom:4, fontSize:12, color:C.muted }}>💬 Message de l'acheteur :</div>
                      <div style={{ color:C.text, lineHeight:1.5 }}>{order.paymentMessage}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* OFFERS */}
        {active==="offers"&&(
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:C.text }}>Mes annonces publiées</h2>
              <button onClick={()=>setShowForm(!showForm)} style={st.btn("primary","sm")}>+ Nouvelle annonce</button>
            </div>
            {showForm&&(
              <div style={{ background:C.bgCard, border:"1px solid rgba(245,158,11,0.3)", borderRadius:16, padding:22, marginBottom:20 }}>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18, color:C.text }}>Publier une annonce</h3>
                {!user?.paymentInfo?.numero&&!user?.paymentInfo?.lienPaiement&&(
                  <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:10, padding:12, marginBottom:16, fontSize:13, color:C.red }}>⚠️ Configurez d'abord vos infos de paiement (onglet 💳)</div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={st.label}>Crypto-monnaie à vendre</label>
                    <select style={st.input} value={offerForm.crypto} onChange={e=>setOfferForm({...offerForm,crypto:e.target.value})}>
                      {CRYPTOS.map(cr2=><option key={cr2.id} value={cr2.id}>{cr2.name} ({cr2.network})</option>)}
                    </select>
                  </div>
                  {[{k:"rate",l:"Taux (FCFA / 1 unité)"},{k:"available",l:"Quantité disponible"},{k:"minAmount",l:`Montant minimum${limits.minSell>0?` (admin: ≥${limits.minSell})`:""}`},{k:"maxAmount",l:`Montant maximum${limits.maxSell>0?` (admin: ≤${fmt(limits.maxSell)})`:""}`},{k:"networkFee",l:"Frais de réseau (FCFA) — optionnel"}].map(f=>(
                    <div key={f.k} style={{ gridColumn:f.k==="networkFee"?"1/-1":"auto" }}>
                      <label style={st.label}>{f.l}</label>
                      <input style={st.input} type="number" placeholder="0" value={offerForm[f.k]} onChange={e=>setOfferForm({...offerForm,[f.k]:e.target.value})} />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16, display:"flex", gap:8 }}>
                  <button onClick={createOffer} style={st.btn("primary","sm")}>Publier ✅</button>
                  <button onClick={()=>setShowForm(false)} style={st.btn("secondary","sm")}>Annuler</button>
                </div>
              </div>
            )}
            {myOffers.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}><div style={{ fontSize:48, marginBottom:12 }}>📋</div><p>Aucune annonce publiée</p><button onClick={()=>setShowForm(true)} style={{ ...st.btn("primary"), marginTop:16 }}>Créer ma première annonce</button></div>
            ) : myOffers.map(offer=>{
              const cr2 = getCr(offer.crypto);
              return (
                <div key={offer.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18, marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ flex:"1 1 150px", display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ color:cr2.color, fontSize:22 }}>{cr2.icon}</span>
                      <div><div style={{ fontWeight:700, fontSize:14, color:C.text }}>{cr2.name}</div><div style={{ fontSize:11, color:C.muted }}>{cr2.network}</div></div>
                    </div>
                    <div style={{ flex:"1 1 130px" }}>
                      <div style={{ fontWeight:800, fontSize:17, color:C.gold }}>{fmt(offer.rate)} FCFA</div>
                      <div style={{ fontSize:12, color:C.muted }}>Dispo : {fmt(offer.available)}</div>
                      {offer.networkFee>0&&<div style={{ fontSize:11, color:C.gold }}>+ {fmt(offer.networkFee)} F frais réseau</div>}
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <span style={{ background:"rgba(16,185,129,0.12)", color:C.green, padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>● Active</span>
                      <button onClick={()=>setOffers(offers.filter(o=>o.id!==offer.id))} style={st.btn("danger","sm")}>🗑 Supprimer</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAYMENT INFO */}
        {active==="payment"&&(
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
            <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8, color:C.text }}>💳 Infos de paiement Mobile Money</h3>
            <p style={{ color:C.muted, fontSize:13, marginBottom:24, lineHeight:1.6 }}>Ces infos seront affichées aux acheteurs. Configurez au moins un numéro ou un lien.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div><label style={st.label}>Réseau Mobile Money *</label><input style={st.input} placeholder="Ex: MTN MoMo, Orange Money, Moov Money…" value={payForm.reseau} onChange={e=>setPayForm({...payForm,reseau:e.target.value})} /></div>
              <div><label style={st.label}>Numéro Mobile Money</label><input style={st.input} placeholder="Ex: +229 01 55 23 76 85" value={payForm.numero} onChange={e=>setPayForm({...payForm,numero:e.target.value})} /></div>
              <div><label style={st.label}>Lien de paiement (Wave, PayDunya, FedaPay…) — optionnel</label><input style={st.input} placeholder="https://..." value={payForm.lienPaiement} onChange={e=>setPayForm({...payForm,lienPaiement:e.target.value})} /></div>
            </div>
            {(payForm.reseau||payForm.numero||payForm.lienPaiement)&&(
              <div style={{ marginTop:20, padding:16, background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:12 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:10, color:C.green }}>👁️ Aperçu acheteur</div>
                {payForm.reseau&&<div style={{ fontSize:13, marginBottom:6, color:C.text }}>Réseau : <strong>{payForm.reseau}</strong></div>}
                {payForm.numero&&<div style={{ fontSize:13, marginBottom:6, color:C.text }}>Numéro : <strong style={{ fontSize:16 }}>{payForm.numero}</strong></div>}
                {payForm.lienPaiement&&<div style={{ fontSize:13, color:C.blue }}>{payForm.lienPaiement}</div>}
              </div>
            )}
            <button onClick={savePayment} style={{ ...st.btn("primary"), marginTop:22, width:"100%", justifyContent:"center" }}>💾 Sauvegarder</button>
          </div>
        )}

        {/* FINANCE — bouton rouge, bloqué */}
        {active==="finance"&&!financeBlocked&&(
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
            <div style={{ textAlign:"center", padding:40, background:C.bgCard, border:"1px solid rgba(239,68,68,0.4)", borderRadius:20, maxWidth:420 }}>
              <div style={{ fontSize:56, marginBottom:16 }}>🚫</div>
              <h2 style={{ fontSize:20, fontWeight:800, color:C.red, marginBottom:12 }}>Accès refusé</h2>
              <p style={{ color:C.muted, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
                Vous n'avez pas accès à cette fonctionnalité.<br/>
                Contactez l'administrateur pour plus d'informations.
              </p>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                <a href="mailto:erickpakpo384@gmail.com" style={{ ...st.btn("danger"), textDecoration:"none" }}>✉️ Contacter l'admin</a>
                <button onClick={()=>setActive("orders")} style={st.btn("secondary","sm")}>← Retour</button>
              </div>
            </div>
          </div>
        )}
      </SidebarLayout>
    </>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ navigate, user, logout, offers, setOffers, orders, setOrders, accounts, setAccounts, promoteToSeller, notify }) {
  const st = makeStyles();
  const [active, setActive] = useState("overview");
  const [editSeller, setEditSeller] = useState(null); // { id, ... }
  const [showPwd, setShowPwd] = useState({});

  const disputes = orders.filter(o=>o.status==="disputed");
  const buyers   = accounts.filter(a=>!a.isAdmin&&!a.isSeller);
  const sellers  = accounts.filter(a=>a.isSeller&&!a.isAdmin);

  const menu = [
    { id:"overview", label:"Vue d'ensemble",      icon:"📊", badge:0 },
    { id:"users",    label:"Utilisateurs",         icon:"👥", badge:buyers.length },
    { id:"sellers",  label:"Vendeurs",             icon:"🏪", badge:0 },
    { id:"orders",   label:"Toutes les commandes", icon:"📦", badge:0 },
    { id:"disputes", label:"Litiges",              icon:"⚠️", badge:disputes.length },
    { id:"offers",   label:"Toutes les annonces",  icon:"🏷️", badge:0 },
  ];
  const titles = { overview:"Vue d'ensemble", users:"Utilisateurs", sellers:"Gestion des vendeurs", orders:"Commandes", disputes:"Litiges", offers:"Annonces" };

  const updateAcc = (id, patch) => setAccounts(prev=>prev.map(a=>a.id===id?{...a,...patch}:a));

  const resolveDispute = (orderId, favor) => {
    setOrders(orders.map(o=>o.id===orderId?{...o,status:favor==="buyer"?"pending":"confirmed"}:o));
    notify(`Litige résolu en faveur du ${favor==="buyer"?"l'acheteur":"vendeur"}. ✅`);
  };

  const Card = ({ children, style={} }) => <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22, ...style }}>{children}</div>;

  // Edit seller modal
  const EditSellerModal = () => {
    const acc = accounts.find(a=>a.id===editSeller);
    if (!acc) return null;
    const [form, setForm] = useState({ password:acc.password, sellerStatus:acc.sellerStatus||"active", reserve:acc.sellerLimits?.reserve||0, maxSell:acc.sellerLimits?.maxSell||0, minSell:acc.sellerLimits?.minSell||0 });
    const save = () => {
      updateAcc(acc.id, { password:form.password, sellerStatus:form.sellerStatus, sellerLimits:{ reserve:parseFloat(form.reserve)||0, maxSell:parseFloat(form.maxSell)||0, minSell:parseFloat(form.minSell)||0 } });
      setEditSeller(null);
      notify(`${acc.name} mis à jour. ✅`);
    };
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:18, padding:26, maxWidth:480, width:"100%", maxHeight:"90vh", overflowY:"auto" }}>
          <h3 style={{ fontSize:18, fontWeight:800, marginBottom:4, color:C.text }}>Gestion du vendeur</h3>
          <p style={{ color:C.muted, fontSize:13, marginBottom:22 }}>{acc.name} — {acc.email}</p>

          {/* Status */}
          <div style={{ marginBottom:16 }}>
            <label style={st.label}>Statut du compte vendeur</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["active","restricted","blocked"].map(s2=>(
                <button key={s2} onClick={()=>setForm({...form,sellerStatus:s2})} style={{ ...st.btn(form.sellerStatus===s2?"primary":"secondary","sm"), borderColor:s2==="blocked"?C.red:s2==="restricted"?C.gold:undefined }}>
                  {s2==="active"?"✅ Actif":s2==="restricted"?"⚠️ Restreint":"🚫 Bloqué"}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom:16 }}>
            <label style={st.label}>Mot de passe actuel</label>
            <div style={{ position:"relative" }}>
              <input style={{ ...st.input, paddingRight:90 }} type={showPwd[acc.id]?"text":"password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
              <button onClick={()=>setShowPwd(p=>({...p,[acc.id]:!p[acc.id]}))} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", cursor:"pointer", color:C.gold, fontSize:12, fontWeight:600 }}>
                {showPwd[acc.id]?"🙈 Cacher":"👁 Voir"}
              </button>
            </div>
          </div>

          {/* Limits */}
          <div style={{ background:"rgba(6,182,212,0.07)", border:`1px solid rgba(6,182,212,0.2)`, borderRadius:12, padding:16, marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:C.cyan }}>🔒 Limites & Réserve</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div>
                <label style={{ ...st.label, color:C.gold }}>Réserve bloquée (FCFA)</label>
                <input style={st.input} type="number" placeholder="Ex: 50000" value={form.reserve} onChange={e=>setForm({...form,reserve:e.target.value})} />
                <p style={{ fontSize:11, color:C.muted, marginTop:4, lineHeight:1.4 }}>Montant bloqué en cas de litige.</p>
              </div>
              <div></div>
              <div>
                <label style={st.label}>Vente minimum autorisée</label>
                <input style={st.input} type="number" placeholder="Ex: 10" value={form.minSell} onChange={e=>setForm({...form,minSell:e.target.value})} />
              </div>
              <div>
                <label style={st.label}>Vente maximum autorisée</label>
                <input style={st.input} type="number" placeholder="Ex: 5000" value={form.maxSell} onChange={e=>setForm({...form,maxSell:e.target.value})} />
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={save} style={{ ...st.btn("primary"), flex:1, justifyContent:"center" }}>💾 Sauvegarder</button>
            <button onClick={()=>{ if(window.confirm(`Supprimer le compte de ${acc.name} ?`)){ setAccounts(p=>p.filter(a=>a.id!==acc.id)); setEditSeller(null); notify(`${acc.name} supprimé.`,"info"); } }} style={st.btn("red","sm")}>🗑 Supprimer</button>
            <button onClick={()=>setEditSeller(null)} style={{ ...st.btn("secondary"), flex:1, justifyContent:"center" }}>Annuler</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {editSeller&&<EditSellerModal/>}
      <SidebarLayout user={user} logout={logout} navigate={navigate} active={active} setActive={setActive} menu={menu} title={titles[active]||"Administration"}>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:28 }}>
          {[{l:"Utilisateurs",v:accounts.length-1,i:"👥",col:C.purple},{l:"Vendeurs",v:sellers.length,i:"🏪",col:C.green},{l:"Commandes",v:orders.length,i:"📦",col:C.blue},{l:"Annonces",v:offers.length,i:"🏷️",col:C.gold},{l:"Litiges",v:disputes.length,i:"⚠️",col:C.red}].map(stat=>(
            <div key={stat.l} style={{ background:C.bgCard, borderLeft:`3px solid ${stat.col}`, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{stat.i}</div>
              <div style={{ fontSize:22, fontWeight:900, color:stat.col }}>{stat.v}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{stat.l}</div>
            </div>
          ))}
        </div>

        {/* OVERVIEW */}
        {active==="overview"&&(
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <Card>
              <h3 style={{ fontWeight:700, marginBottom:16, fontSize:15, color:C.text }}>📋 Statut des commandes</h3>
              {Object.entries(STATUS).map(([k,v])=>{
                const count = orders.filter(o=>o.status===k).length;
                return <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.text }}><span style={{ width:8,height:8,borderRadius:"50%",background:v.color,display:"inline-block" }}/>{v.label}</span>
                  <span style={{ fontWeight:700, background:v.bg, color:v.color, padding:"2px 10px", borderRadius:100, fontSize:12 }}>{count}</span>
                </div>;
              })}
            </Card>
            <Card>
              <h3 style={{ fontWeight:700, marginBottom:16, fontSize:15, color:C.text }}>🏷️ Cryptos en vente</h3>
              {CRYPTOS.map(cr2=>{
                const count = offers.filter(o=>o.crypto===cr2.id).length;
                return <div key={cr2.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.text }}><span style={{ color:cr2.color, fontSize:16 }}>{cr2.icon}</span>{cr2.name}</span>
                  <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{count} annonce{count!==1?"s":""}</span>
                </div>;
              })}
            </Card>
          </div>
        )}

        {/* USERS — promote to seller */}
        {active==="users"&&(
          <div>
            <div style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:20, fontSize:13, color:C.muted }}>
              Promouvez un utilisateur en vendeur. Il aura accès à l'espace vendeur et pourra publier des annonces.
            </div>
            {buyers.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:C.muted }}><div style={{ fontSize:40, marginBottom:10 }}>👤</div><p>Aucun utilisateur acheteur</p></div>
            ) : buyers.map(acc=>(
              <div key={acc.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18, marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#0f2035,#1e3a5f)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.gold, fontSize:15, flexShrink:0 }}>{acc.name[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{acc.name}</div>
                    <div style={{ color:C.muted, fontSize:12, marginTop:2 }}>{acc.email}</div>
                    {acc.whatsapp&&<div style={{ color:C.green, fontSize:12 }}>📱 {acc.whatsapp}</div>}
                  </div>
                  <button onClick={()=>{ promoteToSeller(acc.id); notify(`${acc.name} est maintenant vendeur ! ✅`); }} style={st.btn("primary","sm")}>🏪 Promouvoir vendeur</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SELLERS — full control */}
        {active==="sellers"&&(
          <div>
            {sellers.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}><div style={{ fontSize:48, marginBottom:12 }}>🏪</div><p>Aucun vendeur actif</p></div>
            ) : sellers.map(acc=>{
              const sellerOrders = orders.filter(o=>o.sellerId===acc.id);
              const revenue = sellerOrders.filter(o=>o.status==="confirmed").reduce((s,o)=>s+o.amountFCFA,0);
              const limits2  = acc.sellerLimits||{ reserve:0, maxSell:0, minSell:0 };
              const sStatus  = SELLER_STATUS[acc.sellerStatus||"active"];
              return (
                <div key={acc.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18, marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#0f2035,#1e3a5f)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.gold, fontSize:16, flexShrink:0 }}>{acc.name[0]}</div>
                    <div style={{ flex:"1 1 150px" }}>
                      <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{acc.name}</div>
                      <div style={{ color:C.muted, fontSize:12 }}>{acc.email}</div>
                      {acc.whatsapp&&<div style={{ color:C.green, fontSize:12 }}>📱 {acc.whatsapp}</div>}
                    </div>
                    <div style={{ flex:"1 1 120px", fontSize:12.5, color:C.muted }}>
                      <div>{sellerOrders.length} commandes</div>
                      <div style={{ color:C.green, fontWeight:600 }}>{fmt(revenue)} FCFA</div>
                      {limits2.reserve>0&&<div style={{ color:C.gold }}>Réserve : {fmt(limits2.reserve)} F</div>}
                    </div>
                    {/* Password display */}
                    <div style={{ flex:"1 1 140px" }}>
                      <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Mot de passe :</div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontFamily:"monospace", fontSize:13, color:C.text }}>{showPwd[acc.id]?acc.password:"••••••••"}</span>
                        <button onClick={()=>setShowPwd(p=>({...p,[acc.id]:!p[acc.id]}))} style={{ background:"transparent", border:"none", cursor:"pointer", color:C.gold, fontSize:12 }}>{showPwd[acc.id]?"🙈":"👁"}</button>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ background:sStatus.bg, color:sStatus.color, padding:"4px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>{sStatus.label}</span>
                      <button onClick={()=>setEditSeller(acc.id)} style={st.btn("cyan","sm")}>⚙️ Gérer</button>
                      {acc.sellerStatus!=="blocked"&&<button onClick={()=>{ updateAcc(acc.id,{sellerStatus:"blocked"}); notify(`${acc.name} bloqué.`,"error"); }} style={st.btn("red","sm")}>🚫 Bloquer</button>}
                      {acc.sellerStatus==="blocked"&&<button onClick={()=>{ updateAcc(acc.id,{sellerStatus:"active"}); notify(`${acc.name} débloqué. ✅`); }} style={st.btn("green","sm")}>✅ Débloquer</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ALL ORDERS */}
        {active==="orders"&&(
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {orders.length===0 ? <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}><div style={{ fontSize:48, marginBottom:12 }}>📭</div><p>Aucune commande</p></div>
            : orders.map(order=>{
              const cr2 = getCr(order.crypto);
              const status = STATUS[order.status]||STATUS.paid;
              return (
                <div key={order.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                    <span style={{ fontWeight:700, fontSize:13, color:C.gold, flex:"0 0 105px" }}>{order.id}</span>
                    <div style={{ flex:"1 1 120px" }}>
                      <div style={{ color:cr2.color }}>{cr2.icon} {order.amount} {cr2.symbol}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{fmt(order.totalFCFA||order.amountFCFA)} FCFA</div>
                    </div>
                    <div style={{ flex:"1 1 140px", fontSize:12.5, color:C.muted }}>
                      <div>Acheteur : <strong style={{ color:C.text }}>{order.buyerName}</strong></div>
                      <div>Vendeur : <strong style={{ color:C.text }}>{order.seller}</strong></div>
                    </div>
                    <span style={{ background:status.bg, color:status.color, padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DISPUTES */}
        {active==="disputes"&&(
          <div>
            {disputes.length===0 ? <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}><div style={{ fontSize:48, marginBottom:12 }}>✅</div><p>Aucun litige actif</p></div>
            : disputes.map(order=>{
              const cr2 = getCr(order.crypto);
              return (
                <div key={order.id} style={{ background:C.bgCard, border:"1px solid rgba(239,68,68,0.3)", borderRadius:16, padding:18, marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:12 }}>
                    <div style={{ flex:"1 1 140px" }}>
                      <div style={{ fontWeight:700, color:C.red, fontSize:13 }}>{order.id}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</div>
                    </div>
                    <div style={{ flex:"1 1 130px" }}>
                      <div style={{ fontWeight:700, color:C.text }}>{order.amount} {cr2.symbol}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{fmt(order.totalFCFA||order.amountFCFA)} FCFA</div>
                    </div>
                    <div style={{ flex:"1 1 130px", fontSize:12.5, color:C.muted }}>
                      <div>Acheteur : <strong style={{ color:C.text }}>{order.buyerName}</strong></div>
                      <div>Vendeur : <strong style={{ color:C.text }}>{order.seller}</strong></div>
                    </div>
                  </div>
                  {order.paymentMessage&&(
                    <div style={{ padding:"10px 14px", background:"rgba(59,130,246,0.07)", borderRadius:10, fontSize:12.5, marginBottom:14, borderLeft:`3px solid ${C.blue}` }}>
                      <strong style={{ color:C.text }}>Message paiement : </strong><span style={{ color:C.muted }}>{order.paymentMessage}</span>
                    </div>
                  )}
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <button onClick={()=>resolveDispute(order.id,"seller")} style={st.btn("green","sm")}>✅ En faveur du vendeur</button>
                    <button onClick={()=>resolveDispute(order.id,"buyer")} style={st.btn("red","sm")}>↩️ Rembourser l'acheteur</button>
                    <a href="https://wa.me/22901 55237685" target="_blank" rel="noreferrer" style={{ ...st.btn("secondary","sm"), textDecoration:"none" }}>💬 Contacter</a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ALL OFFERS */}
        {active==="offers"&&(
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {offers.length===0 ? <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}><div style={{ fontSize:48, marginBottom:12 }}>🏷️</div><p>Aucune annonce</p></div>
            : offers.map(offer=>{
              const cr2 = getCr(offer.crypto);
              return (
                <div key={offer.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ flex:"1 1 140px", display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ color:cr2.color, fontSize:22 }}>{cr2.icon}</span>
                      <div><div style={{ fontWeight:700, fontSize:14, color:C.text }}>{cr2.name}</div><div style={{ fontSize:11, color:C.muted }}>{cr2.network}</div></div>
                    </div>
                    <div style={{ flex:"1 1 120px" }}>
                      <div style={{ fontWeight:800, fontSize:16, color:C.gold }}>{fmt(offer.rate)} FCFA</div>
                      <div style={{ fontSize:12, color:C.muted }}>Dispo : {fmt(offer.available)}</div>
                    </div>
                    <div style={{ flex:"1 1 120px", fontSize:13, color:C.muted }}>Vendeur : <strong style={{ color:C.text }}>{offer.sellerName}</strong></div>
                    <div style={{ display:"flex", gap:8 }}>
                      <span style={{ background:"rgba(16,185,129,0.12)", color:C.green, padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>● Active</span>
                      <button onClick={()=>{ setOffers(offers.filter(o=>o.id!==offer.id)); notify("Annonce supprimée.","info"); }} style={st.btn("danger","sm")}>🗑 Supprimer</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SidebarLayout>
    </>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page,      setPage]      = useState("login");
  const [pageOpts,  setPageOpts]  = useState({});
  const [user,      setUser]      = useState(null);
  const [accounts,  setAccounts]  = useState(INIT_ACCOUNTS);
  const [offers,    setOffers]    = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [selOffer,  setSelOffer]  = useState(null);
  const [notif,     setNotif]     = useState(null);

  const notify = useCallback((msg, type="success") => {
    setNotif({ msg, type });
    setTimeout(()=>setNotif(null), 4500);
  }, []);

  const login = (acc) => {
    // Sync latest account data
    const latest = accounts.find(a=>a.id===acc.id)||acc;
    setUser(latest);
    setPage(latest.isAdmin?"admin":latest.isSeller?"seller":"marketplace");
    notify(`Bienvenue, ${latest.name} !`);
  };

  const logout = () => { setUser(null); setPage("login"); notify("Déconnexion réussie","info"); };

  const navigate = (p: any, opts: any={}) => {
    if (opts.offer) setSelOffer(opts.offer);
    setPageOpts(opts);
    setPage(p);
    window.scrollTo(0,0);
  };

  const promoteToSeller = (userId) => {
    setAccounts(prev=>prev.map(a=>a.id===userId?{...a,isSeller:true}:a));
  };

  const updateAccount = (userId, patch) => {
    setAccounts(prev=>prev.map(a=>a.id===userId?{...a,...patch}:a));
    if (user?.id===userId) setUser(prev=>({...prev,...patch}));
  };

  const shared = { navigate, notify, user, accounts, setAccounts, orders, setOrders, offers, setOffers };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#1e2d4d;border-radius:3px}
        input::placeholder,textarea::placeholder,select option{color:#64748b}
        button:hover{opacity:0.85} button:active{transform:scale(0.98)}
        select{appearance:none} textarea{font-family:inherit}
      `}</style>

      {notif&&(
        <div style={{ position:"fixed", top:20, right:20, zIndex:10000, background:notif.type==="success"?C.green:notif.type==="error"?C.red:C.blue, color:"#fff", padding:"13px 20px", borderRadius:12, fontWeight:600, fontSize:13, maxWidth:360, animation:"slideIn 0.3s ease" }}>
          {notif.type==="success"?"✅ ":notif.type==="error"?"❌ ":"ℹ️ "}{notif.msg}
        </div>
      )}

      {page==="login"       && <LoginPage      {...shared} login={login} />}
      {page==="admin-code"  && <AdminCodePage  {...shared} login={login} pendingUser={pageOpts.pendingUser} />}
      {page==="register"    && <RegisterPage   {...shared} login={login} />}
      {page==="marketplace" && <MarketplacePage {...shared} logout={logout} />}
      {page==="buy"         && <BuyPage        {...shared} logout={logout} offer={selOffer} />}
      {page==="dashboard"   && <DashboardPage  {...shared} logout={logout} />}
      {page==="seller"      && <SellerPage     {...shared} logout={logout} updateAccount={updateAccount} />}
      {page==="admin"       && <AdminPage      {...shared} logout={logout} promoteToSeller={promoteToSeller} updateAccount={updateAccount} />}
    </div>
  );
}
