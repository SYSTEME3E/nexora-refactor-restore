import { useState } from "react";
import { C, CRYPTOS, getCr, fmt, makeStyles, CryptoOffer } from "./crypto-constants";
import { TopNav } from "./CryptoSharedComponents";

function OfferCard({ offer, navigate, user, notify }: any) {
  const st = makeStyles();
  const cr = getCr(offer.crypto);
  const go = () => {
    if (!user) { notify("Connectez-vous pour acheter","error"); return; }
    navigate("buy", { offer });
  };
  return (
    <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, flex:"1 1 200px" }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:46, height:46, borderRadius:"50%", background:"linear-gradient(135deg,#0f2035,#1e3a5f)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:700, color:C.gold, border:`2px solid ${C.green}` }}>{offer.sellerAvatar}</div>
            <div style={{ position:"absolute", bottom:1, right:1, width:11, height:11, borderRadius:"50%", background:C.green, border:`2px solid ${C.bgCard}` }}/>
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{offer.sellerName}</span>
              <span style={{ background:"rgba(16,185,129,0.12)", color:C.green, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:100 }}>✓ VENDEUR</span>
            </div>
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
            {offer.paymentMethods?.map((m: string)=><span key={m} style={{ background:"rgba(255,255,255,0.05)", borderRadius:6, padding:"2px 7px", fontSize:11, fontWeight:600, color:C.text }}>{m}</span>)}
          </div>
        </div>
        <button onClick={go} style={{ ...st.btn("primary"), whiteSpace:"nowrap", flexShrink:0 }}>Acheter {cr.symbol} →</button>
      </div>
    </div>
  );
}

export default function CryptoMarketplacePage({ navigate, user, onLogout, offers, notify }: any) {
  const st = makeStyles();
  const [selCrypto, setSelCrypto] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = offers.filter((o: CryptoOffer)=>(selCrypto==="all"||o.crypto===selCrypto)&&(search===""||o.sellerName.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{ background:C.bg, minHeight:"100vh" }}>
      <TopNav navigate={navigate} user={user} onLogout={onLogout} />
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
            {filtered.map((offer: CryptoOffer)=><OfferCard key={offer.id} offer={offer} navigate={navigate} user={user} notify={notify} />)}
          </div>
        )}
      </div>
    </div>
  );
}
