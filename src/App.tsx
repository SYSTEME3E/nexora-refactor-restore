import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NexoraAuthGuard from "@/components/NexoraAuthGuard";
import PageLoader from "@/components/PageLoader";
import { hasNexoraPremium } from "@/lib/nexora-auth";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

// Auth
import NexoraLoginPage from "@/pages/NexoraLoginPage";
import LandingPage from "@/pages/LandingPage";
import CGUPage from "@/pages/CGUPage";
import PrivacyPage from "@/pages/PrivacyPage";

// Pages Dashboard / Finance
import DashboardPage from "@/pages/DashboardPage";
import HistoriquePage from "@/pages/HistoriquePage";
import CoffreFortPage from "@/pages/CoffreFortPage";
import MediasPage from "@/pages/MediasPage";
import LiensPage from "@/pages/LiensPage";
import ProfilPage from "@/pages/ProfilPage";
import PretsPage from "@/pages/PretsPage";
import FacturesPage from "@/pages/FacturesPage";
import EntreesDepensesPage from "@/pages/EntreesDepensesPage";
import TransfertPage from "@/pages/Transfertpage";

// Boutique
import BoutiqueAccueilPage from "@/pages/boutique/AccueilPage";
import BoutiqueProduitsPage from "@/pages/boutique/ProduitsPage";
import CommandesPage from "@/pages/boutique/CommandesPage";
import BoutiqueParametresPage from "@/pages/boutique/ParametresPage";
import DigitalFinancePage from "@/pages/boutique/DigitalFinancePage";
import BoutiqueVitrinePage from "@/pages/boutique/VitrinePage";
import ProduitDetailPage from "@/pages/boutique/ProduitDetailPage";
import AcheterPage from "@/pages/boutique/AcheterPage";
import CommandeTrackingPage from "@/pages/boutique/CommandeTrackingPage";

// Immobilier
import ImmobilierPage from "@/pages/ImmobilierPage";
import AnnonceDetailPage from "@/pages/AnnonceDetailPage";
import ProfilVendeurPage from "@/pages/ProfilVendeurPage";

// Abonnement & Paiement
import AbonnementPage from "@/pages/AbonnementPage";
import PaymentCallbackPage from "@/pages/PaymentCallbackPage";

// Admin
import AdminPanelPage from "@/pages/AdminPanelPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const LOADER_LOGIN = 800;
const LOADER_PAGE = 800;

// --- Composants de Garde (Guards) ---

const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <NexoraAuthGuard>
    <PageLoader duration={LOADER_PAGE}>{children}</PageLoader>
  </NexoraAuthGuard>
);

const AdminPage = ({ children }: { children: React.ReactNode }) => (
  <NexoraAuthGuard requireAdmin>
    <PageLoader duration={LOADER_PAGE}>{children}</PageLoader>
  </NexoraAuthGuard>
);

function PremiumWall() {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mb-6 shadow-lg">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">Fonctionnalité Premium</h2>
        <p className="text-muted-foreground text-sm mb-1 max-w-xs">
          Cette section est réservée aux membres <span className="font-bold text-yellow-600">Premium</span>.
        </p>
        <p className="text-muted-foreground text-xs mb-8 max-w-xs">
          Passez au plan Premium pour accéder à toutes les fonctionnalités sans limite.
        </p>
        <button
          onClick={() => navigate("/abonnement")}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all"
        >
          <Crown className="w-4 h-4" /> Voir les plans
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Retour au tableau de bord
        </button>
      </div>
    </AppLayout>
  );
}

const PremiumPage = ({ children }: { children: React.ReactNode }) => (
  <NexoraAuthGuard>
    <PageLoader duration={LOADER_PAGE}>
      {hasNexoraPremium() ? children : <PremiumWall />}
    </PageLoader>
  </NexoraAuthGuard>
);

// --- Bouton WhatsApp Flottant ---

function WhatsAppFloatingButton() {
  return (
    <>
      <style>{`
        @keyframes wa-fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wa-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
          50%       { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0); }
        }
        .wa-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #25D366;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.45), 0 2px 8px rgba(0,0,0,0.15);
          animation: wa-fadeSlideUp 0.6s cubic-bezier(.22,.68,0,1.2) both, wa-pulse 2.5s ease-in-out 1.5s infinite;
          transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
          z-index: 9999;
          text-decoration: none;
        }
        .wa-btn:hover {
          transform: scale(1.13);
          box-shadow: 0 8px 32px rgba(37, 211, 102, 0.55), 0 4px 12px rgba(0,0,0,0.18);
          animation: none;
        }
        .wa-btn:hover .wa-tooltip {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .wa-tooltip {
          position: absolute;
          bottom: 72px;
          right: 0;
          background: #fff;
          color: #1a1a1a;
          font-size: 13px;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 9px 14px;
          border-radius: 12px;
          white-space: nowrap;
          box-shadow: 0 4px 18px rgba(0,0,0,0.13);
          opacity: 0;
          transform: translateY(6px);
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .wa-tooltip::after {
          content: '';
          position: absolute;
          bottom: -7px;
          right: 22px;
          width: 13px;
          height: 13px;
          background: #fff;
          transform: rotate(45deg);
          border-radius: 2px;
          box-shadow: 3px 3px 6px rgba(0,0,0,0.06);
        }
        @media (max-width: 640px) {
          .wa-btn {
            width: 50px;
            height: 50px;
            bottom: 18px;
            right: 18px;
          }
          .wa-tooltip {
            font-size: 12px;
            bottom: 62px;
          }
        }
      `}</style>

      
        href="https://chat.whatsapp.com/BCBOcRIFGr6LoRPyMiXRAp"
        target="_blank"
        rel="noopener noreferrer"
        className="wa-btn"
        aria-label="Rejoindre la communauté WhatsApp"
      >
        <span className="wa-tooltip">💬 Rejoignez la communauté</span>
        {/* Icône communauté WhatsApp (SVG officiel simplifié) */}
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Personnes - icône communauté */}
          <circle cx="16" cy="10" r="4" fill="white"/>
          <path d="M8 26c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="7" cy="12" r="3" fill="white" opacity="0.75"/>
          <path d="M1 26c0-3.314 2.686-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.75"/>
          <circle cx="25" cy="12" r="3" fill="white" opacity="0.75"/>
          <path d="M31 26c0-3.314-2.686-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.75"/>
        </svg>
      </a>
    </>
  );
}

// --- Application Principale ---

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public / Auth */}
          <Route path="/login" element={
            <PageLoader duration={LOADER_LOGIN}>
              <NexoraLoginPage />
            </PageLoader>
          } />
          <Route path="/" element={<LandingPage />} />
          <Route path="/cgu" element={<CGUPage />} />
          <Route path="/confidentialite" element={<PrivacyPage />} />

          {/* Routes Dashboard / Finance */}
          <Route path="/dashboard"         element={<ProtectedPage><DashboardPage /></ProtectedPage>} />
          <Route path="/historique"        element={<ProtectedPage><HistoriquePage /></ProtectedPage>} />
          <Route path="/coffre-fort"       element={<ProtectedPage><CoffreFortPage /></ProtectedPage>} />
          <Route path="/liens"             element={<ProtectedPage><LiensPage /></ProtectedPage>} />
          <Route path="/profil"            element={<ProtectedPage><ProfilPage /></ProtectedPage>} />
          <Route path="/abonnement"        element={<ProtectedPage><AbonnementPage /></ProtectedPage>} />
          <Route path="/transfert"         element={<ProtectedPage><TransfertPage /></ProtectedPage>} />
          <Route path="/factures"          element={<ProtectedPage><FacturesPage /></ProtectedPage>} />
          <Route path="/prets"             element={<ProtectedPage><PretsPage /></ProtectedPage>} />
          <Route path="/entrees-depenses"  element={<ProtectedPage><EntreesDepensesPage /></ProtectedPage>} />
          
          {/* Callback Paiement Moneroo */}
          <Route path="/payment/callback"  element={<ProtectedPage><PaymentCallbackPage /></ProtectedPage>} />

          {/* Redirections */}
          <Route path="/entrees"           element={<Navigate to="/entrees-depenses" replace />} />
          <Route path="/depenses"          element={<Navigate to="/entrees-depenses" replace />} />

          {/* Routes Premium */}
          <Route path="/immobilier"             element={<PremiumPage><ImmobilierPage /></PremiumPage>} />
          <Route path="/immobilier/annonce/:id" element={<PremiumPage><AnnonceDetailPage /></PremiumPage>} />
          <Route path="/boutique"               element={<PremiumPage><BoutiqueAccueilPage /></PremiumPage>} />
          <Route path="/boutique/produits"      element={<PremiumPage><BoutiqueProduitsPage /></PremiumPage>} />
          <Route path="/boutique/commandes"     element={<PremiumPage><CommandesPage /></PremiumPage>} />
          <Route path="/boutique/parametres"    element={<PremiumPage><BoutiqueParametresPage /></PremiumPage>} />
          <Route path="/boutique/finances"      element={<PremiumPage><DigitalFinancePage /></PremiumPage>} />

          {/* Vitrines (Accessibles via slugs) */}
          <Route path="/shop/:slug"                               element={<BoutiqueVitrinePage />} />
          <Route path="/shop/:slug/produit/:produitId"            element={<ProduitDetailPage />} />
          <Route path="/shop/:slug/acheter/:produitId"            element={<AcheterPage />} />
          <Route path="/immobilier/vendeur/:userId"               element={<ProfilVendeurPage />} />
          <Route path="/commande/:commandeId"                     element={<CommandeTrackingPage />} />

          {/* Admin */}
          <Route path="/admin"  element={<AdminPage><AdminPanelPage /></AdminPage>} />
          <Route path="/medias" element={<AdminPage><MediasPage /></AdminPage>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Bouton WhatsApp Flottant — visible sur toutes les pages */}
        <WhatsAppFloatingButton />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
