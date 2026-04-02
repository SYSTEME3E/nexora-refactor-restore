import { useState } from "react";
import { C, getCr, fmt, makeStyles, STATUS } from "./crypto-constants";
import { SidebarLayout } from "./CryptoSharedComponents";

export default function CryptoDashboardPage({ navigate, user, onLogout, orders, setOrders, notify }: any) {
  const st = makeStyles();
  const [active, setActive] = useState("orders");

  const myOrders = orders.filter((o: any)=>o.buyerId===user?.id);
  const menu = [
    { id:"orders",  label:"Mes commandes", icon:"📦", badge:myOrders.filter((o: any)=>o.status==="paid").length },
    { id:"profile", label:"Mon profil",    icon:"👤", badge:0 },
    { id:"support", label:"Support",       icon:"💬", badge:0 },
  ];
  const titles: any = { orders:"Mes commandes", profile:"Mon profil", support:"Support" };

  const disputeOrder = (id: string) => { setOrders(orders.map((o: any)=>o.id===id?{...o,status:"disputed"}:o)); notify("Litige ouvert.","error"); };

  return (
    <SidebarLayout user={user} onLogout={onLogout} navigate={navigate} active={active} setActive={setActive} menu={menu} title={titles[active]||"Tableau de bord"}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:28 }}>
        {[{l:"Total",v:myOrders.length,i:"📦",col:C.blue},{l:"En attente",v:myOrders.filter((o: any)=>o.status==="paid").length,i:"⏳",col:C.gold},{l:"Confirmées",v:myOrders.filter((o: any)=>o.status==="confirmed").length,i:"✅",col:C.green}].map(stat=>(
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
          ) : myOrders.map((order: any)=>{
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
                  </div>
                  <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
                    {order.status==="paid"&&<span style={{ fontSize:12, color:C.gold, fontStyle:"italic" }}>⏳ Attente vendeur…</span>}
                    {order.status==="confirmed"&&<span style={{ color:C.green, fontSize:12, fontWeight:600 }}>✅ Terminé</span>}
                    {order.status==="disputed"&&<span style={{ color:C.red, fontSize:12, fontWeight:600 }}>⚠️ Litige</span>}
                    {order.status==="paid"&&<button onClick={()=>disputeOrder(order.id)} style={st.btn("red","sm")}>⚠️ Litige</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {active==="profile"&&(
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
          <h3 style={{ fontSize:17, fontWeight:700, marginBottom:20, color:C.text }}>Informations du compte</h3>
          {[{l:"Nom complet",v:user?.name},{l:"Email",v:user?.email},{l:"Statut",v:user?.isSeller?"Vendeur":"Acheteur"}].map((f: any)=>(
            <div key={f.l} style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ color:C.muted, fontSize:14 }}>{f.l}</span>
              <span style={{ fontWeight:600, fontSize:14, color:C.text }}>{f.v}</span>
            </div>
          ))}
        </div>
      )}

      {active==="support"&&(
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
          <h3 style={{ fontSize:17, fontWeight:700, marginBottom:16, color:C.text }}>Contacter le support</h3>
          <p style={{ color:C.muted, fontSize:14, marginBottom:22, lineHeight:1.6 }}>Disponible 7j/7 pour résoudre vos problèmes.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <a href="https://wa.me/22901555237685" target="_blank" rel="noreferrer" style={{ ...st.btn("green"), textDecoration:"none", justifyContent:"center", fontSize:15 }}>📱 WhatsApp</a>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
