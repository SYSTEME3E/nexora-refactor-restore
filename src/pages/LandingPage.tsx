import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, ChevronRight, Zap, ShieldCheck, Globe,
  BarChart3, Receipt, Store, Home, Lock, Send,
  Star, Check, TrendingUp, Users, FileText,
  Smartphone, CreditCard, Wallet, Building2,
  ChevronDown, Menu, X, Sparkles
} from "lucide-react";

// ── DONNÉES ──────────────────────────────────────────────

const OPERATORS = [
  { name: "MTN MoMo",     logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/New-mtn-logo.jpg/220px-New-mtn-logo.jpg" },
  { name: "Orange Money", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Orange_logo.svg/120px-Orange_logo.svg.png" },
  { name: "Moov Money",   logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Moov_Africa_logo.svg/200px-Moov_Africa_logo.svg.png" },
  { name: "Wave",         logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Wave_logo_%282023%29.png/200px-Wave_logo_%282023%29.png" },
  { name: "M-Pesa",       logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/M-pesa.jpg/200px-M-pesa.jpg" },
  { name: "Airtel Money", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Airtel_logo.svg/200px-Airtel_logo.svg.png" },
];

const FEATURES = [
  { icon: BarChart3, title: "Gestion Financière", desc: "Pilotez vos entrées, dépenses et votre historique financier avec des graphiques clairs et en temps réel.", color: "#6366f1", bg: "#eef2ff", tag: "Disponible" },
  { icon: Receipt, title: "Facturation Pro", desc: "Générez des factures PDF professionnelles avec votre branding en quelques secondes.", color: "#10b981", bg: "#ecfdf5", tag: "Disponible" },
  { icon: Store, title: "Boutique E-commerce", desc: "Vendez vos produits physiques et digitaux. Gérez commandes, stocks et paiements.", color: "#f43f5e", bg: "#fff1f2", tag: "Disponible" },
  { icon: Send, title: "Transfert d'Argent", desc: "Envoyez de l'argent dans toute l'Afrique via Mobile Money en quelques secondes.", color: "#0ea5e9", bg: "#f0f9ff", tag: "Disponible" },
  { icon: Home, title: "Marché Immobilier", desc: "Publiez, trouvez et gérez des biens immobiliers. Achat, location, investissement.", color: "#8b5cf6", bg: "#f5f3ff", tag: "Disponible" },
  { icon: Lock, title: "Coffre-Fort Digital", desc: "Stockez et chiffrez vos mots de passe, documents et données sensibles en sécurité.", color: "#f59e0b", bg: "#fffbeb", tag: "Disponible" },
];

const ROADMAP = [
  { title: "Prêts entre Particuliers", desc: "Accordez ou demandez des prêts avec contrat signé électroniquement.", status: "live", pct: 100 },
  { title: "Abonnements & SaaS", desc: "Gérez vos abonnements et ceux de vos clients.", status: "live", pct: 100 },
  { title: "Investissements", desc: "Suivez votre portefeuille d'investissements en temps réel.", status: "live", pct: 100 },
  { title: "Carte Nexora Virtuelle", desc: "Payez partout dans le monde avec votre carte virtuelle Nexora.", status: "soon", pct: 65 },
  { title: "Wallet Multi-devises", desc: "Gérez plusieurs devises africaines depuis un seul portefeuille.", status: "soon", pct: 40 },
  { title: "Nexora Business", desc: "Tableau de bord dédié aux entreprises avec multi-utilisateurs et rôles.", status: "soon", pct: 20 },
];

const STATS = [
  { value: "24", label: "Pays africains", suffix: "" },
  { value: "99.9", label: "Disponibilité", suffix: "%" },
  { value: "6", label: "Modules intégrés", suffix: "" },
  { value: "0", label: "Frais d'inscription", suffix: " FCFA" },
];

const TESTIMONIALS = [
  { name: "Aïcha K.", role: "Commerçante, Cotonou", text: "NEXORA m'a permis de gérer ma boutique et mes factures depuis mon téléphone. Je gagne un temps précieux chaque jour.", stars: 5 },
  { name: "Eric M.", role: "Investisseur, Abidjan", text: "L'interface est intuitive et le module immobilier est une fonctionnalité géniale. Je gère tout mon patrimoine ici.", stars: 5 },
  { name: "Fatou D.", role: "Freelance, Dakar", text: "Les factures PDF sont magnifiques et mes clients sont bluffés. Le transfert d'argent fonctionne parfaitement.", stars: 5 },
];

const COUNTRIES_ACTIVE = ["🇧🇯 Bénin", "🇨🇮 Côte d'Ivoire", "🇹🇬 Togo", "🇸🇳 Sénégal", "🇳🇪 Niger"];
const COUNTRIES_SOON = ["🇲🇱 Mali", "🇧🇫 Burkina Faso", "🇨🇲 Cameroun", "🇬🇭 Ghana", "🇳🇬 Nigéria", "🇰🇪 Kenya", "🇹🇿 Tanzanie", "🇺🇬 Ouganda", "🇷🇼 Rwanda"];

// ── COMPOSANTS HELPER ─────────────────────────────────────

function Badge({ text, color = "#6366f1" }: { text: string; color?: string }) {
  return (
    <span style={{ background: color + "18", color, border: `1px solid ${color}30` }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
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
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        const target = parseFloat(value);
        const duration = 1200;
        const steps = 40;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = target * ease;
          setDisplay(Number.isInteger(target) ? Math.round(current).toString() : current.toFixed(1));
          if (step >= steps) clearInterval(timer);
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <div ref={ref}>{display}{suffix}</div>;
}

// ── PAGE PRINCIPALE ───────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif" }}>

      {/* ── GOOGLE FONTS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 #6366f140} 70%{box-shadow:0 0 0 12px #6366f100} 100%{box-shadow:0 0 0 0 #6366f100} }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-marquee { animation: marquee 28s linear infinite; }
        .animate-fadeup { animation: fadeUp 0.6s ease forwards; }
        .animate-pulse-ring { animation: pulse-ring 2s infinite; }
        .card-hover { transition: all 0.3s cubic-bezier(.4,0,.2,1); }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 24px 48px -12px rgba(0,0,0,.12); }
        .gradient-text { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #f43f5e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .mesh-bg { background: radial-gradient(at 20% 20%, #eef2ff 0%, transparent 50%), radial-gradient(at 80% 0%, #fdf2f8 0%, transparent 50%), radial-gradient(at 80% 80%, #ecfdf5 0%, transparent 50%), #fff; }
      `}</style>

      {/* ── ANNONCE BANNER ── */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-center py-2.5 text-xs font-semibold tracking-wide">
        <span className="opacity-80">🚀 NEXORA Transfert est maintenant disponible au Bénin, Côte d'Ivoire, Togo, Sénégal et Niger</span>
        <button onClick={() => navigate("/login")} className="ml-3 underline font-bold opacity-100">Commencer →</button>
      </div>

      {/* ── NAVBAR ── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm font-display">N</span>
            </div>
            <span className="font-black text-xl tracking-tight font-display">NEXORA</span>
          </div>

          {/* Nav links desktop */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <button onClick={() => scrollTo("features")} className="hover:text-gray-900 transition-colors">Fonctionnalités</button>
            <button onClick={() => scrollTo("transfert")} className="hover:text-gray-900 transition-colors">Transfert</button>
            <button onClick={() => scrollTo("roadmap")} className="hover:text-gray-900 transition-colors">Roadmap</button>
            <button onClick={() => scrollTo("temoignages")} className="hover:text-gray-900 transition-colors">Avis</button>
          </div>

          {/* CTA desktop */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors">Connexion</button>
            <button onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-sm font-bold bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all duration-300 shadow-sm">
              Créer un compte <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 flex flex-col gap-3 text-sm font-semibold text-gray-700">
            <button onClick={() => scrollTo("features")} className="text-left py-1">Fonctionnalités</button>
            <button onClick={() => scrollTo("transfert")} className="text-left py-1">Transfert</button>
            <button onClick={() => scrollTo("roadmap")} className="text-left py-1">Roadmap</button>
            <button onClick={() => scrollTo("temoignages")} className="text-left py-1">Avis</button>
            <hr className="border-gray-100" />
            <button onClick={() => navigate("/login")} className="text-left py-1 text-indigo-600 font-bold">Connexion / Créer un compte →</button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="mesh-bg relative overflow-hidden">
        {/* Déco blobs */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-purple-100/60 blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-40 h-40 rounded-full bg-pink-100/50 blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="text-center max-w-4xl mx-auto">

            {/* Badge */}
            <div className="animate-fadeup inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm text-xs font-bold text-indigo-600 mb-8">
              <Zap className="w-3.5 h-3.5" />
              Plateforme financière tout-en-un pour l'Afrique
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px]">NOUVEAU</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-fadeup" style={{ animationDelay: "0.1s" }}>
              Gérez votre<br />
              <span className="gradient-text">argent, boutique</span><br />
              et vos factures
            </h1>

            <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeup" style={{ animationDelay: "0.2s" }}>
              NEXORA réunit la gestion financière, la facturation, l'e-commerce, l'immobilier et le transfert d'argent dans une application unique, moderne et sécurisée.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeup" style={{ animationDelay: "0.3s" }}>
              <button onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/25 transition-all text-base hover:scale-105 active:scale-95">
                Commencer gratuitement <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => scrollTo("features")}
                className="flex items-center gap-2 text-gray-600 font-semibold px-6 py-4 rounded-2xl border border-gray-200 hover:border-gray-300 bg-white shadow-sm transition-all hover:shadow-md">
                Découvrir les modules <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center justify-center gap-6 text-sm text-gray-400 animate-fadeup" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Données chiffrées</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>99.9% disponibilité</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>24 pays africains</span>
              </div>
            </div>
          </div>

          {/* Hero visual cards */}
          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fadeup" style={{ animationDelay: "0.5s" }}>
            {[
              { icon: Wallet, label: "Solde", value: "842 500 FCFA", color: "#6366f1" },
              { icon: TrendingUp, label: "Ce mois", value: "+ 127 400", color: "#10b981" },
              { icon: FileText, label: "Factures", value: "24 créées", color: "#f59e0b" },
              { icon: Send, label: "Transferts", value: "5 pays", color: "#0ea5e9" },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-50 animate-float"
                  style={{ animationDelay: `${i * 0.3}s` }}>
                  <div className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center" style={{ background: card.color + "18" }}>
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <p className="text-[11px] text-gray-400 font-semibold mb-0.5">{card.label}</p>
                  <p className="font-black text-sm text-gray-900">{card.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── OPÉRATEURS (MARQUEE) ── */}
      <section className="border-y border-gray-100 py-5 overflow-hidden bg-gray-50/50">
        <div className="flex items-center gap-3 mb-3 justify-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Opérateurs supportés</span>
        </div>
        <div className="relative overflow-hidden">
          <div className="animate-marquee flex gap-12 items-center whitespace-nowrap">
            {[...OPERATORS, ...OPERATORS].map((op, i) => (
              <div key={i} className="flex items-center gap-2.5 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                  <img src={op.logo} alt={op.name} className="w-6 h-6 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
                <span className="text-sm font-semibold text-gray-600">{op.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="font-display text-4xl md:text-5xl font-black text-white mb-2">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-gray-400 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <Badge text="Modules" />
          <h2 className="font-display text-4xl md:text-5xl font-black mt-4 mb-4">Tout ce dont vous<br />avez besoin</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-lg">Six modules complets, intégrés et accessibles depuis une seule application.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card-hover group bg-white border border-gray-100 rounded-3xl p-8 cursor-pointer"
                onClick={() => navigate("/login")}>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: f.bg }}>
                    <Icon className="w-7 h-7" style={{ color: f.color }} />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#dcfce7", color: "#16a34a" }}>
                    ✓ {f.tag}
                  </span>
                </div>
                <h3 className="font-display text-xl font-black mb-2.5">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                <div className="flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: f.color }}>
                  Accéder <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION TRANSFERT ── */}
      <section id="transfert" className="bg-gray-950 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <Badge text="Transfert d'argent" color="#0ea5e9" />
              <h2 className="font-display text-4xl md:text-5xl font-black text-white mt-4 mb-5 leading-tight">
                Un continent,<br />
                <span style={{ color: "#0ea5e9" }}>une infrastructure.</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                NEXORA Transfert vous permet d'envoyer de l'argent partout en Afrique via Mobile Money. Recharge sans frais, transferts rapides avec 3% de commission.
              </p>

              {/* Pays actifs */}
              <div className="mb-6">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">✓ Disponibles maintenant</p>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES_ACTIVE.map(c => (
                    <span key={c} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-semibold text-emerald-400">{c}</span>
                  ))}
                </div>
              </div>

              {/* Pays bientôt */}
              <div className="mb-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">🔒 Bientôt disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES_SOON.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-xl text-xs font-medium text-gray-400">{c}</span>
                  ))}
                </div>
              </div>

              <button onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold px-7 py-3.5 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-sky-500/30">
                Accéder au Transfert <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right — Carte widget */}
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl">
                {/* Header carte */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Solde disponible</p>
                    <div className="text-4xl font-black text-white">125 000 <span className="text-xl text-gray-400">FCFA</span></div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center">
                    <Send className="w-6 h-6 text-sky-400" />
                  </div>
                </div>

                {/* Boutons */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-emerald-500 rounded-xl py-3 text-center font-black text-white text-sm">+ Recharger</div>
                  <div className="bg-white/10 border border-white/20 rounded-xl py-3 text-center font-black text-white text-sm">→ Envoyer</div>
                </div>

                {/* Transaction list */}
                <div className="space-y-3">
                  {[
                    { flag: "🇸🇳", pays: "Sénégal", reseau: "Wave", montant: "20 000", type: "out" },
                    { flag: "🇧🇯", pays: "Recharge", reseau: "MTN MoMo", montant: "50 000", type: "in" },
                    { flag: "🇨🇮", pays: "Côte d'Ivoire", reseau: "Orange Money", montant: "15 000", type: "out" },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                      <span className="text-xl">{tx.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{tx.pays}</p>
                        <p className="text-xs text-gray-400">{tx.reseau}</p>
                      </div>
                      <span className={`font-black text-sm ${tx.type === "in" ? "text-emerald-400" : "text-sky-400"}`}>
                        {tx.type === "in" ? "+" : "−"}{tx.montant} FCFA
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badge flottant */}
              <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-black animate-pulse-ring">
                ✓ Paiement réel via KKIAPAY
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section id="roadmap" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <Badge text="Roadmap publique" color="#8b5cf6" />
          <h2 className="font-display text-4xl md:text-5xl font-black mt-4 mb-4">Construit pour vous,<br />avec vous.</h2>
          <p className="text-gray-500 max-w-md mx-auto text-lg">Découvrez les fonctionnalités disponibles et celles qui arrivent prochainement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROADMAP.map((item, i) => (
            <div key={i} className={`rounded-3xl p-6 border ${item.status === "live" ? "bg-white border-gray-100 card-hover" : "bg-gray-50 border-gray-100"}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  item.status === "live"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-amber-50 text-amber-600 border border-amber-100"
                }`}>
                  {item.status === "live" ? "✓ Disponible" : "⏳ Bientôt"}
                </span>
              </div>
              <h3 className="font-display font-black text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{item.desc}</p>
              {item.status !== "live" && (
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Progression</span>
                    <span className="font-bold">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── SÉCURITÉ ── */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge text="Sécurité & Fiabilité" color="#10b981" />
            <h2 className="font-display text-3xl md:text-4xl font-black mt-4 mb-4">Construit pour inspirer confiance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Données chiffrées", desc: "Toutes vos données financières et personnelles sont chiffrées de bout en bout.", color: "#10b981" },
              { icon: Zap, title: "99.9% de disponibilité", desc: "Infrastructure robuste pour que NEXORA soit toujours disponible quand vous en avez besoin.", color: "#6366f1" },
              { icon: CreditCard, title: "Paiements sécurisés", desc: "Intégration KKIAPAY certifiée pour des transactions Mobile Money 100% sécurisées.", color: "#f59e0b" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-3xl p-8 border border-white shadow-sm text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: item.color + "18" }}>
                    <Icon className="w-7 h-7" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-display font-black text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section id="temoignages" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <Badge text="Témoignages" color="#f43f5e" />
          <h2 className="font-display text-4xl md:text-5xl font-black mt-4 mb-4">Ce que disent<br />nos utilisateurs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card-hover bg-white border border-gray-100 rounded-3xl p-8">
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 text-base leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm font-display shadow-md">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-12 md:p-20 text-center">
          {/* Blobs déco */}
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white mb-8">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Inscription gratuite · Aucune carte requise
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
              Prêt à transformer<br />votre gestion financière ?
            </h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10">
              Rejoignez des milliers d'entrepreneurs africains qui font confiance à NEXORA.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-white text-gray-900 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 active:scale-95">
                Commencer maintenant <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mini stats */}
            <div className="mt-10 flex items-center justify-center gap-8 flex-wrap">
              {[
                { icon: Users, label: "Utilisateurs actifs" },
                { icon: Globe, label: "24 pays africains" },
                { icon: ShieldCheck, label: "100% sécurisé" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-black text-sm font-display">N</span>
                </div>
                <span className="font-black text-xl tracking-tight font-display">NEXORA</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                L'orchestrateur financier qui réunit gestion, facturation, commerce et transfert d'argent pour les entrepreneurs africains.
              </p>
            </div>

            {/* Liens */}
            <div>
              <p className="font-bold text-sm mb-4 text-gray-900">Produit</p>
              <div className="flex flex-col gap-2.5">
                {["Gestion financière", "Facturation", "Boutique", "Transfert", "Immobilier", "Coffre-fort"].map(l => (
                  <button key={l} onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-gray-900 text-left transition-colors">{l}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-bold text-sm mb-4 text-gray-900">Ressources</p>
              <div className="flex flex-col gap-2.5">
                {["Connexion", "Créer un compte", "Support", "CGU", "Confidentialité"].map(l => (
                  <button key={l} onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-gray-900 text-left transition-colors">{l}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} NEXORA. Tous droits réservés.</p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-gray-500">Paiements sécurisés par KKIAPAY</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
