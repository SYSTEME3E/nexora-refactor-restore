// ─── CryptoAdminPanelPage.tsx ─────────────────────────────────────────────────
// Panneau d'administration complet — code d'accès: 5523
// Fonctionnalités: gestion vendeurs, limites, réserves, blocage, mots de passe
import { useState, useRef } from "react";
import { C, CRYPTOS, getCr, fmt, makeStyles, SELLER_STATUS } from "./crypto-constants";
import { SidebarLayout } from "./CryptoSharedComponents";

const ADMIN_PIN = "5523";

// ─── Composants utilitaires ───────────────────────────────────────────────────
function Modal({ children, onClose }: any) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:1200, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(6px)" }}>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:20, padding:28, maxWidth:520, width:"100%", maxHeight:"92vh", overflowY:"auto", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"transparent", border:"none", cursor:"pointer", color:C.muted, fontSize:22, lineHeight:1 }}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ─── Écran de saisie du code PIN ──────────────────────────────────────────────
function AdminPinGate({ onSuccess }: { onSuccess: () => void }) {
  const st = makeStyles();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);

  const tryPin = () => {
    if (pin === ADMIN_PIN) {
      onSuccess();
    } else {
      setErr("Code d'autorisation incorrect");
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ maxWidth:380, width:"100%", textAlign:"center" }}>
        <div style={{ width:70, height:70, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.goldD})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 24px", boxShadow:`0 0 30px rgba(245,158,11,0.35)` }}>🔐</div>
        <h1 style={{ fontSize:24, fontWeight:900, color:C.text, marginBottom:8 }}>Accès Administrateur</h1>
        <p style={{ color:C.muted, fontSize:14, marginBottom:32 }}>Saisissez votre code d'autorisation pour continuer</p>
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:18, padding:28, animation:shake?"shake 0.5s ease":"none" }}>
          <div style={{ marginBottom:20 }}>
            <label style={{ ...st.label, textAlign:"left" }}>Code d'autorisation</label>
            <input
              type="password"
              style={{ ...st.input, fontSize:22, letterSpacing:8, textAlign:"center" }}
              placeholder="••••"
              maxLength={6}
              value={pin}
              onChange={e => { setPin(e.target.value); setErr(""); }}
              onKeyDown={e => e.key === "Enter" && tryPin()}
              autoFocus
            />
            {err && <p style={{ color:C.red, fontSize:13, marginTop:8, textAlign:"left" }}>⚠️ {err}</p>}
          </div>
          <button onClick={tryPin} style={{ ...st.btn("primary"), width:"100%", justifyContent:"center", fontSize:15 }}>
            🔓 Accéder au panneau
          </button>
        </div>
        <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }`}</style>
      </div>
    </div>
  );
}

// ─── Modal Gérer Vendeur ──────────────────────────────────────────────────────
function EditSellerModal({ acc, onSave, onClose, notify }: any) {
  const st = makeStyles();
  const [form, setForm] = useState({
    sellerStatus: acc.sellerStatus || "active",
    reserve:  String(acc.sellerLimits?.reserve  ?? 0),
    maxSell:  String(acc.sellerLimits?.maxSell  ?? 0),
    minSell:  String(acc.sellerLimits?.minSell  ?? 0),
    newPassword: "",
  });
  const [showPw, setShowPw] = useState(false);

  const save = () => {
    const reserve = parseFloat(form.reserve)  || 0;
    const maxSell = parseFloat(form.maxSell)  || 0;
    const minSell = parseFloat(form.minSell)  || 0;
    if (maxSell > 0 && minSell > maxSell) { notify("Le minimum ne peut pas dépasser le maximum", "error"); return; }
    if (maxSell > 0 && maxSell > reserve && reserve > 0) { /* allow */ }
    const patch: any = {
      sellerStatus: form.sellerStatus,
      sellerLimits: { reserve, maxSell: Math.min(maxSell, reserve > 0 ? reserve : maxSell), minSell: Math.min(minSell, maxSell > 0 ? maxSell : minSell) },
    };
    if (form.newPassword.trim()) patch.password = form.newPassword.trim();
    onSave(acc.id, patch);
    notify(`${acc.name} mis à jour. ✅`);
    onClose();
  };

  const reserve = parseFloat(form.reserve) || 0;

  return (
    <Modal onClose={onClose}>
      <h3 style={{ fontSize:18, fontWeight:800, marginBottom:4, color:C.text }}>⚙️ Gestion du vendeur</h3>
      <p style={{ color:C.muted, fontSize:13, marginBottom:22 }}>{acc.name} — {acc.email}</p>

      {/* Statut */}
      <div style={{ marginBottom:20 }}>
        <label style={st.label}>Statut du compte vendeur</label>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {(["active","restricted","blocked"] as const).map(s => (
            <button key={s} onClick={() => setForm({...form, sellerStatus:s})}
              style={{ ...st.btn(form.sellerStatus===s?"primary":s==="blocked"?"red":"secondary","sm"), opacity:1 }}>
              {s==="active"?"✅ Actif":s==="restricted"?"⚠️ Restreint":"🚫 Bloqué"}
            </button>
          ))}
        </div>
      </div>

      {/* Réserve & Limites — tout en $ */}
      <div style={{ background:"rgba(6,182,212,0.07)", border:"1px solid rgba(6,182,212,0.2)", borderRadius:14, padding:18, marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:C.cyan }}>🔒 Réserve & Limites ($)</div>
        <p style={{ color:C.muted, fontSize:12, marginBottom:14, lineHeight:1.6 }}>
          La réserve bloquée sert de garantie. Le maximum de vente ne peut pas dépasser la réserve définie.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ ...st.label, color:C.gold }}>Réserve bloquée ($) *</label>
            <input style={st.input} type="number" min="0" placeholder="Ex: 200" value={form.reserve}
              onChange={e => setForm({...form, reserve:e.target.value})} />
            <p style={{ color:C.muted, fontSize:11, marginTop:4 }}>Cette réserve couvre les remboursements en cas de litige.</p>
          </div>
          <div>
            <label style={st.label}>Vente minimum ($)</label>
            <input style={st.input} type="number" min="0"
              placeholder={`Ex: 10`}
              value={form.minSell}
              onChange={e => {
                const v = parseFloat(e.target.value) || 0;
                const max = parseFloat(form.maxSell) || 0;
                if (max > 0 && v > max) return;
                setForm({...form, minSell:e.target.value});
              }} />
          </div>
          <div>
            <label style={st.label}>Vente maximum ($)</label>
            <input style={st.input} type="number" min="0"
              placeholder={reserve > 0 ? `Max: ${reserve}` : "Ex: 500"}
              value={form.maxSell}
              onChange={e => {
                const v = parseFloat(e.target.value) || 0;
                if (reserve > 0 && v > reserve) { notify(`Le maximum ne peut pas dépasser la réserve ($${reserve})`, "error"); return; }
                setForm({...form, maxSell:e.target.value});
              }} />
            {reserve > 0 && <p style={{ color:C.gold, fontSize:11, marginTop:4 }}>⚠️ Max autorisé : ${reserve} (= réserve)</p>}
          </div>
        </div>
      </div>

      {/* Mot de passe */}
      <div style={{ background:"rgba(139,92,246,0.07)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:14, padding:18, marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#a78bfa" }}>🔑 Gestion du mot de passe</div>
        <div style={{ marginBottom:12 }}>
          <label style={st.label}>Mot de passe actuel</label>
          <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:10, padding:"11px 14px", color:C.text, fontSize:14, fontFamily:"monospace", letterSpacing:2 }}>
            {showPw ? (acc.password || "non défini") : "••••••••"}
            <button onClick={() => setShowPw(!showPw)} style={{ float:"right", background:"transparent", border:"none", cursor:"pointer", color:C.muted, fontSize:12 }}>
              {showPw ? "🙈 Masquer" : "👁 Voir"}
            </button>
          </div>
        </div>
        <div>
          <label style={st.label}>Nouveau mot de passe (laisser vide pour ne pas changer)</label>
          <input style={st.input} type="text" placeholder="Nouveau mot de passe..." value={form.newPassword}
            onChange={e => setForm({...form, newPassword:e.target.value})} />
        </div>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <button onClick={save} style={{ ...st.btn("primary"), flex:1, justifyContent:"center" }}>💾 Sauvegarder</button>
        <button onClick={onClose} style={{ ...st.btn("secondary"), flex:1, justifyContent:"center" }}>Annuler</button>
      </div>
    </Modal>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function CryptoAdminPanelPage({ navigate, user, onLogout, offers, setOffers, orders, setOrders, accounts, setAccounts, promoteToSeller, notify, updateAccount }: any) {
  const st = makeStyles();
  const [pinOk, setPinOk] = useState(false);
  const [active, setActive] = useState("overview");
  const [editSellerId, setEditSellerId] = useState<string|null>(null);

  if (!pinOk) return <AdminPinGate onSuccess={() => setPinOk(true)} />;

  const sellers = accounts.filter((a: any) => a.isSeller && !a.isAdmin);
  const buyers  = accounts.filter((a: any) => !a.isAdmin && !a.isSeller);

  const menu = [
    { id:"overview", label:"Vue d'ensemble",    icon:"📊", badge:0 },
    { id:"users",    label:"Utilisateurs",        icon:"👥", badge:buyers.length },
    { id:"sellers",  label:"Gérer les vendeurs",  icon:"🏪", badge:0 },
    { id:"orders",   label:"Toutes les commandes",icon:"📦", badge:0 },
    { id:"offers",   label:"Toutes les annonces", icon:"🏷️", badge:0 },
  ];
  const titles: any = { overview:"Vue d'ensemble", users:"Utilisateurs", sellers:"Gestion des vendeurs ($)", orders:"Commandes ($)", offers:"Annonces" };

  const updateAcc = (id: string, patch: any) =>
    setAccounts((prev: any[]) => prev.map((a: any) => a.id === id ? { ...a, ...patch } : a));

  const fmtUSD = (fcfa: number) => `$${(fcfa / 615).toFixed(2)}`;

  const editSeller = editSellerId ? accounts.find((a: any) => a.id === editSellerId) : null;

  // Stats
  const totalVolume = orders.reduce((s: number, o: any) => s + (o.totalFCFA || 0), 0);

  return (
    <>
      {editSeller && (
        <EditSellerModal
          acc={editSeller}
          onSave={updateAcc}
          onClose={() => setEditSellerId(null)}
          notify={notify}
        />
      )}

      <SidebarLayout user={user} onLogout={onLogout} navigate={navigate} active={active} setActive={setActive} menu={menu} title={titles[active] || "Administration"}>

        {/* ── STATS GLOBALES ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:28 }}>
          {[
            { l:"Utilisateurs", v:accounts.length - 1,   i:"👥", col:C.purple },
            { l:"Vendeurs",     v:sellers.length,          i:"🏪", col:C.green  },
            { l:"Commandes",    v:orders.length,           i:"📦", col:C.blue   },
            { l:"Annonces",     v:offers.length,           i:"🏷️", col:C.gold   },
            { l:"Volume total", v:fmtUSD(totalVolume),     i:"💵", col:C.cyan   },
          ].map(stat => (
            <div key={stat.l} style={{ background:C.bgCard, borderLeft:`3px solid ${stat.col}`, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{stat.i}</div>
              <div style={{ fontSize:typeof stat.v === "number" ? 22 : 15, fontWeight:900, color:stat.col }}>{stat.v}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{stat.l}</div>
            </div>
          ))}
        </div>

        {/* ── VUE D'ENSEMBLE ── */}
        {active === "overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
              <h3 style={{ fontWeight:700, marginBottom:16, fontSize:15, color:C.text }}>🏪 Vendeurs actifs</h3>
              {sellers.length === 0
                ? <p style={{ color:C.muted, fontSize:13 }}>Aucun vendeur</p>
                : sellers.slice(0, 5).map((s: any) => {
                    const ss = SELLER_STATUS[s.sellerStatus] || SELLER_STATUS.active;
                    return (
                      <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                        <span style={{ fontSize:13, color:C.text, fontWeight:600 }}>{s.name}</span>
                        <span style={{ background:ss.bg, color:ss.color, padding:"2px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>{ss.label}</span>
                      </div>
                    );
                  })
              }
            </div>
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
              <h3 style={{ fontWeight:700, marginBottom:16, fontSize:15, color:C.text }}>🏷️ Cryptos en vente</h3>
              {CRYPTOS.map(cr => {
                const count = offers.filter((o: any) => o.crypto === cr.id).length;
                return (
                  <div key={cr.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.text }}>
                      <span style={{ color:cr.color, fontSize:16 }}>{cr.icon}</span>{cr.name}
                    </span>
                    <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{count} annonce{count !== 1 ? "s" : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── UTILISATEURS / ACHETEURS ── */}
        {active === "users" && (
          <div>
            <div style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:20, fontSize:13, color:C.muted }}>
              Promouvez un utilisateur en vendeur pour lui permettre de publier des annonces.
            </div>
            {buyers.length === 0
              ? <div style={{ textAlign:"center", padding:"40px 0", color:C.muted }}><div style={{ fontSize:40, marginBottom:10 }}>👤</div><p>Aucun utilisateur acheteur</p></div>
              : buyers.map((acc: any) => (
                <div key={acc.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18, marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#0f2035,#1e3a5f)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.gold, fontSize:16, overflow:"hidden", flexShrink:0 }}>
                      {acc.avatar ? <img src={acc.avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : acc.name?.[0]}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{acc.name}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{acc.email}</div>
                      {acc.whatsapp && <div style={{ fontSize:12, color:C.green }}>📱 {acc.whatsapp}</div>}
                    </div>
                    <button onClick={() => { promoteToSeller(acc.id); notify(`${acc.name} promu vendeur ! ✅`); }}
                      style={st.btn("green","sm")}>🏪 Promouvoir vendeur</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── GESTION DES VENDEURS ── */}
        {active === "sellers" && (
          <div>
            {sellers.length === 0
              ? <div style={{ textAlign:"center", padding:"40px 0", color:C.muted }}><div style={{ fontSize:40, marginBottom:10 }}>🏪</div><p>Aucun vendeur</p></div>
              : sellers.map((acc: any) => {
                  const ss = SELLER_STATUS[acc.sellerStatus] || SELLER_STATUS.active;
                  const limits = acc.sellerLimits || { reserve:0, maxSell:0, minSell:0 };
                  return (
                    <div key={acc.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18, marginBottom:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                        <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#0f2035,#1e3a5f)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.gold, fontSize:16, overflow:"hidden", flexShrink:0 }}>
                          {acc.avatar ? <img src={acc.avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : acc.name?.[0]}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{acc.name}</div>
                          <div style={{ fontSize:12, color:C.muted }}>{acc.email}</div>
                          {/* Limites en $ */}
                          <div style={{ display:"flex", gap:12, marginTop:5, flexWrap:"wrap" }}>
                            {limits.reserve > 0 && <span style={{ fontSize:11, color:C.gold }}>Réserve : <strong>${limits.reserve}</strong></span>}
                            {limits.minSell > 0 && <span style={{ fontSize:11, color:C.muted }}>Min : <strong>${limits.minSell}</strong></span>}
                            {limits.maxSell > 0 && <span style={{ fontSize:11, color:C.muted }}>Max : <strong>${limits.maxSell}</strong></span>}
                          </div>
                          {acc.allowedCountries?.length > 0 && (
                            <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>
                              🌍 Pays : {acc.allowedCountries.join(", ")}
                            </div>
                          )}
                        </div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                          <span style={{ background:ss.bg, color:ss.color, padding:"4px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>{ss.label}</span>
                          <button onClick={() => setEditSellerId(acc.id)} style={st.btn("cyan","sm")}>⚙️ Gérer</button>
                          {acc.sellerStatus !== "blocked" && (
                            <button onClick={() => { updateAcc(acc.id, {sellerStatus:"blocked"}); notify(`${acc.name} bloqué.`, "error"); }}
                              style={st.btn("red","sm")}>🚫 Bloquer</button>
                          )}
                          {acc.sellerStatus === "blocked" && (
                            <button onClick={() => { updateAcc(acc.id, {sellerStatus:"active"}); notify(`${acc.name} débloqué. ✅`); }}
                              style={st.btn("green","sm")}>✅ Débloquer</button>
                          )}
                          {acc.sellerStatus !== "restricted" && acc.sellerStatus !== "blocked" && (
                            <button onClick={() => { updateAcc(acc.id, {sellerStatus:"restricted"}); notify(`${acc.name} restreint.`, "error"); }}
                              style={st.btn("secondary","sm")}>⚠️ Restreindre</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ── COMMANDES — montants en $ ── */}
        {active === "orders" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {orders.length === 0
              ? <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}><div style={{ fontSize:48, marginBottom:12 }}>📭</div><p>Aucune commande</p></div>
              : orders.map((order: any) => {
                  const cr2 = getCr(order.crypto);
                  const statusMap: any = {
                    pending:   { label:"En attente",     color:C.gold,   bg:"rgba(245,158,11,0.15)"  },
                    paid:      { label:"Paiement déclaré",color:C.blue,  bg:"rgba(59,130,246,0.15)"  },
                    confirmed: { label:"Confirmé",        color:C.green,  bg:"rgba(16,185,129,0.15)"  },
                    disputed:  { label:"Litige",          color:C.red,    bg:"rgba(239,68,68,0.15)"   },
                  };
                  const status = statusMap[order.status] || statusMap.paid;
                  return (
                    <div key={order.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, fontSize:13, color:C.gold, flex:"0 0 105px" }}>{order.id}</span>
                        <div style={{ flex:"1 1 120px" }}>
                          <div style={{ color:cr2.color }}>{cr2.icon} {order.amount} {cr2.symbol}</div>
                          <div style={{ fontSize:12, color:C.muted }}>{fmtUSD(order.totalFCFA || order.amountFCFA)}</div>
                        </div>
                        <div style={{ flex:"1 1 140px", fontSize:12.5, color:C.muted }}>
                          <div>Acheteur : <strong style={{ color:C.text }}>{order.buyerName}</strong></div>
                          <div>Vendeur : <strong style={{ color:C.text }}>{order.seller}</strong></div>
                          {order.buyerWhatsapp && <div style={{ color:C.green }}>📱 {order.buyerWhatsapp}</div>}
                          {order.buyerCountry && <div style={{ color:C.muted }}>🌍 {order.buyerCountry}</div>}
                        </div>
                        <span style={{ background:status.bg, color:status.color, padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>{status.label}</span>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ── ANNONCES ── */}
        {active === "offers" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {offers.length === 0
              ? <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}><div style={{ fontSize:48, marginBottom:12 }}>🏷️</div><p>Aucune annonce</p></div>
              : offers.map((offer: any) => {
                  const cr2 = getCr(offer.crypto);
                  return (
                    <div key={offer.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                        <div style={{ flex:"1 1 140px", display:"flex", alignItems:"center", gap:10 }}>
                          <span style={{ color:cr2.color, fontSize:22 }}>{cr2.icon}</span>
                          <div>
                            <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{cr2.name}</div>
                            <div style={{ fontSize:11, color:C.muted }}>{cr2.network}</div>
                          </div>
                        </div>
                        <div style={{ flex:"1 1 120px" }}>
                          {/* Taux en $ côté admin */}
                          <div style={{ fontWeight:800, fontSize:16, color:C.gold }}>{fmtUSD(offer.rate)} /unité</div>
                          <div style={{ fontSize:12, color:C.muted }}>Dispo : {fmtUSD(offer.available * offer.rate)}</div>
                          {offer.networkFee > 0 && <div style={{ fontSize:12, color:C.gold }}>+{fmtUSD(offer.networkFee)} frais réseau</div>}
                        </div>
                        <div style={{ flex:"1 1 120px", fontSize:13, color:C.muted }}>
                          Vendeur : <strong style={{ color:C.text }}>{offer.sellerName}</strong>
                          {offer.allowedCountries?.length > 0 && (
                            <div style={{ fontSize:11, marginTop:3 }}>🌍 {offer.allowedCountries.join(", ")}</div>
                          )}
                        </div>
                        <div style={{ flex:"1 1 140px", fontSize:12, color:C.muted }}>
                          Min : {fmtUSD(offer.minAmount * offer.rate)} / Max : {fmtUSD(offer.maxAmount * offer.rate)}
                        </div>
                        <button onClick={() => { setOffers(offers.filter((o: any) => o.id !== offer.id)); notify("Annonce supprimée."); }}
                          style={st.btn("danger","sm")}>🗑 Supprimer</button>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        
      </SidebarLayout>
    </>
  );
}
