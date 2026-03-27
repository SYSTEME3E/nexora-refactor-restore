import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Zap, ShieldCheck, Globe, BarChart3, Receipt,
  Store, Home, Lock, Send, Star, TrendingUp, FileText,
  CreditCard, Wallet, ChevronDown, Menu, X, Sparkles,
  Users, ArrowDownLeft, ArrowUpRight, Facebook, Twitter,
  CheckCircle2, Clock, Play, MessageSquare
} from "lucide-react";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const LOGO = "https://i.postimg.cc/c1QgbZsG/ei_1773937801458_removebg_preview.png";

const OPERATORS = [
  { name: "MTN MoMo" }, { name: "Orange Money" }, { name: "Moov Money" },
  { name: "Wave" }, { name: "M-Pesa" }, { name: "Airtel Money" },
  { name: "Flooz" }, { name: "T-Money" }, { name: "Free Money" },
];

const FEATURES = [
  {
    icon: BarChart3, color: "#6366f1", bg: "#eef2ff",
    title: "Gestion Financière",
    tag: "Disponible",
    desc: "Pilotez vos finances avec précision. Enregistrez vos entrées d'argent, suivez vos dépenses par catégorie, consultez votre historique complet et visualisez votre évolution financière grâce à des graphiques clairs et interactifs. Exportez vos données en PDF ou Excel à tout moment.",
    points: ["Tableau de bord en temps réel", "Catégorisation automatique", "Export PDF & Excel", "Rapports mensuels"],
  },
  {
    icon: Receipt, color: "#10b981", bg: "#ecfdf5",
    title: "Facturation Professionnelle",
    tag: "Disponible",
    desc: "Créez des factures PDF magnifiques et professionnelles en moins d'une minutes. Ajoutez vos informations fiscales, et téléchargez ou partagez instantanément. Vos clients seront impressionnés par la qualité de vos documents.",
    points: ["PDF haute qualité", "Logo & branding personnalisé", "Numérotation automatique", "Archivage illimité"],
  },
  {
    icon: Store, color: "#f43f5e", bg: "#fff1f2",
    title: "Boutique E-commerce",
    tag: "Disponible",
    desc: "Lancez votre boutique en ligne en quelques clics. Publiez vos produits physiques ou digitaux, gérez votre catalogue, suivez vos commandes et encaissez vos paiements. Une vitrine professionnelle accessible 24h/24 depuis n'importe quel appareil.",
    points: ["Vitrine publique personnalisée", "Gestion des stocks", "Suivi des commandes", "Produits digitaux & physiques"],
  },
  {
    icon: Send, color: "#0ea5e9", bg: "#f0f9ff",
    title: "Transfert d'Argent Africa",
    tag: "Disponible",
    desc: "Envoyez de l'argent partout en Afrique via Mobile Money en quelques secondes. Rechargez votre compte gratuitement, transférez vers 5 pays actifs avec seulement 3% de frais. Des dizaines de réseaux supportés : MTN, Orange, Wave, Moov et bien d'autres.",
    points: ["Recharge 100% gratuite", "5 pays actifs", "3% de frais seulement", "Facture PDF automatique"],
  },
  {
    icon: Home, color: "#8b5cf6", bg: "#f5f3ff",
    title: "Marché Immobilier",
    tag: "Disponible",
    desc: "Publiez et découvrez des biens immobiliers dans toute l'Afrique. Maisons, appartements, terrains, bureaux — achat ou location. Contactez directement les propriétaires, consultez les profils vendeurs vérifiés et négociez en toute sécurité.",
    points: ["Annonces illimitées", "Profil vendeur vérifié", "Photos HD", "Contact direct sécurisé"],
  },
  {
    icon: Lock, color: "#f59e0b", bg: "#fffbeb",
    title: "Coffre-Fort Digital",
    tag: "Disponible",
    desc: "Stockez vos informations personnelles,codes secrets et données confidentielles dans un espace ultra-sécurisé. Chiffrement de bout en bout — même NEXORA n'a pas accès à votre coffre. Votre vie privée est notre priorité absolue.",
    points: ["Chiffrement bout-en-bout", "Mots de passe & documents", "Accès biométrique", "Sauvegarde cloud sécurisée"],
  },
  {
    icon: CreditCard, color: "#ec4899", bg: "#fdf2f8",
    title: "Prêts entre Particuliers",
    tag: "Disponible",
    desc: "Formalisez vos prêts entre amis, famille ou partenaires commerciaux. Créez un contrat de prêt signé électroniquement,le calendrier de remboursement et recevez des rappels automatiques. Fini les malentendus et les dettes oubliées.",
    points: ["Contrats signés électroniquement", "Calendrier de remboursement", "Rappels automatiques", "Suivi des paiements"],
  },
  {
    icon: Wallet, color: "#14b8a6", bg: "#f0fdfa",
    title: "Abonnements & Liens",
    tag: "Disponible",
    desc: "Gérez tous vos abonnements en un seul endroit et ne payez plus jamais pour quelque chose que vous n'utilisez plus. Créez également des liens courts personnalisés pour partager vos réseaux, boutiques et contacts professionnels facilement.",
    points: ["Suivi de tous vos abonnements", "Alertes renouvellement", "Liens courts personnalisés", "Tableau de bord dépenses récurrentes"],
  },
];

const ROADMAP = [
  { title: "Carte NEXORA Virtuelle", desc: "Payez partout dans le monde avec votre carte virtuelle NEXORA. Compatible avec les paiements en ligne internationaux.", status: "soon", pct: 65 },
  { title: "Wallet Multi-devises", desc: "Gérez XOF, GHS, NGN, KES et d'autres devises africaines depuis un seul portefeuille unifié.", status: "soon", pct: 40 },
  { title: "NEXORA Business", desc: "Tableau de bord entreprise avec multi-utilisateurs, rôles, permissions et reporting avancé.", status: "soon", pct: 20 },
  { title: "Expansion 19 pays", desc: "Mali, Burkina, Cameroun, Ghana, Nigéria, Kenya et 13 autres pays africains bientôt disponibles.", status: "soon", pct: 30 },
];

const STATS = [
  { value: "5", label: "Pays actifs", suffix: "" },
  { value: "99.9", label: "Disponibilité", suffix: "%" },
  { value: "8", label: "Modules intégrés", suffix: "" },
  { value: "0", label: "Frais d'inscription", suffix: " FCFA" },
];

const COUNTRIES_ACTIVE = [
  { flag: "🇧🇯", name: "Bénin", networks: "MTN · Moov" },
  { flag: "🇨🇮", name: "Côte d'Ivoire", networks: "Orange · MTN · Wave" },
  { flag: "🇹🇬", name: "Togo", networks: "Flooz · T-Money" },
  { flag: "🇸🇳", name: "Sénégal", networks: "Orange · Wave · Free" },
  { flag: "🇳🇪", name: "Niger", networks: "Airtel · Moov" },
];

const COUNTRIES_SOON = ["🇲🇱 Mali","🇧🇫 Burkina Faso","🇨🇲 Cameroun","🇬🇭 Ghana","🇳🇬 Nigéria","🇰🇪 Kenya","🇹🇿 Tanzanie","🇺🇬 Ouganda","🇷🇼 Rwanda","🇬🇳 Guinée","🇨🇩 RD Congo","🇬🇦 Gabon"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function SectionBadge({ text, color = "#6366f1" }: { text: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
      style={{ background: color + "15", color, border: `1px solid ${color}25` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {text}
    </span>
  );
}

function AnimatedCounter({ value, suffix }: { value: string; suffix: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const ran = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        const target = parseFloat(value);
        let step = 0; const steps = 40;
        const t = setInterval(() => {
          step++;
          const ease = 1 - Math.pow(1 - step / steps, 3);
          const cur = target * ease;
          setDisplay(Number.isInteger(target) ? Math.round(cur).toString() : cur.toFixed(1));
          if (step >= steps) clearInterval(t);
        }, 1200 / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", country: "", text: "" });
  const [reviews, setReviews] = useState([
    { name: "Aïcha Koné", country: "🇧🇯 Bénin", text: "NEXORA m'a permis de gérer ma boutique et mes factures depuis mon téléphone. Un vrai gain de temps au quotidien !", stars: 5 },
    { name: "Eric Mensah", country: "🇨🇮 Côte d'Ivoire", text: "L'interface est intuitive, le module immobilier est génial. Je gère tout mon patrimoine depuis une seule appli.", stars: 5 },
    { name: "Fatou Diallo", country: "🇸🇳 Sénégal", text: "Les factures PDF sont magnifiques, mes clients sont impressionnés. Le transfert d'argent fonctionne parfaitement.", stars: 5 },
  ]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const submitReview = () => {
    if (!reviewForm.name.trim() || !reviewForm.country.trim() || !reviewForm.text.trim()) return;
    setReviews(prev => [{ ...reviewForm, stars: 5 }, ...prev]);
    setReviewForm({ name: "", country: "", text: "" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
        .font-display { font-family: 'Cabinet Grotesk', 'DM Sans', sans-serif; font-weight: 800; }
        h1,h2,h3 { font-family: 'Cabinet Grotesk', 'DM Sans', sans-serif; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        .anim-float { animation: float 5s ease-in-out infinite; }
        .anim-marquee { animation: marquee 30s linear infinite; }
        .anim-fadeup { opacity:0; animation: fadeUp .65s ease forwards; }
        .anim-scalein { animation: scaleIn .4s ease forwards; }
        .card-lift { transition: all .3s cubic-bezier(.4,0,.2,1); }
        .card-lift:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -10px rgba(0,0,0,.12); }
        .grad-text { background: linear-gradient(135deg,#6366f1,#8b5cf6 40%,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .mesh { background: radial-gradient(ellipse at 15% 15%,#eef2ff 0%,transparent 55%), radial-gradient(ellipse at 85% 10%,#fdf2f8 0%,transparent 50%), radial-gradient(ellipse at 85% 85%,#ecfdf5 0%,transparent 50%), #ffffff; }
        .glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        input, textarea { font-family: 'DM Sans', sans-serif; }
        @media(max-width:768px){ h1{font-size:2.5rem !important; line-height:1.1 !important;} h2{font-size:2rem !important;} }
      `}</style>

      {/* ── TOP BANNER ── */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 py-2.5 text-center text-white text-xs font-bold tracking-wide">
        NEXORA Transfert disponible au Bénin, Côte d'Ivoire, Togo, Sénégal et Niger &nbsp;·&nbsp;
        <button onClick={() => navigate("/login")} className="underline underline-offset-2 hover:no-underline">
          Commencer gratuitement →
        </button>
      </div>

      {/* ── NAVBAR ── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass border-b border-gray-100 shadow-sm" : "bg-white/0"}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-3">
            <img src={LOGO} alt="NEXORA" className="w-9 h-9 object-contain" />
            <span className="font-display text-xl tracking-tight text-gray-900">NEXORA</span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7 text-[13.5px] font-semibold text-gray-500">
            {[["features","Fonctionnalités"],["transfert","Transfert"],["roadmap","Roadmap"],["avis","Avis"]].map(([id,label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="hover:text-gray-900 transition-colors">{label}</button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="text-[13.5px] font-semibold text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">
              Connexion
            </button>
            <button onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-[13.5px] font-bold bg-gray-950 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all duration-300 shadow-sm">
              Créer un compte <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden glass border-b border-gray-100 px-6 pb-5 pt-2 flex flex-col gap-1">
            {[["features","Fonctionnalités"],["transfert","Transfert Africa"],["roadmap","Roadmap"],["avis","Avis"]].map(([id,label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-left px-3 py-2.5 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                {label}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-3 flex gap-2">
              <button onClick={() => navigate("/login")} className="flex-1 py-2.5 text-sm font-bold border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">Connexion</button>
              <button onClick={() => navigate("/login")} className="flex-1 py-2.5 text-sm font-bold bg-gray-950 text-white rounded-xl hover:bg-indigo-600 transition-colors">Créer un compte</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="mesh relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-pink-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-violet-200/25 blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 md:px-8 pt-14 pb-20 md:pt-20 md:pb-28">
          {/* Badge */}
          <div className="flex justify-center mb-7">
            <div className="anim-fadeup inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-md text-xs font-black text-indigo-600 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Plateforme financière tout-en-un · Afrique
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-black">NOUVEAU</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="anim-fadeup text-[3.2rem] md:text-[5.5rem] font-black tracking-tight leading-[1.04] mb-7 text-gray-950"
              style={{ animationDelay: ".08s" }}>
              Gérez votre<br />
              <span className="grad-text">argent, boutique</span><br />
              <span>et vos factures</span>
            </h1>

            <p className="anim-fadeup text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
              style={{ animationDelay: ".18s" }}>
              NEXORA réunit la gestion financière, la facturation, l'e-commerce, l'immobilier, les prêts et le transfert d'argent dans une seule application moderne, sécurisée et conçue pour l'Afrique.
            </p>

            {/* CTAs */}
            <div className="anim-fadeup flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
              style={{ animationDelay: ".28s" }}>
              <button onClick={() => navigate("/login")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-[15px] px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95">
                Commencer gratuitement <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setVideoOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 text-gray-700 font-semibold text-[15px] px-7 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
                Voir la démo
              </button>
            </div>

            {/* Trust badges */}
            <div className="anim-fadeup flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-gray-400 font-medium" style={{ animationDelay: ".38s" }}>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Données chiffrées</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-200" />
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> 99.9% disponibilité</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-200" />
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-indigo-500" /> 5 pays actifs</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-200" />
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-pink-500" /> Inscription gratuite</span>
            </div>
          </div>

          {/* Floating cards */}
          <div className="anim-fadeup mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto" style={{ animationDelay: ".5s" }}>
            {[
              { icon: Wallet, label: "Solde total", value: "842 500 FCFA", color: "#6366f1" },
              { icon: TrendingUp, label: "Ce mois", value: "+127 400 FCFA", color: "#10b981" },
              { icon: FileText, label: "Factures", value: "24 créées", color: "#f59e0b" },
              { icon: Send, label: "Transferts", value: "5 pays actifs", color: "#0ea5e9" },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-xl border border-gray-50 anim-float" style={{ animationDelay: `${i * 0.4}s` }}>
                  <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center" style={{ background: c.color + "18" }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: c.color }} />
                  </div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{c.label}</p>
                  <p className="font-black text-[13px] text-gray-900 leading-tight">{c.value}</p>
                </div>
              );
            })}
          </div>

          {/* Photo de la plateforme */}
          <div className="anim-fadeup mt-12 max-w-5xl mx-auto" style={{ animationDelay: ".6s" }}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
                alt="Dashboard NEXORA"
                className="w-full h-64 md:h-96 object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent flex items-end p-8">
                <div className="text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Interface NEXORA</p>
                  <p className="font-black text-xl">Votre tableau de bord financier</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO MODAL ── */}
      {videoOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 anim-scalein" onClick={() => setVideoOpen(false)}>
          <div className="w-full max-w-4xl bg-gray-950 rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <p className="text-white font-bold">Présentation NEXORA</p>
              <button onClick={() => setVideoOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white/50">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm font-semibold">Vidéo de présentation</p>
                <p className="text-xs mt-1 opacity-60">Remplacez ceci par votre iframe vidéo YouTube ou Vimeo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── OPÉRATEURS MARQUEE ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-4 overflow-hidden">
        <p className="text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Opérateurs Mobile Money supportés</p>
        <div className="relative overflow-hidden">
          <div className="anim-marquee flex gap-10 whitespace-nowrap">
            {[...OPERATORS,...OPERATORS].map((op, i) => (
              <span key={i} className="flex-shrink-0 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 shadow-sm">
                {op.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gray-950 py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="font-display text-4xl md:text-6xl font-black text-white mb-2">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-gray-400 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="text-center mb-16">
          <SectionBadge text="8 Modules complets" />
          <h2 className="text-4xl md:text-5xl font-black mt-5 mb-4 text-gray-950">Tout ce dont vous avez besoin,<br />dans une seule app</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">Chaque module est conçu pour vous faire gagner du temps et de l'argent. Aucun abonnement requis pour commencer.</p>
        </div>

        <div className="space-y-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className={`card-lift group rounded-3xl border border-gray-100 overflow-hidden cursor-pointer ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                onClick={() => navigate("/login")}>
                <div className="flex flex-col md:flex-row">
                  {/* Left */}
                  <div className="md:w-2/5 p-8 md:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: f.bg }}>
                        <Icon className="w-7 h-7" style={{ color: f.color }} />
                      </div>
                      <span className="text-xs font-black px-3 py-1 rounded-full" style={{ background: "#dcfce7", color: "#15803d" }}>
                        ✓ {f.tag}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-gray-950">{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">{f.desc}</p>
                    <div className="flex items-center gap-2 text-sm font-bold transition-all" style={{ color: f.color }}>
                      Accéder au module <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Right — points */}
                  <div className="md:w-3/5 p-8 md:p-10 flex items-center" style={{ background: f.bg + "60" }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      {f.points.map((pt, j) => (
                        <div key={j} className="flex items-start gap-3 bg-white/70 rounded-2xl p-4">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: f.color }} />
                          <span className="text-sm font-semibold text-gray-700">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── PHOTOS SECTION ── */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pb-20">
        <div className="text-center mb-12">
          <SectionBadge text="Interface" color="#10b981" />
          <h2 className="text-3xl md:text-4xl font-black mt-5 mb-3">Une expérience pensée pour l'Afrique</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Design moderne, rapide et optimisé pour mobile.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-3xl overflow-hidden h-64 md:h-80 relative card-lift">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80" alt="Commerce Afrique" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="font-black text-lg">Boutique & Commerce</p>
                <p className="text-sm text-white/70">Vendez en ligne en quelques minutes</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden h-64 md:h-80 relative card-lift">
            <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80" alt="Finance Mobile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="font-black text-lg">Finances Mobile</p>
                <p className="text-sm text-white/70">Gérez tout depuis votre téléphone</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden h-56 md:h-64 relative card-lift">
            <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80" alt="Transfert Argent" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="font-black">Transfert d'Argent</p>
                <p className="text-sm text-white/70">5 pays, Mobile Money</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden h-56 md:h-64 relative card-lift">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80" alt="Immobilier" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="font-black">Marché Immobilier</p>
                <p className="text-sm text-white/70">Achat, location, investissement</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden h-56 md:h-64 relative card-lift">
            <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80" alt="Factures" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="font-black">Facturation Pro</p>
                <p className="text-sm text-white/70">PDF professionnels en 1 min</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSFERT ── */}
      <section id="transfert" className="bg-gray-950 py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div>
              <SectionBadge text="Transfert Africa" color="#0ea5e9" />
              <h2 className="text-4xl md:text-5xl font-black text-white mt-5 mb-5 leading-tight">
                Un continent,<br /><span style={{ color: "#38bdf8" }}>une infrastructure.</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Rechargez votre compte gratuitement via Mobile Money et envoyez de l'argent vers 5 pays africains avec seulement 3% de frais. Rapide, sécurisé, et disponible 24h/24.
              </p>

              {/* Pays actifs */}
              <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3">✓ Disponibles maintenant</p>
              <div className="grid grid-cols-1 gap-2 mb-6">
                {COUNTRIES_ACTIVE.map(c => (
                  <div key={c.name} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <span className="text-2xl">{c.flag}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{c.name}</p>
                      <p className="text-gray-400 text-xs">{c.networks}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pays bientôt */}
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">🔒 Bientôt disponibles</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {COUNTRIES_SOON.map(c => (
                  <span key={c} className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-gray-400">{c}</span>
                ))}
              </div>

              <button onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-sky-500/30 hover:scale-105 transition-all">
                Accéder au Transfert <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right — widget */}
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-7 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <img src={LOGO} alt="NEXORA" className="w-8 h-8 object-contain" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Nexora Transfert</p>
                    <p className="text-white font-black text-sm">Compte principal</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Solde disponible</p>
                  <p className="text-4xl font-black text-white">125 000 <span className="text-gray-400 text-xl">FCFA</span></p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-emerald-500 rounded-xl py-3 text-center font-black text-white text-sm flex items-center justify-center gap-1.5">
                    <ArrowDownLeft className="w-4 h-4" /> Recharger
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-xl py-3 text-center font-black text-white text-sm flex items-center justify-center gap-1.5">
                    <Send className="w-4 h-4" /> Envoyer
                  </div>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Dernières transactions</p>
                <div className="space-y-2">
                  {[
                    { flag:"🇸🇳", pays:"Sénégal", reseau:"Wave", montant:"20 000", t:"out" },
                    { flag:"🇧🇯", pays:"Recharge", reseau:"MTN MoMo", montant:"50 000", t:"in" },
                    { flag:"🇨🇮", pays:"Côte d'Ivoire", reseau:"Orange Money", montant:"15 000", t:"out" },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
                      <span className="text-lg">{tx.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold">{tx.pays}</p>
                        <p className="text-gray-500 text-[11px]">{tx.reseau}</p>
                      </div>
                      <span className={`font-black text-xs ${tx.t==="in"?"text-emerald-400":"text-sky-300"}`}>
                        {tx.t==="in"?"+":"−"}{tx.montant} FCFA
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-black">
                ✓ Paiement sécurisé
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section id="roadmap" className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="text-center mb-14">
          <SectionBadge text="Roadmap publique" color="#8b5cf6" />
          <h2 className="text-4xl md:text-5xl font-black mt-5 mb-4 text-gray-950">Ce qui arrive bientôt</h2>
          <p className="text-gray-500 max-w-md mx-auto text-lg">NEXORA grandit avec vous. Voici ce que nous construisons pour vous.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ROADMAP.map((item, i) => (
            <div key={i} className="card-lift bg-gray-50 border border-gray-100 rounded-3xl p-7">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                  <Clock className="w-3 h-3" /> Bientôt
                </span>
              </div>
              <h3 className="text-xl font-black mb-2 text-gray-950">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{item.desc}</p>
              <div className="flex justify-between text-xs text-gray-400 font-bold mb-2">
                <span>Progression</span><span>{item.pct}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SÉCURITÉ ── */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12">
            <SectionBadge text="Sécurité & Confiance" color="#10b981" />
            <h2 className="text-3xl md:text-4xl font-black mt-5 mb-4">Construit pour inspirer confiance</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Vos données et votre argent sont notre priorité absolue.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: ShieldCheck, color: "#10b981", title: "Chiffrement bout-en-bout", desc: "Toutes vos données financières et personnelles sont chiffrées (AES-256 au repos, TLS 1.3 en transit). Votre coffre-fort digital est inaccessible même pour nos équipes." },
              { icon: Zap, color: "#6366f1", title: "99.9% de disponibilité", desc: "Infrastructure robuste hébergée sur des serveurs certifiés avec redondance et sauvegardes automatiques. NEXORA est disponible quand vous en avez besoin." },
              { icon: Users, color: "#f59e0b", title: "Données vous appartiennent", desc: "Nous ne vendons jamais vos données. Exportez tout à tout moment. Supprimez votre compte quand vous le souhaitez. Vous êtes toujours en contrôle." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-3xl p-8 border border-white shadow-lg text-center card-lift">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: item.color + "15" }}>
                    <Icon className="w-8 h-8" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-black text-lg mb-3 text-gray-950">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── AVIS ── */}
      <section id="avis" className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="text-center mb-14">
          <SectionBadge text="Avis utilisateurs" color="#f43f5e" />
          <h2 className="text-4xl md:text-5xl font-black mt-5 mb-4 text-gray-950">Ce que disent<br />nos utilisateurs</h2>
          <p className="text-gray-500 max-w-md mx-auto text-lg">Des retours réels d'entrepreneurs africains.</p>
        </div>

        {/* Grille d'avis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {reviews.map((r, i) => (
            <div key={i} className="card-lift bg-white border border-gray-100 rounded-3xl p-7">
              <div className="flex gap-1 mb-4">
                {[...Array(r.stars)].map((_,j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-gray-700 text-[15px] leading-relaxed mb-6 italic">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-md">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-sm text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire d'avis */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-8 md:p-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg text-gray-950">Partagez votre avis</h3>
              <p className="text-xs text-gray-500">Votre retour aide d'autres utilisateurs</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Nom complet *</label>
                <input
                  type="text"
                  value={reviewForm.name}
                  onChange={e => setReviewForm(p => ({...p, name: e.target.value}))}
                  placeholder="Ex : Kouassi Jean"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Pays *</label>
                <input
                  type="text"
                  value={reviewForm.country}
                  onChange={e => setReviewForm(p => ({...p, country: e.target.value}))}
                  placeholder="Ex : 🇧🇯 Bénin"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Votre avis *</label>
              <textarea
                rows={4}
                value={reviewForm.text}
                onChange={e => setReviewForm(p => ({...p, text: e.target.value}))}
                placeholder="Partagez votre expérience avec NEXORA..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>

            <button
              onClick={submitReview}
              disabled={!reviewForm.name || !reviewForm.country || !reviewForm.text}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              <Star className="w-4 h-4 fill-white" /> Publier mon avis
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pb-20">
        <div className="relative bg-gray-950 rounded-3xl overflow-hidden py-16 md:py-24 px-8 md:px-16 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 left-1/4 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-black text-white mb-8 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Inscription gratuite · Sans carte bancaire
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
              Prêt à transformer<br />votre gestion financière ?
            </h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10">
              Rejoignez des milliers d'entrepreneurs africains qui font confiance à NEXORA chaque jour.
            </p>
            <button onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 bg-white text-gray-950 font-black px-10 py-4 rounded-2xl text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 active:scale-95">
              Commencer maintenant <ArrowRight className="w-5 h-5" />
            </button>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
              {[
                { icon: ShieldCheck, label: "100% sécurisé" },
                { icon: Globe, label: "5 pays actifs" },
                { icon: Users, label: "Inscription gratuite" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                    <Icon className="w-4 h-4" /> {item.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-14 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={LOGO} alt="NEXORA" className="w-10 h-10 object-contain" />
                <span className="font-display text-xl font-black text-white tracking-tight">NEXORA</span>
              </div>
              <p className="text-sm leading-relaxed mb-6 max-w-xs text-gray-500">
                La plateforme financière tout-en-un pour les entrepreneurs et particuliers africains. Gestion, facturation, commerce, transferts et bien plus.
              </p>
              {/* Réseaux sociaux */}
              <div className="flex items-center gap-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-all hover:scale-110">
                  <Facebook className="w-4 h-4 text-white" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-black flex items-center justify-center transition-all hover:scale-110">
                  <Twitter className="w-4 h-4 text-white" />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#ff0050] flex items-center justify-center transition-all hover:scale-110">
                  <svg className="w-4 h-4 text-white fill-white" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z"/></svg>
                </a>
              </div>
            </div>

            {/* Produit */}
            <div>
              <p className="text-white font-black text-sm mb-5 uppercase tracking-wider">Modules</p>
              <div className="flex flex-col gap-3">
                {["Gestion Financière","Facturation","Boutique E-commerce","Transfert d'Argent","Immobilier","Coffre-Fort","Prêts","Abonnements"].map(l => (
                  <button key={l} onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-white text-left transition-colors">{l}</button>
                ))}
              </div>
            </div>

            {/* Ressources */}
            <div>
              <p className="text-white font-black text-sm mb-5 uppercase tracking-wider">Ressources</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-white text-left transition-colors">Connexion</button>
                <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-white text-left transition-colors">Créer un compte</button>
                <button onClick={() => scrollTo("avis")} className="text-sm text-gray-500 hover:text-white text-left transition-colors">Témoignages</button>
                <button onClick={() => scrollTo("roadmap")} className="text-sm text-gray-500 hover:text-white text-left transition-colors">Roadmap</button>
                <a href="mailto:support@nexora.africa" className="text-sm text-gray-500 hover:text-white text-left transition-colors">Support</a>
              </div>
            </div>

            {/* Légal */}
            <div>
              <p className="text-white font-black text-sm mb-5 uppercase tracking-wider">Légal</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => navigate("/cgu")} className="text-sm text-gray-500 hover:text-white text-left transition-colors">Conditions d'utilisation</button>
                <button onClick={() => navigate("/confidentialite")} className="text-sm text-gray-500 hover:text-white text-left transition-colors">Politique de confidentialité</button>
                <span className="text-sm text-gray-600">support@nexora.africa</span>
              </div>

              {/* Pays actifs */}
              <div className="mt-6">
                <p className="text-white font-black text-xs mb-3 uppercase tracking-wider">Pays actifs</p>
                <div className="flex flex-wrap gap-1.5">
                  {["🇧🇯","🇨🇮","🇹🇬","🇸🇳","🇳🇪"].map((f,i) => (
                    <span key={i} className="text-lg">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} NEXORA. Tous droits réservés.</p>
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center text-xs text-gray-600">
              <button onClick={() => navigate("/cgu")} className="hover:text-white transition-colors whitespace-nowrap">CGU</button>
              <button onClick={() => navigate("/confidentialite")} className="hover:text-white transition-colors whitespace-nowrap">Confidentialité</button>
              <span className="flex items-center gap-1.5 whitespace-nowrap"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Paiements sécurisés</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
