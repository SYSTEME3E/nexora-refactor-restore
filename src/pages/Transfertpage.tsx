import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Send, Plus, History, Globe,
  ArrowDownLeft, ArrowUpRight, X, Check, AlertCircle,
  Download, Phone, Search, ChevronDown, Loader2,
  BadgeCheck, Lock
} from "lucide-react";

// ─────────────────────────────────────────────
// KKIAPAY — chargé via CDN dans index.html
// ─────────────────────────────────────────────
declare global {
  interface Window {
    openKkiapayWidget: (config: Record<string, unknown>) => void;
    addKkiapayListener: (event: string, cb: (data: { transactionId: string }) => void) => void;
    removeKkiapayListener: (event: string) => void;
  }
}

const LOGO_URL = "https://i.postimg.cc/c1QgbZsG/ei_1773937801458_removebg_preview.png";

// ─── PAYS ACTIFS ───
const ACTIVE_COUNTRIES = [
  { code: "BJ", flag: "🇧🇯", name: "Bénin",         currency: "XOF", networks: ["MTN MoMo", "Moov Money"] },
  { code: "CI", flag: "🇨🇮", name: "Côte d'Ivoire", currency: "XOF", networks: ["Orange Money", "MTN MoMo", "Wave", "Moov Money"] },
  { code: "TG", flag: "🇹🇬", name: "Togo",           currency: "XOF", networks: ["Flooz", "T-Money"] },
  { code: "SN", flag: "🇸🇳", name: "Sénégal",        currency: "XOF", networks: ["Orange Money", "Wave", "Free Money"] },
  { code: "NE", flag: "🇳🇪", name: "Niger",          currency: "XOF", networks: ["Airtel Money", "Moov Money"] },
];

// ─── PAYS BIENTÔT DISPONIBLES ───
const COMING_SOON = [
  { code: "ML", flag: "🇲🇱", name: "Mali" },
  { code: "BF", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "GN", flag: "🇬🇳", name: "Guinée" },
  { code: "CM", flag: "🇨🇲", name: "Cameroun" },
  { code: "CD", flag: "🇨🇩", name: "RD Congo" },
  { code: "GA", flag: "🇬🇦", name: "Gabon" },
  { code: "CG", flag: "🇨🇬", name: "Congo" },
  { code: "GH", flag: "🇬🇭", name: "Ghana" },
  { code: "NG", flag: "🇳🇬", name: "Nigéria" },
  { code: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "TZ", flag: "🇹🇿", name: "Tanzanie" },
  { code: "UG", flag: "🇺🇬", name: "Ouganda" },
  { code: "RW", flag: "🇷🇼", name: "Rwanda" },
  { code: "ZM", flag: "🇿🇲", name: "Zambie" },
  { code: "MW", flag: "🇲🇼", name: "Malawi" },
  { code: "MZ", flag: "🇲🇿", name: "Mozambique" },
  { code: "SL", flag: "🇸🇱", name: "Sierra Leone" },
  { code: "ET", flag: "🇪🇹", name: "Éthiopie" },
  { code: "LS", flag: "🇱🇸", name: "Lesotho" },
];

// ─── TYPES ───
type ActiveCountry = typeof ACTIVE_COUNTRIES[0];
type Transaction = {
  id: string;
  type: "depot" | "transfert";
  montant: number;
  frais: number;
  date: string;
  pays?: string;
  flag?: string;
  reseau?: string;
  telephone?: string;
  status: "success" | "pending" | "failed";
  reference: string;
};

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));
const calcFrais = (montant: number) => Math.round(montant * 0.03);
const generateRef = (type: "DEP" | "TRF") => `${type}-${Date.now().toString().slice(-8)}`;

// ─────────────────────────────────────────────
// PDF FACTURE
// ─────────────────────────────────────────────
function generateInvoicePDF(tx: Transaction) {
  const win = window.open("", "_blank");
  if (!win) return;
  const typeLabel = tx.type === "depot" ? "RECHARGE" : "TRANSFERT";
  const color = tx.type === "depot" ? "#10b981" : "#6366f1";
  win.document.write(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/><title>Facture ${tx.reference}</title>
<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b;}.page{max-width:680px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.12);}.header{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:36px 40px;display:flex;align-items:center;justify-content:space-between;}.logo-area{display:flex;align-items:center;gap:14px;}.logo-area img{width:52px;height:52px;object-fit:contain;}.brand h1{font-size:22px;font-weight:900;letter-spacing:3px;color:#fff;}.brand p{font-size:11px;color:rgba(255,255,255,.45);margin-top:2px;}.badge{background:${color};color:#fff;border-radius:8px;padding:8px 18px;font-size:13px;font-weight:700;letter-spacing:1px;}.body{padding:40px;}.ref-row{display:flex;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid #e2e8f0;}.ref span,.date span{font-size:12px;color:#64748b;display:block;}.ref strong{font-size:20px;font-weight:900;color:#0f172a;display:block;margin-top:2px;}.date{text-align:right;}.date strong{font-size:15px;font-weight:700;color:#0f172a;display:block;margin-top:2px;}.section-title{font-size:11px;font-weight:700;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;margin-bottom:16px;}.row{display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px dashed #e2e8f0;}.row .label{color:#64748b;font-size:14px;}.row .value{font-weight:600;color:#1e293b;font-size:14px;}.total-box{background:#f8fafc;border:2px solid ${color};border-radius:12px;padding:20px 24px;margin:24px 0;display:flex;justify-content:space-between;align-items:center;}.total-box .amount{font-size:28px;font-weight:900;color:${color};}.status-row{text-align:center;margin:20px 0;}.status-badge{display:inline-block;padding:8px 24px;border-radius:999px;font-weight:700;font-size:13px;}.success{background:#dcfce7;color:#16a34a;}.pending{background:#fef9c3;color:#ca8a04;}.failed{background:#fee2e2;color:#dc2626;}.footer{background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;}.footer p{font-size:12px;color:#94a3b8;line-height:1.8;}.footer strong{color:#6366f1;}@media print{body{background:#fff;}.page{box-shadow:none;margin:0;}}</style>
</head><body><div class="page">
<div class="header"><div class="logo-area"><img src="${LOGO_URL}" alt="NEXORA"/><div class="brand"><h1>NEXORA</h1><p>TRANSFERT AFRICA</p></div></div><div class="badge">FACTURE ${typeLabel}</div></div>
<div class="body"><div class="ref-row"><div class="ref"><span>Référence</span><strong>${tx.reference}</strong></div><div class="date"><span>Date</span><strong>${tx.date}</strong></div></div>
<div class="section-title">Détails de la transaction</div>
<div class="row"><span class="label">Type d'opération</span><span class="value">${typeLabel}</span></div>
<div class="row"><span class="label">Montant</span><span class="value">${fmt(tx.montant)} FCFA</span></div>
${tx.type === "transfert" ? `<div class="row"><span class="label">Frais (3%)</span><span class="value">${fmt(tx.frais)} FCFA</span></div><div class="row"><span class="label">Montant reçu</span><span class="value">${fmt(tx.montant - tx.frais)} FCFA</span></div><div class="row"><span class="label">Pays destinataire</span><span class="value">${tx.flag} ${tx.pays}</span></div><div class="row"><span class="label">Réseau</span><span class="value">${tx.reseau}</span></div><div class="row"><span class="label">Numéro</span><span class="value">${tx.telephone}</span></div>` : `<div class="row"><span class="label">Frais de recharge</span><span class="value">0 FCFA (Gratuit)</span></div>`}
<div class="total-box"><span class="label">Total débité</span><span class="amount">${fmt(tx.montant)} FCFA</span></div>
<div class="status-row"><span class="status-badge ${tx.status}">${tx.status === "success" ? "✓ Opération réussie" : tx.status === "pending" ? "⏳ En cours" : "✗ Échouée"}</span></div>
</div><div class="footer"><p>Facture générée par <strong>NEXORA TRANSFERT</strong><br/>Support : <strong>support@nexora.africa</strong><br/>© ${new Date().getFullYear()} NEXORA — Tous droits réservés</p></div>
</div><script>window.onload=()=>{window.print();}</script></body></html>`);
  win.document.close();
}

// ─────────────────────────────────────────────
// COUNTRY SELECTOR
// ─────────────────────────────────────────────
function CountrySelector({ selected, onSelect, label }: {
  selected: ActiveCountry | null;
  onSelect: (c: ActiveCountry) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = ACTIVE_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.networks.some(n => n.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/60 border border-border rounded-xl hover:border-accent transition-colors text-left">
        {selected ? (
          <>
            <span className="text-2xl leading-none">{selected.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground">{selected.name}</div>
              <div className="text-xs text-muted-foreground truncate">{selected.networks.join(" · ")}</div>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground text-sm flex-1">Sélectionner un pays...</span>
        )}
        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Pays ou réseau..."
                className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm outline-none placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-center text-xs text-muted-foreground py-6">Aucun résultat</p>
              : filtered.map(c => (
                <button key={c.code} type="button"
                  onClick={() => { onSelect(c); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/70 transition-colors text-left">
                  <span className="text-xl leading-none">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.networks.join(" · ")}</div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{c.currency}</span>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL RECHARGE — KKIAPAY LIVE
// ─────────────────────────────────────────────
function ModalRecharge({ onClose, onConfirm }: {
  onClose: () => void;
  onConfirm: (montant: number, reseau: string, tel: string, pays: ActiveCountry, transactionId: string) => void;
}) {
  const [montant, setMontant] = useState("");
  const [pays, setPays] = useState<ActiveCountry | null>(null);
  const [reseau, setReseau] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef<{ montant: number; reseau: string; telephone: string; pays: ActiveCountry } | null>(null);

  const montantNum = parseFloat(montant) || 0;
  const valid = montantNum >= 100 && pays !== null && reseau !== "" && telephone.length >= 8;

  useEffect(() => {
    const successHandler = (data: { transactionId: string }) => {
      const p = pendingRef.current;
      if (!p) return;
      setLoading(false);
      onConfirm(p.montant, p.reseau, p.telephone, p.pays, data.transactionId);
    };
    const failedHandler = () => {
      setLoading(false);
      setError("Le paiement a échoué ou a été annulé. Veuillez réessayer.");
      pendingRef.current = null;
    };
    window.addKkiapayListener("success", successHandler);
    window.addKkiapayListener("failed", failedHandler);
    return () => {
      window.removeKkiapayListener("success");
      window.removeKkiapayListener("failed");
    };
  }, [onConfirm]);

  const handleSubmit = () => {
    if (!valid || !pays) return;
    setError(null);
    setLoading(true);
    pendingRef.current = { montant: montantNum, reseau, telephone, pays };
    window.openKkiapayWidget({
      amount: montantNum,
      position: "center",
      theme: "#10b981",
      key: import.meta.env.VITE_KKIAPAY_API_KEY,
      sandbox: false,
      data: `Recharge NEXORA — ${reseau} — ${telephone}`,
      phone: telephone.replace(/\s/g, ""),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-border bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-lg text-foreground">Recharger mon compte</h3>
            <p className="text-xs text-muted-foreground">Sans frais · Paiement sécurisé KKIAPAY</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Montant à recharger</label>
            <div className="relative">
              <input type="number" value={montant} onChange={e => setMontant(e.target.value)}
                placeholder="Ex: 50000"
                className="w-full px-4 py-3 pr-20 bg-muted/60 border border-border rounded-xl text-lg font-bold outline-none focus:border-emerald-400 transition-colors" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">FCFA</span>
            </div>
            <div className="flex gap-2 mt-2">
              {[5000, 10000, 25000, 50000].map(v => (
                <button key={v} type="button" onClick={() => setMontant(String(v))}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-colors">
                  {fmt(v)}
                </button>
              ))}
            </div>
          </div>

          <CountrySelector selected={pays} onSelect={p => { setPays(p); setReseau(""); }} label="Pays de votre réseau" />

          {pays && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Réseau Mobile Money</label>
              <div className="grid grid-cols-2 gap-2">
                {pays.networks.map(n => (
                  <button key={n} type="button" onClick={() => setReseau(n)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${reseau === n ? "border-emerald-400 bg-emerald-400/10 text-emerald-500" : "border-border bg-muted/60 text-foreground hover:border-accent"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Votre numéro Mobile Money</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
                placeholder="+229 97 00 00 00"
                className="w-full pl-10 pr-4 py-3 bg-muted/60 border border-border rounded-xl outline-none focus:border-emerald-400 transition-colors" />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-emerald-500/10 rounded-xl">
            <BadgeCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Recharge <strong>100% gratuite</strong>. Le montant exact sera crédité sur votre compte NEXORA.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={!valid || loading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Ouverture du paiement...</>
              : <><Plus className="w-4 h-4" /> Payer {montantNum > 0 ? fmt(montantNum) + " FCFA" : ""}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL TRANSFERT
// ─────────────────────────────────────────────
function ModalTransfert({ onClose, onConfirm, balance }: {
  onClose: () => void;
  onConfirm: (montant: number, frais: number, reseau: string, tel: string, pays: ActiveCountry) => void;
  balance: number;
}) {
  const [montant, setMontant] = useState("");
  const [pays, setPays] = useState<ActiveCountry | null>(null);
  const [reseau, setReseau] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);

  const montantNum = parseFloat(montant) || 0;
  const frais = calcFrais(montantNum);
  const netRecu = montantNum - frais;
  const soldeInsuffisant = montantNum > balance;
  const valid = montantNum >= 100 && !soldeInsuffisant && pays !== null && reseau !== "" && telephone.length >= 8;

  const handleSubmit = async () => {
    if (!valid || !pays) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    onConfirm(montantNum, frais, reseau, telephone, pays);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-border bg-gradient-to-r from-violet-500/10 to-indigo-500/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-lg text-foreground">Envoyer de l'argent</h3>
            <p className="text-xs text-muted-foreground">Frais : 3% · 5 pays disponibles</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/60 rounded-xl">
            <span className="text-xs font-semibold text-muted-foreground">Solde disponible</span>
            <span className="font-black text-foreground">{fmt(balance)} FCFA</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Montant à envoyer</label>
            <div className="relative">
              <input type="number" value={montant} onChange={e => setMontant(e.target.value)}
                placeholder="Ex: 10000"
                className={`w-full px-4 py-3 pr-20 bg-muted/60 border rounded-xl text-lg font-bold outline-none transition-colors ${soldeInsuffisant ? "border-destructive" : "border-border focus:border-violet-400"}`} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">FCFA</span>
            </div>
            {montantNum > 0 && (
              <div className="mt-2 p-3 bg-muted/40 rounded-xl space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frais (3%)</span>
                  <span className="font-semibold text-orange-400">− {fmt(frais)} FCFA</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-1.5">
                  <span className="text-muted-foreground font-semibold">Le destinataire reçoit</span>
                  <span className="font-black text-emerald-400">{fmt(netRecu > 0 ? netRecu : 0)} FCFA</span>
                </div>
              </div>
            )}
            {soldeInsuffisant && (
              <div className="flex items-center gap-2 mt-2 p-2.5 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-xs text-destructive">Solde insuffisant. Rechargez votre compte.</p>
              </div>
            )}
          </div>

          <CountrySelector selected={pays} onSelect={p => { setPays(p); setReseau(""); }} label="Pays destinataire" />

          {pays && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Réseau Mobile Money</label>
              <div className="grid grid-cols-2 gap-2">
                {pays.networks.map(n => (
                  <button key={n} type="button" onClick={() => setReseau(n)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${reseau === n ? "border-violet-400 bg-violet-400/10 text-violet-500" : "border-border bg-muted/60 text-foreground hover:border-accent"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Numéro du destinataire</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
                placeholder="+221 77 000 00 00"
                className="w-full pl-10 pr-4 py-3 bg-muted/60 border border-border rounded-xl outline-none focus:border-violet-400 transition-colors" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={!valid || loading}
            className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours...</>
              : <><Send className="w-4 h-4" /> Envoyer {montantNum > 0 ? fmt(montantNum) + " FCFA" : ""}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────
export default function TransfertPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showTransfert, setShowTransfert] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "depot" | "transfert">("all");

  const totalDepots     = transactions.filter(t => t.type === "depot"     && t.status === "success").reduce((s, t) => s + t.montant, 0);
  const totalTransferts = transactions.filter(t => t.type === "transfert" && t.status === "success").reduce((s, t) => s + t.montant, 0);
  const filtered        = transactions.filter(t => filterType === "all" || t.type === filterType);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleRecharge = (montant: number, reseau: string, tel: string, pays: ActiveCountry, transactionId: string) => {
    const tx: Transaction = {
      id: Date.now().toString(), type: "depot", montant, frais: 0,
      date: new Date().toLocaleString("fr-FR"), status: "success",
      reference: transactionId || generateRef("DEP"),
      pays: pays.name, flag: pays.flag, reseau, telephone: tel,
    };
    setTransactions(prev => [tx, ...prev]);
    setBalance(prev => prev + montant);
    setShowRecharge(false);
    showSuccess(`Recharge de ${fmt(montant)} FCFA réussie !`);
  };

  const handleTransfert = (montant: number, frais: number, reseau: string, tel: string, pays: ActiveCountry) => {
    const tx: Transaction = {
      id: Date.now().toString(), type: "transfert", montant, frais,
      date: new Date().toLocaleString("fr-FR"), status: "success",
      reference: generateRef("TRF"), pays: pays.name, flag: pays.flag, reseau, telephone: tel,
    };
    setTransactions(prev => [tx, ...prev]);
    setBalance(prev => prev - montant);
    setShowTransfert(false);
    showSuccess(`${fmt(montant)} FCFA envoyés vers ${pays.flag} ${pays.name} !`);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Toast succès */}
        {successMsg && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-emerald-500 text-white rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* ── HERO CARD ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 p-6 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-violet-500/20 translate-y-1/3 -translate-x-1/4 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <img src={LOGO_URL} alt="NEXORA" className="w-12 h-12 object-contain drop-shadow-lg" />
              <div>
                <p className="text-[10px] font-bold tracking-[4px] text-white/40 uppercase">Nexora</p>
                <h1 className="text-xl font-black tracking-widest">TRANSFERT</h1>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-white/40">5 pays actifs</p>
                <div className="flex items-center gap-1 justify-end mt-1">
                  <Globe className="w-3 h-3 text-violet-300" />
                  <span className="text-xs text-violet-300 font-semibold">Mobile Money</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-1">Solde disponible</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight">{fmt(balance)}</span>
                <span className="text-xl font-bold text-white/50 mb-1">FCFA</span>
              </div>
              {balance === 0 && (
                <p className="text-xs text-white/30 mt-1">Rechargez votre compte pour commencer</p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowRecharge(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-black rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95">
                <Plus className="w-5 h-5" /> Recharger
              </button>
              <button onClick={() => setShowTransfert(true)} disabled={balance === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 hover:border-white/40 text-white font-black rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
                <Send className="w-5 h-5" /> Envoyer
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total rechargé</span>
            </div>
            <div className="text-2xl font-black text-foreground">{fmt(totalDepots)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">FCFA · Sans frais</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-violet-500" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total envoyé</span>
            </div>
            <div className="text-2xl font-black text-foreground">{fmt(totalTransferts)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">FCFA · Frais inclus</div>
          </div>
        </div>

        {/* ── PAYS ── */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-accent" />
            <h3 className="font-bold text-sm text-foreground">Pays disponibles</h3>
          </div>

          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">✓ Disponibles maintenant</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ACTIVE_COUNTRIES.map(c => (
              <div key={c.code} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-lg leading-none">{c.flag}</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{c.name}</span>
              </div>
            ))}
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Bientôt disponibles
          </p>
          <div className="flex flex-wrap gap-2">
            {COMING_SOON.map(c => (
              <div key={c.code} className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 border border-border rounded-xl opacity-60">
                <span className="text-base leading-none">{c.flag}</span>
                <span className="text-xs text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── HISTORIQUE ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-wrap gap-y-2">
            <History className="w-4 h-4 text-accent flex-shrink-0" />
            <h3 className="font-bold text-sm text-foreground">Historique des transactions</h3>
            <div className="ml-auto flex gap-1">
              {(["all", "depot", "transfert"] as const).map(f => (
                <button key={f} onClick={() => setFilterType(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filterType === f ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                  {f === "all" ? "Tout" : f === "depot" ? "Recharges" : "Transferts"}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <History className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Aucune transaction</p>
                <p className="text-xs text-muted-foreground mt-0.5">Vos transactions apparaîtront ici</p>
              </div>
              <button onClick={() => setShowRecharge(true)}
                className="mt-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Faire ma première recharge
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === "depot" ? "bg-emerald-500/10" : "bg-violet-500/10"}`}>
                    {tx.type === "depot"
                      ? <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                      : <ArrowUpRight className="w-5 h-5 text-violet-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">
                        {tx.type === "depot" ? "Recharge" : `${tx.flag} ${tx.pays}`}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        tx.status === "success" ? "bg-emerald-500/10 text-emerald-500"
                        : tx.status === "pending" ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-red-500/10 text-red-500"
                      }`}>
                        {tx.status === "success" ? "Réussi" : tx.status === "pending" ? "En cours" : "Échoué"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {tx.reseau && <span className="mr-2">{tx.reseau}</span>}
                      {tx.telephone && <span className="mr-2">{tx.telephone}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground/60 font-mono">{tx.reference}</span>
                      <span className="text-xs text-muted-foreground/40">·</span>
                      <span className="text-xs text-muted-foreground/60">{tx.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className={`font-black text-sm ${tx.type === "depot" ? "text-emerald-500" : "text-violet-500"}`}>
                        {tx.type === "depot" ? "+" : "−"}{fmt(tx.montant)}
                      </div>
                      {tx.frais > 0 && (
                        <div className="text-xs text-muted-foreground">frais {fmt(tx.frais)}</div>
                      )}
                    </div>
                    <button onClick={() => generateInvoicePDF(tx)} title="Télécharger la facture PDF"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── INFO ── */}
        <div className="flex items-start gap-3 px-4 py-3 bg-muted/60 rounded-xl text-xs text-muted-foreground border border-border">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
          <p>
            <strong className="text-foreground">NEXORA TRANSFERT</strong> — Recharge sans frais via Mobile Money (KKIAPAY).
            Frais de transfert : <strong className="text-foreground">3%</strong> déduits du montant envoyé.
            Disponible au Bénin, Côte d'Ivoire, Togo, Sénégal et Niger. D'autres pays arrivent bientôt.
          </p>
        </div>

      </div>

      {showRecharge && <ModalRecharge onClose={() => setShowRecharge(false)} onConfirm={handleRecharge} />}
      {showTransfert && <ModalTransfert balance={balance} onClose={() => setShowTransfert(false)} onConfirm={handleTransfert} />}
    </AppLayout>
  );
}
