import { useState } from "react";
import { C, CRYPTOS, getCr, fmt, makeStyles, STATUS } from "./crypto-constants";
import { SidebarLayout } from "./CryptoSharedComponents";

export default function CryptoSellerPage({ navigate, user, onLogout, offers, setOffers, orders, setOrders, updateAccount, accounts, notify }: any) {
  const st = makeStyles();
  const [active, setActive] = useState("orders");
  const [showForm, setShowForm] = useState(false);
  const [offerForm, setOfferForm] = useState({ crypto:"usdt_trc20", rate:"", minAmount:"", maxAmount:"", available:"", networkFee:"" });
  const [payForm, setPayForm] = useState({ reseau:user?.paymentInfo?.reseau||"", numero:user?.paymentInfo?.numero||"", lienPaiement:user?.paymentInfo?.lienPaiement||"" });

  const myOffers = offers.filter((o: any)=>o.sellerId===user?.id);
  const myOrders = orders.filter((o: any)=>o.sellerId===user?.id);
  const limits = user?.sellerLimits||{ reserve:0, maxSell:0, minSell:0 };
  const earnings = myOrders.filter((o: any)=>o.status==="confirmed").reduce((s: number,o: any)=>s+o.amountFCFA,0);
  const pending = myOrders.filter((o: any)=>o.status==="paid").reduce((s: number,o: any)=>s+o.totalFCFA,0);

  const menu = [
    { id:"orders",  label:"Commandes reçues", icon:"📦", badge:myOrders.filter((o: any)=>o.status==="paid").length },
    { id:"offers",  label:"Mes annonces",      icon:"🏷️", badge:0 },
    { id:"payment", label:"Infos de paiement", icon:"💳", badge:(!user?.paymentInfo?.numero&&!user?.paymentInfo?.lienPaiement)?1:0 },
  ];
  const titles: any = { orders:"Commandes reçues", offers:"Mes annonces", payment:"Infos de paiement" };

  const confirmOrder = (id: string) => { setOrders(orders.map((o: any)=>o.id===id?{...o,status:"confirmed"}:o)); notify("Commande confirmée ! Crypto envoyée. ✅"); };
  const disputeOrder = (id: string) => { setOrders(orders.map((o: any)=>o.id===id?{...o,status:"disputed"}:o)); notify("Litige ouvert.","error"); };

  const createOffer = () => {
    if (!offerForm.rate||!offerForm.minAmount||!offerForm.maxAmount||!offerForm.available) { notify("Remplissez tous les champs obligatoires","error"); return; }
    if (!user?.paymentInfo?.numero&&!user?.paymentInfo?.lienPaiement) { notify("Configurez d'abord vos infos de paiement (onglet 💳)","error"); setActive("payment"); return; }
    const minA = parseFloat(offerForm.minAmount);
    const maxA = parseFloat(offerForm.maxAmount);
    if (limits.minSell>0 && minA<limits.minSell) { notify(`Minimum autorisé par l'admin : ${limits.minSell}`,"error"); return; }
    if (limits.maxSell>0 && maxA>limits.maxSell) { notify(`Maximum autorisé par l'admin : ${limits.maxSell}`,"error"); return; }
    setOffers((p: any)=>[{ id:`off_${Date.now()}`, sellerId:user.id, sellerName:user.name, sellerAvatar:user.name[0], crypto:offerForm.crypto, rate:parseFloat(offerForm.rate), minAmount:minA, maxAmount:maxA, available:parseFloat(offerForm.available), networkFee:parseFloat(offerForm.networkFee)||0, paymentMethods:[user.paymentInfo?.reseau||"Mobile Money"], completedTrades:0, createdAt:new Date().toISOString() }, ...p]);
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

  return (
    <SidebarLayout user={user} onLogout={onLogout} navigate={navigate} active={active} setActive={setActive} menu={menu} title={titles[active]||"Espace Vendeur"}>
      {/* Stats - show rate in FCFA, amounts in FCFA */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:12, marginBottom:28 }}>
        {[{l:"Revenus confirmés",v:`${fmt(earnings)} FCFA`,i:"💰",col:C.green},{l:"En attente",v:`${fmt(pending)} FCFA`,i:"⏳",col:C.gold},{l:"Commandes",v:myOrders.length,i:"📦",col:C.blue},{l:"Annonces actives",v:myOffers.length,i:"🏷️",col:C.purple}].map(stat=>(
          <div key={stat.l} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{stat.i}</div>
            <div style={{ fontSize:typeof stat.v==="number"?26:14, fontWeight:900, color:stat.col, lineHeight:1.2 }}>{stat.v}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>{stat.l}</div>
          </div>
        ))}
      </div>

      {limits.maxSell>0&&(
        <div style={{ background:"rgba(6,182,212,0.07)", border:"1px solid rgba(6,182,212,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", gap:20, flexWrap:"wrap", fontSize:13 }}>
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
          ) : myOrders.map((order: any)=>{
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
                    <div style={{ fontSize:12, color:C.muted }}>Acheteur : <strong style={{ color:C.text }}>{order.buyerName}</strong></div>
                    {order.buyerWhatsapp&&(
                      <a href={`https://wa.me/${order.buyerWhatsapp.replace(/\s/g,"")}`} target="_blank" rel="noreferrer" style={{ fontSize:12, color:C.green, textDecoration:"none" }}>📱 {order.buyerWhatsapp}</a>
                    )}
                  </div>
                  <div style={{ flex:"1 1 140px", display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ color:cr2.color, fontSize:18 }}>{cr2.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{order.amount} {cr2.symbol}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{fmt(order.totalFCFA||order.amountFCFA)} FCFA</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
                    {order.status==="paid"&&<button onClick={()=>confirmOrder(order.id)} style={st.btn("green","sm")}>✅ Confirmer</button>}
                    {order.status==="paid"&&<button onClick={()=>disputeOrder(order.id)} style={st.btn("red","sm")}>⚠️ Litige</button>}
                    {order.status==="confirmed"&&<span style={{ color:C.green, fontSize:12, fontWeight:600 }}>✅ Terminé</span>}
                  </div>
                </div>
                {order.paymentMessage&&(
                  <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:10, fontSize:12.5, color:C.muted, borderLeft:`3px solid ${C.blue}` }}>
                    <strong style={{ color:C.text }}>Message acheteur : </strong>{order.paymentMessage}
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
                    <input style={st.input} type="number" placeholder="0" value={(offerForm as any)[f.k]} onChange={e=>setOfferForm({...offerForm,[f.k]:e.target.value})} />
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
            <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}><div style={{ fontSize:48, marginBottom:12 }}>📋</div><p>Aucune annonce publiée</p></div>
          ) : myOffers.map((offer: any)=>{
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
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <span style={{ background:"rgba(16,185,129,0.12)", color:C.green, padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>● Active</span>
                    <button onClick={()=>setOffers(offers.filter((o: any)=>o.id!==offer.id))} style={st.btn("danger","sm")}>🗑 Supprimer</button>
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
          <p style={{ color:C.muted, fontSize:13, marginBottom:24, lineHeight:1.6 }}>Ces infos seront affichées aux acheteurs.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div><label style={st.label}>Réseau Mobile Money *</label><input style={st.input} placeholder="Ex: MTN MoMo, Orange Money…" value={payForm.reseau} onChange={e=>setPayForm({...payForm,reseau:e.target.value})} /></div>
            <div><label style={st.label}>Numéro Mobile Money</label><input style={st.input} placeholder="Ex: +229 01 55 23 76 85" value={payForm.numero} onChange={e=>setPayForm({...payForm,numero:e.target.value})} /></div>
            <div><label style={st.label}>Lien de paiement — optionnel</label><input style={st.input} placeholder="https://..." value={payForm.lienPaiement} onChange={e=>setPayForm({...payForm,lienPaiement:e.target.value})} /></div>
          </div>
          <button onClick={savePayment} style={{ ...st.btn("primary"), marginTop:22, width:"100%", justifyContent:"center" }}>💾 Sauvegarder</button>
        </div>
      )}
    </SidebarLayout>
  );
}
