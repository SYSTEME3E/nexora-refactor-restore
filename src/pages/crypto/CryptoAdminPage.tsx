import { useState } from "react";
import { C, CRYPTOS, getCr, fmt, makeStyles, STATUS, SELLER_STATUS } from "./crypto-constants";
import { SidebarLayout } from "./CryptoSharedComponents";

export default function CryptoAdminPage({ navigate, user, onLogout, offers, setOffers, orders, setOrders, accounts, setAccounts, promoteToSeller, notify, updateAccount }: any) {
  const st = makeStyles();
  const [active, setActive] = useState("overview");
  const [editSeller, setEditSeller] = useState<string|null>(null);

  const disputes = orders.filter((o: any)=>o.status==="disputed");
  const buyers = accounts.filter((a: any)=>!a.isAdmin&&!a.isSeller);
  const sellers = accounts.filter((a: any)=>a.isSeller&&!a.isAdmin);

  const menu = [
    { id:"overview", label:"Vue d'ensemble",      icon:"📊", badge:0 },
    { id:"users",    label:"Utilisateurs",         icon:"👥", badge:buyers.length },
    { id:"sellers",  label:"Vendeurs",             icon:"🏪", badge:0 },
    { id:"orders",   label:"Toutes les commandes", icon:"📦", badge:0 },
    { id:"disputes", label:"Litiges",              icon:"⚠️", badge:disputes.length },
    { id:"offers",   label:"Toutes les annonces",  icon:"🏷️", badge:0 },
  ];
  const titles: any = { overview:"Vue d'ensemble", users:"Utilisateurs", sellers:"Gestion des vendeurs", orders:"Commandes ($)", disputes:"Litiges", offers:"Annonces" };

  const updateAcc = (id: string, patch: any) => setAccounts((prev: any[])=>prev.map((a: any)=>a.id===id?{...a,...patch}:a));

  const resolveDispute = (orderId: string, favor: string) => {
    setOrders(orders.map((o: any)=>o.id===orderId?{...o,status:favor==="buyer"?"pending":"confirmed"}:o));
    notify(`Litige résolu en faveur du ${favor==="buyer"?"l'acheteur":"vendeur"}. ✅`);
  };

  const Card = ({ children, style={} }: any) => <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22, ...style }}>{children}</div>;

  // All admin amounts in $
  const fmtUSD = (fcfa: number) => `$${(fcfa / 615).toFixed(2)}`;

  const EditSellerModal = () => {
    const acc = accounts.find((a: any)=>a.id===editSeller);
    if (!acc) return null;
    const [form, setForm] = useState({ sellerStatus:acc.sellerStatus||"active", reserve:acc.sellerLimits?.reserve||0, maxSell:acc.sellerLimits?.maxSell||0, minSell:acc.sellerLimits?.minSell||0 });
    const save = () => {
      updateAcc(acc.id, { sellerStatus:form.sellerStatus, sellerLimits:{ reserve:parseFloat(form.reserve)||0, maxSell:parseFloat(form.maxSell)||0, minSell:parseFloat(form.minSell)||0 } });
      setEditSeller(null);
      notify(`${acc.name} mis à jour. ✅`);
    };
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:18, padding:26, maxWidth:480, width:"100%", maxHeight:"90vh", overflowY:"auto" }}>
          <h3 style={{ fontSize:18, fontWeight:800, marginBottom:4, color:C.text }}>Gestion du vendeur</h3>
          <p style={{ color:C.muted, fontSize:13, marginBottom:22 }}>{acc.name} — {acc.email}</p>
          <div style={{ marginBottom:16 }}>
            <label style={st.label}>Statut du compte vendeur</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["active","restricted","blocked"].map((s2: string)=>(
                <button key={s2} onClick={()=>setForm({...form,sellerStatus:s2})} style={{ ...st.btn(form.sellerStatus===s2?"primary":"secondary","sm") }}>
                  {s2==="active"?"✅ Actif":s2==="restricted"?"⚠️ Restreint":"🚫 Bloqué"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ background:"rgba(6,182,212,0.07)", border:"1px solid rgba(6,182,212,0.2)", borderRadius:12, padding:16, marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:C.cyan }}>🔒 Limites & Réserve ($)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div>
                <label style={{ ...st.label, color:C.gold }}>Réserve bloquée ($)</label>
                <input style={st.input} type="number" placeholder="Ex: 80" value={form.reserve} onChange={e=>setForm({...form,reserve:e.target.value})} />
              </div>
              <div></div>
              <div>
                <label style={st.label}>Vente minimum ($)</label>
                <input style={st.input} type="number" placeholder="Ex: 10" value={form.minSell} onChange={e=>setForm({...form,minSell:e.target.value})} />
              </div>
              <div>
                <label style={st.label}>Vente maximum ($)</label>
                <input style={st.input} type="number" placeholder="Ex: 5000" value={form.maxSell} onChange={e=>setForm({...form,maxSell:e.target.value})} />
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={save} style={{ ...st.btn("primary"), flex:1, justifyContent:"center" }}>💾 Sauvegarder</button>
            <button onClick={()=>{ if(window.confirm(`Supprimer le compte de ${acc.name} ?`)){ setAccounts((p: any[])=>p.filter((a: any)=>a.id!==acc.id)); setEditSeller(null); notify(`${acc.name} supprimé.`); } }} style={st.btn("red","sm")}>🗑 Supprimer</button>
            <button onClick={()=>setEditSeller(null)} style={{ ...st.btn("secondary"), flex:1, justifyContent:"center" }}>Annuler</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {editSeller&&<EditSellerModal/>}
      <SidebarLayout user={user} onLogout={onLogout} navigate={navigate} active={active} setActive={setActive} menu={menu} title={titles[active]||"Administration"}>
        {/* Stats - all in $ */}
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
                const count = orders.filter((o: any)=>o.status===k).length;
                return <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.text }}><span style={{ width:8,height:8,borderRadius:"50%",background:v.color,display:"inline-block" }}/>{v.label}</span>
                  <span style={{ fontWeight:700, background:v.bg, color:v.color, padding:"2px 10px", borderRadius:100, fontSize:12 }}>{count}</span>
                </div>;
              })}
            </Card>
            <Card>
              <h3 style={{ fontWeight:700, marginBottom:16, fontSize:15, color:C.text }}>🏷️ Cryptos en vente</h3>
              {CRYPTOS.map(cr2=>{
                const count = offers.filter((o: any)=>o.crypto===cr2.id).length;
                return <div key={cr2.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.text }}><span style={{ color:cr2.color, fontSize:16 }}>{cr2.icon}</span>{cr2.name}</span>
                  <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{count} annonce{count!==1?"s":""}</span>
                </div>;
              })}
            </Card>
          </div>
        )}

        {/* USERS */}
        {active==="users"&&(
          <div>
            <div style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:20, fontSize:13, color:C.muted }}>
              Promouvez un utilisateur en vendeur.
            </div>
            {buyers.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:C.muted }}><div style={{ fontSize:40, marginBottom:10 }}>👤</div><p>Aucun utilisateur acheteur</p></div>
            ) : buyers.map((acc: any)=>(
              <div key={acc.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18, marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#0f2035,#1e3a5f)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.gold, fontSize:15 }}>{acc.name?.[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{acc.name}</div>
                    <div style={{ fontSize:12, color:C.muted }}>{acc.email}</div>
                  </div>
                  <button onClick={()=>{ promoteToSeller(acc.id); notify(`${acc.name} promu vendeur ! ✅`); }} style={st.btn("green","sm")}>🏪 Promouvoir vendeur</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SELLERS */}
        {active==="sellers"&&(
          <div>
            {sellers.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:C.muted }}><div style={{ fontSize:40, marginBottom:10 }}>🏪</div><p>Aucun vendeur</p></div>
            ) : sellers.map((acc: any)=>{
              const sStatus = SELLER_STATUS[acc.sellerStatus]||SELLER_STATUS.active;
              return (
                <div key={acc.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18, marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#0f2035,#1e3a5f)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.gold, fontSize:16 }}>{acc.name?.[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{acc.name}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{acc.email}</div>
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

        {/* ALL ORDERS - amounts in $ */}
        {active==="orders"&&(
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {orders.length===0 ? <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}><div style={{ fontSize:48, marginBottom:12 }}>📭</div><p>Aucune commande</p></div>
            : orders.map((order: any)=>{
              const cr2 = getCr(order.crypto);
              const status = STATUS[order.status]||STATUS.paid;
              return (
                <div key={order.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                    <span style={{ fontWeight:700, fontSize:13, color:C.gold, flex:"0 0 105px" }}>{order.id}</span>
                    <div style={{ flex:"1 1 120px" }}>
                      <div style={{ color:cr2.color }}>{cr2.icon} {order.amount} {cr2.symbol}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{fmtUSD(order.totalFCFA||order.amountFCFA)}</div>
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
            : disputes.map((order: any)=>{
              const cr2 = getCr(order.crypto);
              return (
                <div key={order.id} style={{ background:C.bgCard, border:"1px solid rgba(239,68,68,0.3)", borderRadius:16, padding:18, marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:12 }}>
                    <div style={{ flex:"1 1 140px" }}>
                      <div style={{ fontWeight:700, color:C.red, fontSize:13 }}>{order.id}</div>
                    </div>
                    <div style={{ flex:"1 1 130px" }}>
                      <div style={{ fontWeight:700, color:C.text }}>{order.amount} {cr2.symbol}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{fmtUSD(order.totalFCFA||order.amountFCFA)}</div>
                    </div>
                    <div style={{ flex:"1 1 130px", fontSize:12.5, color:C.muted }}>
                      <div>Acheteur : <strong style={{ color:C.text }}>{order.buyerName}</strong></div>
                      <div>Vendeur : <strong style={{ color:C.text }}>{order.seller}</strong></div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <button onClick={()=>resolveDispute(order.id,"seller")} style={st.btn("green","sm")}>✅ Faveur vendeur</button>
                    <button onClick={()=>resolveDispute(order.id,"buyer")} style={st.btn("red","sm")}>↩️ Rembourser</button>
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
            : offers.map((offer: any)=>{
              const cr2 = getCr(offer.crypto);
              return (
                <div key={offer.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ flex:"1 1 140px", display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ color:cr2.color, fontSize:22 }}>{cr2.icon}</span>
                      <div><div style={{ fontWeight:700, fontSize:14, color:C.text }}>{cr2.name}</div><div style={{ fontSize:11, color:C.muted }}>{cr2.network}</div></div>
                    </div>
                    <div style={{ flex:"1 1 120px" }}>
                      <div style={{ fontWeight:800, fontSize:16, color:C.gold }}>{fmtUSD(offer.rate)} /unité</div>
                      <div style={{ fontSize:12, color:C.muted }}>Dispo : {fmt(offer.available)}</div>
                    </div>
                    <div style={{ flex:"1 1 120px", fontSize:13, color:C.muted }}>Vendeur : <strong style={{ color:C.text }}>{offer.sellerName}</strong></div>
                    <button onClick={()=>{ setOffers(offers.filter((o: any)=>o.id!==offer.id)); notify("Annonce supprimée."); }} style={st.btn("danger","sm")}>🗑 Supprimer</button>
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
