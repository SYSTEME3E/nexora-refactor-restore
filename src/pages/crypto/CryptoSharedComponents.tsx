import { useState } from "react";
import { C } from "./crypto-constants";

// ─── HAMBURGER ────────────────────────────────────────────────────────────────
export function Ham({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Menu" style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, cursor:"pointer", padding:"8px 10px", borderRadius:10, display:"flex", flexDirection:"column", gap:5, alignItems:"center", justifyContent:"center", width:42, height:42 }}>
      {[0,1,2].map(i=><span key={i} style={{ display:"block", width:18, height:2, borderRadius:2, background:C.gold }}/>)}
    </button>
  );
}

// ─── SIDEBAR LAYOUT ───────────────────────────────────────────────────────────
export function SidebarLayout({ user, onLogout, navigate, active, setActive, menu, title, children }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg }}>
      {open && <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:199, backdropFilter:"blur(3px)" }}/>}
      <aside style={{ position:"fixed", top:0, left:0, height:"100vh", zIndex:200, width:252, background:C.sidebar, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", transform:open?"translateX(0)":"translateX(-100%)", transition:"transform 0.28s cubic-bezier(.4,0,.2,1)", overflowY:"auto" }}>
        <div style={{ padding:"18px 18px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:34, height:34, background:`linear-gradient(135deg,${C.gold},${C.goldD})`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, color:"#000" }}>₿</div>
            <span style={{ fontWeight:900, fontSize:17, background:`linear-gradient(135deg,${C.gold},#fbbf24)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CryptoP2P</span>
          </div>
          <button onClick={()=>setOpen(false)} style={{ background:"transparent", border:"none", cursor:"pointer", color:C.muted, fontSize:18, padding:4, lineHeight:1 }}>✕</button>
        </div>
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.goldD})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:16, color:"#000", flexShrink:0 }}>{user?.name?.[0]||"U"}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:13, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{user?.isAdmin?"Administrateur":user?.isSeller?"Vendeur":"Acheteur"}</div>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, padding:"10px" }}>
          {menu.map((item: any)=>(
            <button key={item.id} onClick={()=>{ setActive(item.id); setOpen(false); }} style={{ width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:11, padding:"10px 12px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:3, fontSize:13, fontWeight:600, background:active===item.id?"rgba(245,158,11,0.12)":"transparent", color:active===item.id?C.gold:C.muted, borderLeft:`3px solid ${active===item.id?C.gold:"transparent"}`, transition:"all 0.15s" }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge>0&&<span style={{ background:C.red, color:"#fff", fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:100, minWidth:18, textAlign:"center" }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding:"10px 10px 20px", borderTop:`1px solid ${C.border}` }}>
          {!user?.isAdmin&&(
            <button onClick={()=>{ navigate("marketplace"); setOpen(false); }} style={{ width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:11, padding:"9px 12px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:3, fontSize:13, fontWeight:600, background:"transparent", color:C.muted }}>
              <span style={{ fontSize:15 }}>🛒</span><span>Marketplace</span>
            </button>
          )}
          <button onClick={onLogout} style={{ width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:11, padding:"9px 12px", borderRadius:10, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:"transparent", color:C.red }}>
            <span style={{ fontSize:15 }}>🚪</span><span>Retour Nexora</span>
          </button>
        </div>
      </aside>
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

// ─── TOP NAV for marketplace ──────────────────────────────────────────────────
export function TopNav({ navigate, user, onLogout }: any) {
  const st = { btn: (v: string, sz?: string) => {
    const styles: any = {
      primary: { background:`linear-gradient(135deg,${C.gold},${C.goldD})`, color:"#000", fontWeight:700, border:"none", cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 },
      secondary: { background:"rgba(255,255,255,0.05)", color:C.text, fontWeight:600, border:`1px solid ${C.border}`, cursor:"pointer", borderRadius:10, padding:sz==="sm"?"7px 14px":"11px 22px", fontSize:sz==="sm"?13:14, display:"inline-flex", alignItems:"center", gap:6 },
    };
    return styles[v] || {};
  }};
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
          <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.goldD})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#000", fontSize:13 }}>{user?.name?.[0]||"U"}</div>
          <button onClick={onLogout} style={st.btn("secondary","sm")}>Retour Nexora</button>
        </div>
      </div>
    </nav>
  );
}
