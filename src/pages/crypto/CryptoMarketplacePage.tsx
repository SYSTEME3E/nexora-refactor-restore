import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getNexoraUser, isNexoraAuthenticated } from "@/lib/nexora-auth";
import { C, makeStyles, CryptoAccount } from "./crypto/crypto-constants";
import CryptoMarketplacePage from "./crypto/CryptoMarketplacePage";
import CryptoBuyPage from "./crypto/CryptoBuyPage";
import CryptoDashboardPage from "./crypto/CryptoDashboardPage";
import CryptoSellerPage from "./crypto/CryptoSellerPage";
import CryptoAdminPanelPage from "./crypto/CryptoAdminPanelPage";

export default function Cryptop2pmarketplace() {
  const routerNavigate = useNavigate();
  const nexoraUser = getNexoraUser();
  const isAuth = isNexoraAuthenticated();

  const [page, setPage] = useState("marketplace");
  const [pageOpts, setPageOpts] = useState<any>({});
  const [accounts, setAccounts] = useState<CryptoAccount[]>(() => {
    if (!nexoraUser) return [];
    return [{
      id: nexoraUser.id,
      name: nexoraUser.nom_prenom,
      email: nexoraUser.email,
      isAdmin: nexoraUser.is_admin,
      isSeller: false,
      sellerStatus: "active",
      paymentInfo: { reseau: "", numero: "", lienPaiement: "" },
      sellerLimits: { reserve: 0, maxSell: 0, minSell: 0 },
      whatsapp: "",
    }];
  });
  const [offers, setOffers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selOffer, setSelOffer] = useState<any>(null);
  const [notif, setNotif] = useState<any>(null);

  const notify = useCallback((msg: string, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4500);
  }, []);

  if (!isAuth || !nexoraUser) {
    routerNavigate("/login", { replace: true });
    return null;
  }

  const currentUser = accounts.find((a) => a.id === nexoraUser.id) || accounts[0];

  const navigate = (p: string, opts: any = {}) => {
    if (opts.offer) setSelOffer(opts.offer);
    setPageOpts(opts);
    setPage(p);
    window.scrollTo(0, 0);
  };

  const onLogout = () => {
    routerNavigate("/dashboard");
  };

  const promoteToSeller = (userId: string) => {
    setAccounts((prev) => prev.map((a) => (a.id === userId ? { ...a, isSeller: true } : a)));
  };

  const updateAccount = (userId: string, patch: any) => {
    setAccounts((prev) => prev.map((a) => (a.id === userId ? { ...a, ...patch } : a)));
  };

  const shared = { navigate, notify, user: currentUser, accounts, setAccounts, orders, setOrders, offers, setOffers };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        button:hover{opacity:0.85} button:active{transform:scale(0.98)}
      `}</style>

      {notif && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 10000, background: notif.type === "success" ? C.green : notif.type === "error" ? C.red : C.blue, color: "#fff", padding: "13px 20px", borderRadius: 12, fontWeight: 600, fontSize: 13, maxWidth: 360, animation: "slideIn 0.3s ease" }}>
          {notif.type === "success" ? "✅ " : notif.type === "error" ? "❌ " : "ℹ️ "}{notif.msg}
        </div>
      )}

      {page === "marketplace" && <CryptoMarketplacePage {...shared} onLogout={onLogout} />}
      {page === "buy"         && <CryptoBuyPage         {...shared} onLogout={onLogout} offer={selOffer} />}
      {page === "dashboard"   && <CryptoDashboardPage   {...shared} onLogout={onLogout} updateAccount={updateAccount} />}
      {page === "seller"      && <CryptoSellerPage      {...shared} onLogout={onLogout} updateAccount={updateAccount} />}
      {page === "admin"       && <CryptoAdminPanelPage  {...shared} onLogout={onLogout} promoteToSeller={promoteToSeller} updateAccount={updateAccount} />}
    </div>
  );
}
