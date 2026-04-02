import { useState } from "react";
import { C, CRYPTOS, getCr, fmt, makeStyles, STATUS, SELLER_STATUS } from "./crypto-constants";
import { SidebarLayout } from "./CryptoSharedComponents";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface SellerLimits {
  reserve: number;           // Dépôt de garantie en FCFA
  maxSell: number;           // Vente max par transaction (FCFA)
  minSell: number;           // Vente min par transaction (FCFA)
  dailyLimit: number;        // Plafond journalier (FCFA)
  allowedCryptos: string[];  // Cryptos autorisées à vendre
  expiresAt: string | null;  // Date expiration compte vendeur (ISO)
  activeDays: number;        // Durée activation en jours
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmtDate = (d: string | null): string =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const daysLeft = (expiresAt: string | null): number | null => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
};

const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const DEFAULT_LIMITS: SellerLimits = {
  reserve: 0,
  maxSell: 500000,
  minSell: 5000,
  dailyLimit: 2000000,
  allowedCryptos: [],
  expiresAt: null,
  activeDays: 30,
};

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function CryptoAdminPanelPage({
  navigate, user, onLogout,
  offers, setOffers,
  orders, setOrders,
  accounts, setAccounts,
  promoteToSeller, notify, updateAccount,
}: any) {
  const st = makeStyles();
  const [active, setActive] = useState("overview");

  // Modales
  const [sellerModal,   setSellerModal]   = useState<any | null>(null);
  const [promoteModal,  setPromoteModal]  = useState<any | null>(null);
  const [disputeModal,  setDisputeModal]  = useState<any | null>(null);
  const [passwordModal, setPasswordModal] = useState<any | null>(null);

  // Données filtrées — aucune donnée par défaut, tout vient des props
  const disputes = orders.filter((o: any) => o.status === "disputed");
  const buyers   = accounts.filter((a: any) => !a.isAdmin && !a.isSeller);
  const sellers  = accounts.filter((a: any) => a.isSeller && !a.isAdmin);

  const menu = [
    { id: "overview",  label: "Vue d'ensemble",      icon: "📊", badge: 0 },
    { id: "users",     label: "Utilisateurs",         icon: "👥", badge: buyers.length },
    { id: "sellers",   label: "Vendeurs",             icon: "🏪", badge: 0 },
    { id: "orders",    label: "Toutes les commandes", icon: "📦", badge: 0 },
    { id: "disputes",  label: "Litiges",              icon: "⚠️", badge: disputes.length },
    { id: "offers",    label: "Toutes les annonces",  icon: "🏷️", badge: 0 },
  ];

  const titles: Record<string, string> = {
    overview: "Vue d'ensemble",
    users: "Utilisateurs — Activer comme Annonceur",
    sellers: "Gestion des Vendeurs",
    orders: "Toutes les Commandes",
    disputes: "Litiges & Transfert de Fonds",
    offers: "Annonces P2P",
  };

  const updateAcc = (id: string, patch: any) =>
    setAccounts((prev: any[]) => prev.map((a: any) => a.id === id ? { ...a, ...patch } : a));

  // ── MODAL : PROMOUVOIR UN ACHETEUR EN VENDEUR ──────────────────────────────
  const PromoteModal = () => {
    const acc = promoteModal;
    const [form, setForm] = useState<SellerLimits>({
      ...DEFAULT_LIMITS,
      allowedCryptos: CRYPTOS.map((c) => c.id),
      activeDays: 30,
    });
    const [showPwd, setShowPwd] = useState(false);

    const activate = () => {
      const expiresAt = addDays(form.activeDays);
      updateAcc(acc.id, {
        isSeller: true,
        sellerStatus: "active",
        sellerLimits: { ...form, expiresAt },
        sellerActivatedAt: new Date().toISOString(),
      });
      promoteToSeller(acc.id);
      setPromoteModal(null);
      notify(`✅ ${acc.name} activé comme annonceur pour ${form.activeDays} jours. Dépôt de garantie : ${fmt(form.reserve)} FCFA`);
    };

    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, width: "100%", maxWidth: 540, maxHeight: "92vh", overflowY: "auto" }}>

          {/* En-tête */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏪</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, color: C.text }}>Activer comme Annonceur</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{acc.name} — {acc.email}</div>
            </div>
          </div>

          {/* Mot de passe */}
          {acc.password && (
            <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>🔑 MOT DE PASSE DU COMPTE</div>
                  <div style={{ color: C.text, fontSize: 15, fontWeight: 700, letterSpacing: showPwd ? 1 : 3 }}>
                    {showPwd ? acc.password : "••••••••"}
                  </div>
                </div>
                <button
                  onClick={() => setShowPwd((p) => !p)}
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", color: C.muted, cursor: "pointer", fontSize: 12 }}
                >
                  {showPwd ? "🙈 Masquer" : "👁 Voir"}
                </button>
              </div>
            </div>
          )}

          {/* Dépôt de garantie */}
          <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#ef4444", marginBottom: 4 }}>🔒 Dépôt de Garantie (FCFA)</div>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>
              Montant déposé par le vendeur. En cas de litige non résolu, ce fonds sera transféré à l'acheteur lésé.
            </div>
            <input
              type="number"
              value={form.reserve}
              onChange={(e) => setForm({ ...form, reserve: parseFloat(e.target.value) || 0 })}
              placeholder="Ex: 50000"
              style={{ ...st.input, fontSize: 16, fontWeight: 700 }}
            />
            <div style={{ color: C.muted, fontSize: 11, marginTop: 6 }}>
              ≈ ${((form.reserve || 0) / 615).toFixed(2)} USD
            </div>
          </div>

          {/* Durée d'activation */}
          <div style={{ marginBottom: 16 }}>
            <label style={st.label}>⏱ Durée d'activation (jours)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {[7, 14, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setForm({ ...form, activeDays: d })}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none",
                    background: form.activeDays === d ? C.gold : "rgba(255,255,255,0.06)",
                    color: form.activeDays === d ? "#000" : C.muted,
                  }}
                >
                  {d}j
                </button>
              ))}
            </div>
            <input
              type="number"
              value={form.activeDays}
              onChange={(e) => setForm({ ...form, activeDays: parseInt(e.target.value) || 30 })}
              style={st.input}
              placeholder="Nombre de jours personnalisé"
            />
            <div style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>
              Expire le : <strong style={{ color: C.text }}>{fmtDate(addDays(form.activeDays))}</strong>
            </div>
          </div>

          {/* Limites de vente */}
          <div style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.cyan, marginBottom: 14 }}>📊 Limites de Vente (FCFA)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={st.label}>Vente minimum</label>
                <input type="number" value={form.minSell} onChange={(e) => setForm({ ...form, minSell: parseFloat(e.target.value) || 0 })} style={st.input} placeholder="Ex: 5000" />
              </div>
              <div>
                <label style={st.label}>Vente maximum</label>
                <input type="number" value={form.maxSell} onChange={(e) => setForm({ ...form, maxSell: parseFloat(e.target.value) || 0 })} style={st.input} placeholder="Ex: 500000" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={st.label}>Plafond journalier</label>
                <input type="number" value={form.dailyLimit} onChange={(e) => setForm({ ...form, dailyLimit: parseFloat(e.target.value) || 0 })} style={st.input} placeholder="Ex: 2000000" />
              </div>
            </div>
          </div>

          {/* Cryptos autorisées */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ ...st.label, marginBottom: 10 }}>₿ Cryptomonnaies autorisées à vendre</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CRYPTOS.map((cr) => {
                const on = form.allowedCryptos.includes(cr.id);
                return (
                  <button
                    key={cr.id}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        allowedCryptos: on
                          ? f.allowedCryptos.filter((c) => c !== cr.id)
                          : [...f.allowedCryptos, cr.id],
                      }))
                    }
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 12px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${on ? cr.color : C.border}`,
                      background: on ? `${cr.color}22` : "transparent",
                      color: on ? cr.color : C.muted,
                    }}
                  >
                    <span>{cr.icon}</span> {cr.symbol}
                    {on && <span style={{ fontSize: 10 }}>✓</span>}
                  </button>
                );
              })}
            </div>
            {form.allowedCryptos.length === 0 && (
              <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>⚠ Sélectionnez au moins une crypto</div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={activate}
              disabled={form.allowedCryptos.length === 0}
              style={{
                flex: 1, padding: "13px", borderRadius: 12, border: "none",
                cursor: form.allowedCryptos.length === 0 ? "not-allowed" : "pointer",
                background: form.allowedCryptos.length === 0 ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#10b981,#059669)",
                color: form.allowedCryptos.length === 0 ? C.muted : "#fff",
                fontWeight: 800, fontSize: 14,
              }}
            >
              ✅ Activer le compte Annonceur
            </button>
            <button
              onClick={() => setPromoteModal(null)}
              style={{ padding: "13px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── MODAL : GÉRER UN VENDEUR EXISTANT ─────────────────────────────────────
  const SellerModal = () => {
    const acc = sellerModal;
    if (!acc) return null;
    const limits: SellerLimits = acc.sellerLimits || DEFAULT_LIMITS;
    const [form, setForm] = useState<SellerLimits>({
      ...DEFAULT_LIMITS,
      ...limits,
      allowedCryptos: limits.allowedCryptos?.length ? limits.allowedCryptos : CRYPTOS.map((c) => c.id),
    });
    const [showPwd, setShowPwd] = useState(false);
    const [sellerStatus, setSellerStatus] = useState<"active" | "restricted" | "blocked">(acc.sellerStatus || "active");
    const [extendDays, setExtendDays] = useState(30);

    const days = daysLeft(form.expiresAt);
    const isExpired = days !== null && days <= 0;

    const save = () => {
      updateAcc(acc.id, { sellerStatus, sellerLimits: form });
      setSellerModal(null);
      notify(`✅ ${acc.name} mis à jour.`);
    };

    const extendAccount = () => {
      const newExpiry = addDays(extendDays);
      const updated = { ...form, expiresAt: newExpiry };
      setForm(updated);
      updateAcc(acc.id, { sellerStatus: "active", sellerLimits: updated });
      notify(`✅ Compte de ${acc.name} prolongé de ${extendDays} jours.`);
    };

    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#0f2035,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.gold, fontSize: 20 }}>
              {acc.name?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, color: C.text }}>{acc.name}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{acc.email}</div>
            </div>
          </div>

          {/* Mot de passe */}
          {acc.password && (
            <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>🔑 MOT DE PASSE DU COMPTE</div>
                  <div style={{ color: C.text, fontSize: 16, fontWeight: 800, letterSpacing: showPwd ? 1 : 4 }}>
                    {showPwd ? acc.password : "••••••••"}
                  </div>
                </div>
                <button
                  onClick={() => setShowPwd((p) => !p)}
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 13px", color: C.muted, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                >
                  {showPwd ? "🙈 Masquer" : "👁 Voir"}
                </button>
              </div>
            </div>
          )}

          {/* Expiration */}
          <div
            style={{
              background: isExpired ? "rgba(239,68,68,0.1)" : days !== null && days <= 7 ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.07)",
              border: `1px solid ${isExpired ? "rgba(239,68,68,0.3)" : days !== null && days <= 7 ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.2)"}`,
              borderRadius: 12, padding: 14, marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isExpired ? "#ef4444" : days !== null && days <= 7 ? C.gold : C.green, marginBottom: 4 }}>
                  {isExpired ? "⛔ COMPTE EXPIRÉ" : days !== null && days <= 7 ? "⚠️ EXPIRE BIENTÔT" : "✅ COMPTE ACTIF"}
                </div>
                <div style={{ color: C.text, fontSize: 13 }}>
                  {form.expiresAt ? `Expire le ${fmtDate(form.expiresAt)}` : "Pas de limite de durée"}
                  {days !== null && !isExpired && (
                    <span style={{ color: C.muted, fontSize: 12 }}> ({days} jour{days > 1 ? "s" : ""} restant{days > 1 ? "s" : ""})</span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: C.muted, fontSize: 13 }}>Prolonger de :</span>
              {[7, 14, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setExtendDays(d)}
                  style={{ padding: "5px 11px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: extendDays === d ? C.gold : "rgba(255,255,255,0.08)", color: extendDays === d ? "#000" : C.muted }}
                >
                  +{d}j
                </button>
              ))}
              <button
                onClick={extendAccount}
                style={{ padding: "7px 16px", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer", border: "none", background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff" }}
              >
                ✓ Appliquer
              </button>
            </div>
          </div>

          {/* Dépôt de garantie */}
          <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#ef4444", marginBottom: 6 }}>🔒 Dépôt de Garantie</div>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>
              En cas de litige non résolu, ce montant sera transféré à l'acheteur lésé.
            </div>
            <input type="number" value={form.reserve} onChange={(e) => setForm({ ...form, reserve: parseFloat(e.target.value) || 0 })} style={st.input} placeholder="Ex: 50000 FCFA" />
            <div style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>
              Actuellement : <strong style={{ color: C.gold }}>{fmt(form.reserve)} FCFA</strong> (≈ ${(form.reserve / 615).toFixed(2)})
            </div>
          </div>

          {/* Statut vendeur */}
          <div style={{ marginBottom: 16 }}>
            <label style={st.label}>Statut du compte</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["active", "restricted", "blocked"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSellerStatus(s)}
                  style={{
                    padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    border: `1px solid ${sellerStatus === s ? (s === "active" ? C.green : s === "restricted" ? C.gold : "#ef4444") : C.border}`,
                    background: sellerStatus === s ? (s === "active" ? "rgba(16,185,129,0.15)" : s === "restricted" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)") : "transparent",
                    color: sellerStatus === s ? (s === "active" ? C.green : s === "restricted" ? C.gold : "#ef4444") : C.muted,
                  }}
                >
                  {s === "active" ? "✅ Actif" : s === "restricted" ? "⚠️ Restreint" : "🚫 Bloqué"}
                </button>
              ))}
            </div>
          </div>

          {/* Limites */}
          <div style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.cyan, marginBottom: 14 }}>📊 Limites de Vente (FCFA)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={st.label}>Minimum par vente</label>
                <input type="number" value={form.minSell} onChange={(e) => setForm({ ...form, minSell: parseFloat(e.target.value) || 0 })} style={st.input} />
              </div>
              <div>
                <label style={st.label}>Maximum par vente</label>
                <input type="number" value={form.maxSell} onChange={(e) => setForm({ ...form, maxSell: parseFloat(e.target.value) || 0 })} style={st.input} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={st.label}>Plafond journalier</label>
                <input type="number" value={form.dailyLimit} onChange={(e) => setForm({ ...form, dailyLimit: parseFloat(e.target.value) || 0 })} style={st.input} />
              </div>
            </div>
          </div>

          {/* Cryptos autorisées */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ ...st.label, marginBottom: 10 }}>₿ Cryptos autorisées</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CRYPTOS.map((cr) => {
                const on = form.allowedCryptos?.includes(cr.id);
                return (
                  <button
                    key={cr.id}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        allowedCryptos: on
                          ? (f.allowedCryptos || []).filter((c) => c !== cr.id)
                          : [...(f.allowedCryptos || []), cr.id],
                      }))
                    }
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 12px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${on ? cr.color : C.border}`,
                      background: on ? `${cr.color}22` : "transparent",
                      color: on ? cr.color : C.muted,
                    }}
                  >
                    <span>{cr.icon}</span> {cr.symbol}
                    {on && <span style={{ fontSize: 10 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={save}
              style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", fontWeight: 800, fontSize: 14 }}
            >
              💾 Sauvegarder
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Supprimer le compte vendeur de ${acc.name} ?`)) {
                  updateAcc(acc.id, { isSeller: false, sellerStatus: null, sellerLimits: null });
                  setSellerModal(null);
                  notify(`${acc.name} retiré des vendeurs.`);
                }
              }}
              style={{ padding: "13px 18px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer", background: "rgba(239,68,68,0.12)", color: "#ef4444", fontWeight: 700, fontSize: 13 }}
            >
              🗑 Révoquer
            </button>
            <button
              onClick={() => setSellerModal(null)}
              style={{ padding: "13px 18px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── MODAL : RÉSOLUTION LITIGE + TRANSFERT FONDS ───────────────────────────
  const DisputeModal = () => {
    const order = disputeModal;
    if (!order) return null;
    const cr = getCr(order.crypto);
    const seller = accounts.find((a: any) => a.id === order.sellerId);
    const sellerReserve: number = seller?.sellerLimits?.reserve || 0;
    const [favor, setFavor] = useState<"buyer" | "seller" | null>(null);
    const [transferAmount, setTransferAmount] = useState<number>(order.amountFCFA || order.totalFCFA || 0);
    const [note, setNote] = useState("");

    const resolve = () => {
      if (!favor) return;
      if (favor === "buyer") {
        if (seller) {
          const newReserve = Math.max(0, sellerReserve - transferAmount);
          updateAcc(seller.id, { sellerLimits: { ...seller.sellerLimits, reserve: newReserve } });
        }
        setOrders((prev: any[]) => prev.map((o: any) => o.id === order.id ? { ...o, status: "refunded", disputeNote: note } : o));
        notify(`✅ Litige résolu — ${fmt(transferAmount)} FCFA transféré à l'acheteur depuis le dépôt du vendeur.`);
      } else {
        setOrders((prev: any[]) => prev.map((o: any) => o.id === order.id ? { ...o, status: "confirmed", disputeNote: note } : o));
        notify(`✅ Litige résolu en faveur du vendeur.`);
      }
      setDisputeModal(null);
    };

    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: C.bgCard, border: "1px solid rgba(239,68,68,0.4)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto" }}>

          <div style={{ fontWeight: 900, fontSize: 17, color: C.text, marginBottom: 6 }}>⚖️ Résolution de Litige</div>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 22 }}>Commande {order.id} — {order.amount} {cr.symbol}</div>

          {/* Parties */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 12, padding: 14 }}>
              <div style={{ color: C.blue, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>👤 ACHETEUR</div>
              <div style={{ color: C.text, fontWeight: 700 }}>{order.buyerName}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>A payé {fmt(order.totalFCFA || order.amountFCFA)} FCFA</div>
              <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>N'a pas reçu la crypto</div>
            </div>
            <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 12, padding: 14 }}>
              <div style={{ color: C.purple, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>🏪 VENDEUR</div>
              <div style={{ color: C.text, fontWeight: 700 }}>{order.seller || seller?.name || "—"}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>Dépôt de garantie</div>
              <div style={{ color: C.gold, fontSize: 13, fontWeight: 800, marginTop: 4 }}>{fmt(sellerReserve)} FCFA</div>
            </div>
          </div>

          {/* Choix résolution */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ ...st.label, marginBottom: 12 }}>Résoudre en faveur de :</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => setFavor("buyer")}
                style={{
                  padding: 14, borderRadius: 12, textAlign: "left", cursor: "pointer", fontSize: 14, fontWeight: 700,
                  border: `2px solid ${favor === "buyer" ? C.blue : C.border}`,
                  background: favor === "buyer" ? "rgba(59,130,246,0.12)" : "transparent",
                  color: favor === "buyer" ? C.blue : C.muted,
                }}
              >
                <div>👤 Acheteur — Rembourser + Transférer fonds</div>
                <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4, color: C.muted }}>
                  Le dépôt de garantie du vendeur sera déduit et remis à l'acheteur.
                </div>
              </button>
              <button
                onClick={() => setFavor("seller")}
                style={{
                  padding: 14, borderRadius: 12, textAlign: "left", cursor: "pointer", fontSize: 14, fontWeight: 700,
                  border: `2px solid ${favor === "seller" ? C.purple : C.border}`,
                  background: favor === "seller" ? "rgba(139,92,246,0.12)" : "transparent",
                  color: favor === "seller" ? C.purple : C.muted,
                }}
              >
                <div>🏪 Vendeur — Transaction confirmée</div>
                <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4, color: C.muted }}>
                  La crypto a bien été envoyée. Litige rejeté.
                </div>
              </button>
            </div>
          </div>

          {/* Montant à transférer (si faveur acheteur) */}
          {favor === "buyer" && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <label style={{ ...st.label, color: "#ef4444" }}>💸 Montant à transférer depuis le dépôt (FCFA)</label>
              <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(parseFloat(e.target.value) || 0)} style={{ ...st.input, fontWeight: 800 }} />
              {transferAmount > sellerReserve && (
                <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>
                  ⚠ Montant supérieur au dépôt disponible ({fmt(sellerReserve)} FCFA)
                </div>
              )}
              <div style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>
                Dépôt restant après transfert :{" "}
                <strong style={{ color: Math.max(0, sellerReserve - transferAmount) === 0 ? "#ef4444" : C.green }}>
                  {fmt(Math.max(0, sellerReserve - transferAmount))} FCFA
                </strong>
              </div>
            </div>
          )}

          {/* Note admin */}
          <div style={{ marginBottom: 20 }}>
            <label style={st.label}>📝 Note de résolution (optionnel)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Vendeur n'a pas fourni de preuve d'envoi..."
              rows={3}
              style={{ ...st.input, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={resolve}
              disabled={!favor}
              style={{
                flex: 1, padding: "13px", borderRadius: 12, border: "none", fontWeight: 800, fontSize: 14,
                cursor: favor ? "pointer" : "not-allowed",
                background: !favor ? "rgba(255,255,255,0.06)" : favor === "buyer" ? "linear-gradient(135deg,#3b82f6,#1d4ed8)" : "linear-gradient(135deg,#8b5cf6,#6d28d9)",
                color: !favor ? C.muted : "#fff",
              }}
            >
              ✅ Confirmer la résolution
            </button>
            <button
              onClick={() => setDisputeModal(null)}
              style={{ padding: "13px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── CARD helper ───────────────────────────────────────────────────────────
  const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, ...style }}>{children}</div>
  );

  const fmtUSD = (fcfa: number) => `$${(fcfa / 615).toFixed(2)}`;

  // ── RENDU ──────────────────────────────────────────────────────────────────
  return (
    <>
      {promoteModal && <PromoteModal />}
      {sellerModal  && <SellerModal  />}
      {disputeModal && <DisputeModal />}

      <SidebarLayout
        user={user} onLogout={onLogout} navigate={navigate}
        active={active} setActive={setActive}
        menu={menu} title={titles[active] || "Administration"}
      >

        {/* ── OVERVIEW ────────────────────────────────────────────────────── */}
        {active === "overview" && (
          <>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { l: "Utilisateurs",    v: accounts.filter((a: any) => !a.isAdmin).length,                                                          i: "👥", col: C.purple },
                { l: "Vendeurs actifs", v: sellers.filter((a: any) => a.sellerStatus === "active").length,                                          i: "🏪", col: C.green  },
                { l: "Commandes",       v: orders.length,                                                                                            i: "📦", col: C.blue   },
                { l: "Annonces",        v: offers.length,                                                                                            i: "🏷️", col: C.gold   },
                { l: "Litiges",         v: disputes.length,                                                                                          i: "⚠️", col: C.red    },
                { l: "Dépôts totaux",   v: `${fmt(sellers.reduce((s: number, a: any) => s + (a.sellerLimits?.reserve || 0), 0))} FCFA`,             i: "🔒", col: C.cyan   },
              ].map((stat) => (
                <div
                  key={stat.l}
                  style={{ background: C.bgCard, borderLeft: `3px solid ${stat.col}`, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.i}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: stat.col }}>{stat.v}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{stat.l}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, color: C.text }}>📋 Statut des commandes</h3>
                {orders.length === 0 ? (
                  <div style={{ color: C.muted, fontSize: 13 }}>Aucune commande</div>
                ) : (
                  Object.entries(STATUS).map(([k, v]) => {
                    const count = orders.filter((o: any) => o.status === k).length;
                    return (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: (v as any).color, display: "inline-block" }} />
                          {(v as any).label}
                        </span>
                        <span style={{ fontWeight: 700, background: (v as any).bg, color: (v as any).color, padding: "2px 10px", borderRadius: 100, fontSize: 12 }}>{count}</span>
                      </div>
                    );
                  })
                )}
              </Card>
              <Card>
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, color: C.text }}>🔒 Dépôts de garantie</h3>
                {sellers.length === 0 ? (
                  <div style={{ color: C.muted, fontSize: 13 }}>Aucun vendeur</div>
                ) : (
                  sellers.map((acc: any) => (
                    <div key={acc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 13, color: C.text }}>{acc.name}</span>
                      <span style={{ fontWeight: 700, color: C.gold, fontSize: 13 }}>{fmt(acc.sellerLimits?.reserve || 0)} FCFA</span>
                    </div>
                  ))
                )}
              </Card>
            </div>
          </>
        )}

        {/* ── USERS ───────────────────────────────────────────────────────── */}
        {active === "users" && (
          <div>
            <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: C.muted }}>
              Sélectionnez un utilisateur pour l'activer comme annonceur et configurer ses limites, son dépôt de garantie et les cryptos autorisées.
            </div>
            {buyers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
                <p>Aucun utilisateur acheteur</p>
              </div>
            ) : (
              buyers.map((acc: any) => (
                <div key={acc.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#0f2035,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.gold, fontSize: 16, flexShrink: 0 }}>
                      {acc.name?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{acc.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{acc.email}</div>
                      {acc.whatsapp && <div style={{ fontSize: 12, color: C.muted }}>📱 {acc.whatsapp}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {acc.password && (
                        <button onClick={() => setPasswordModal(acc)} style={{ ...st.btn("secondary", "sm") }}>
                          🔑 Mot de passe
                        </button>
                      )}
                      <button onClick={() => setPromoteModal(acc)} style={{ ...st.btn("green", "sm") }}>
                        🏪 Activer Annonceur
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── SELLERS ─────────────────────────────────────────────────────── */}
        {active === "sellers" && (
          <div>
            {sellers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🏪</div>
                <p>Aucun vendeur actif</p>
              </div>
            ) : (
              sellers.map((acc: any) => {
                const sStatus = SELLER_STATUS[acc.sellerStatus] || SELLER_STATUS.active;
                const days = daysLeft(acc.sellerLimits?.expiresAt);
                const isExpired = days !== null && days <= 0;
                return (
                  <div key={acc.id} style={{ background: C.bgCard, border: `1px solid ${isExpired ? "rgba(239,68,68,0.4)" : C.border}`, borderRadius: 16, padding: 18, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#0f2035,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.gold, fontSize: 18, flexShrink: 0 }}>
                        {acc.name?.[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{acc.name}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{acc.email}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          <span style={{ background: sStatus.bg, color: sStatus.color, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                            {sStatus.label}
                          </span>
                          {isExpired ? (
                            <span style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                              ⛔ Expiré
                            </span>
                          ) : days !== null ? (
                            <span style={{ background: days <= 7 ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.1)", color: days <= 7 ? C.gold : C.green, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                              ⏱ {days}j restant{days > 1 ? "s" : ""}
                            </span>
                          ) : null}
                          <span style={{ background: "rgba(245,158,11,0.1)", color: C.gold, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                            🔒 {fmt(acc.sellerLimits?.reserve || 0)} FCFA
                          </span>
                        </div>
                        {acc.sellerLimits?.allowedCryptos?.length > 0 && (
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                            {acc.sellerLimits.allowedCryptos.map((cid: string) => {
                              const cr = getCr(cid);
                              return (
                                <span key={cid} style={{ color: cr.color, fontSize: 13, background: `${cr.color}15`, padding: "2px 8px", borderRadius: 6 }}>
                                  {cr.icon} {cr.symbol}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {acc.sellerLimits && (
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
                            Min: {fmt(acc.sellerLimits.minSell || 0)} · Max: {fmt(acc.sellerLimits.maxSell || 0)} · Jour: {fmt(acc.sellerLimits.dailyLimit || 0)} FCFA
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button onClick={() => setSellerModal(acc)} style={{ ...st.btn("cyan", "sm") }}>⚙️ Gérer</button>
                        {acc.sellerStatus !== "blocked" ? (
                          <button onClick={() => { updateAcc(acc.id, { sellerStatus: "blocked" }); notify(`${acc.name} bloqué.`); }} style={{ ...st.btn("red", "sm") }}>
                            🚫 Bloquer
                          </button>
                        ) : (
                          <button onClick={() => { updateAcc(acc.id, { sellerStatus: "active" }); notify(`${acc.name} débloqué. ✅`); }} style={{ ...st.btn("green", "sm") }}>
                            ✅ Débloquer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── ORDERS ───────────────────────────────────────────────────────── */}
        {active === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p>Aucune commande</p>
              </div>
            ) : (
              orders.map((order: any) => {
                const cr = getCr(order.crypto);
                const status = STATUS[order.status] || STATUS.paid;
                return (
                  <div key={order.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: C.gold, flex: "0 0 105px" }}>{order.id}</span>
                      <div style={{ flex: "1 1 120px" }}>
                        <div style={{ color: cr.color }}>{cr.icon} {order.amount} {cr.symbol}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{fmtUSD(order.totalFCFA || order.amountFCFA)}</div>
                      </div>
                      <div style={{ flex: "1 1 140px", fontSize: 12.5, color: C.muted }}>
                        <div>Acheteur : <strong style={{ color: C.text }}>{order.buyerName}</strong></div>
                        <div>Vendeur : <strong style={{ color: C.text }}>{order.seller}</strong></div>
                      </div>
                      <span style={{ background: (status as any).bg, color: (status as any).color, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                        {(status as any).label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── DISPUTES ─────────────────────────────────────────────────────── */}
        {active === "disputes" && (
          <div>
            {disputes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <p>Aucun litige actif</p>
              </div>
            ) : (
              disputes.map((order: any) => {
                const cr = getCr(order.crypto);
                const seller = accounts.find((a: any) => a.id === order.sellerId);
                const reserve: number = seller?.sellerLimits?.reserve || 0;
                return (
                  <div key={order.id} style={{ background: C.bgCard, border: "1px solid rgba(239,68,68,0.35)", borderRadius: 16, padding: 18, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                      <div style={{ flex: "1 1 140px" }}>
                        <div style={{ fontWeight: 700, color: C.red, fontSize: 13, marginBottom: 4 }}>⚠️ {order.id}</div>
                        <div style={{ fontWeight: 700, color: C.text }}>{order.amount} {cr.symbol}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{fmtUSD(order.totalFCFA || order.amountFCFA)}</div>
                      </div>
                      <div style={{ flex: "1 1 130px", fontSize: 12.5, color: C.muted }}>
                        <div>Acheteur : <strong style={{ color: C.text }}>{order.buyerName}</strong></div>
                        <div>Vendeur : <strong style={{ color: C.text }}>{order.seller || seller?.name || "—"}</strong></div>
                      </div>
                      <div style={{ flex: "0 0 auto", textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Dépôt vendeur</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: C.gold }}>{fmt(reserve)} FCFA</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setDisputeModal(order)}
                      style={{ width: "100%", padding: "11px", borderRadius: 11, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontWeight: 800, fontSize: 14 }}
                    >
                      ⚖️ Résoudre le litige & Transférer fonds
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── OFFERS ───────────────────────────────────────────────────────── */}
        {active === "offers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {offers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>
                <p>Aucune annonce</p>
              </div>
            ) : (
              offers.map((offer: any) => {
                const cr = getCr(offer.crypto);
                return (
                  <div key={offer.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 140px", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: cr.color, fontSize: 22 }}>{cr.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{cr.name}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{cr.network}</div>
                        </div>
                      </div>
                      <div style={{ flex: "1 1 120px" }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: C.gold }}>{fmtUSD(offer.rate)} /unité</div>
                        <div style={{ fontSize: 12, color: C.muted }}>Dispo : {fmt(offer.available)}</div>
                      </div>
                      <div style={{ flex: "1 1 120px", fontSize: 13, color: C.muted }}>
                        Vendeur : <strong style={{ color: C.text }}>{offer.sellerName}</strong>
                      </div>
                      <button
                        onClick={() => { setOffers(offers.filter((o: any) => o.id !== offer.id)); notify("Annonce supprimée."); }}
                        style={st.btn("danger", "sm")}
                      >
                        🗑 Supprimer
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </SidebarLayout>

      {/* Modal Mot de passe */}
      {passwordModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, width: "100%", maxWidth: 380 }}>
            <div style={{ fontWeight: 900, fontSize: 16, color: C.text, marginBottom: 6 }}>🔑 Mot de passe</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>{passwordModal.name} — {passwordModal.email}</div>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ color: C.text, fontSize: 22, fontWeight: 900, letterSpacing: 4, textAlign: "center" }}>
                {passwordModal.password || "Non renseigné"}
              </div>
            </div>
            <button
              onClick={() => setPasswordModal(null)}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontWeight: 700, cursor: "pointer" }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
