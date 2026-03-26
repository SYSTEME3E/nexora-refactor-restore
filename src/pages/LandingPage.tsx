import { useNavigate } from "react-router-dom";
import {
  Zap, ShieldCheck, Store, Home, ArrowRight, BarChart3,
  Receipt, Lock, Globe, ChevronRight, Star
} from "lucide-react";

const FEATURES = [
  { icon: BarChart3, title: "Gestion Financière", desc: "Suivez vos entrées, dépenses et votre historique en un clic.", color: "from-blue-500 to-indigo-600" },
  { icon: Receipt, title: "Factures Pro", desc: "Créez et téléchargez des factures PDF professionnelles avec branding NEXORA.", color: "from-emerald-500 to-teal-600" },
  { icon: Store, title: "Boutique E-commerce", desc: "Vendez vos produits physiques et digitaux en ligne.", color: "from-pink-500 to-rose-600" },
  { icon: Home, title: "Marché Immobilier", desc: "Publiez et trouvez des biens immobiliers facilement.", color: "from-purple-500 to-violet-600" },
  { icon: Lock, title: "Coffre-Fort", desc: "Stockez vos mots de passe et données sensibles en sécurité.", color: "from-amber-500 to-orange-600" },
  { icon: Globe, title: "Transfert d'Argent", desc: "Envoyez de l'argent dans toute l'Afrique via Mobile Money.", color: "from-cyan-500 to-blue-600" },
];

const TESTIMONIALS = [
  { name: "Aïcha K.", role: "Commerçante", text: "NEXORA m'a permis de gérer ma boutique et mes factures depuis mon téléphone. Un vrai gain de temps !" },
  { name: "Eric M.", role: "Investisseur", text: "L'interface est intuitive et le marché immobilier est une fonctionnalité géniale pour trouver des biens." },
  { name: "Fatou D.", role: "Freelance", text: "Les factures PDF sont magnifiques et professionnelles. Mes clients sont impressionnés." },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">N</span>
            </div>
            <span className="font-black text-xl tracking-tight">NEXORA</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2">Connexion</button>
            <button onClick={() => navigate("/login")} className="text-sm font-bold bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors">Créer un compte</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 mb-6">
            <Zap className="w-3.5 h-3.5" /> Plateforme tout-en-un pour l'Afrique
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6">
            Gérez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">argent</span>,<br />
            votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">boutique</span> et vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">factures</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            NEXORA regroupe la gestion financière, la facturation, l'e-commerce et l'immobilier dans une seule application moderne et accessible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate("/login")} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all text-lg">
              Commencer gratuitement <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-2 text-gray-600 font-semibold px-6 py-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
              Découvrir <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-gray-500 max-w-md mx-auto">Une plateforme complète pour gérer vos finances, votre commerce et vos investissements.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="group bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-gray-100 transition-all hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-black mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+", label: "Utilisateurs" },
            { value: "50K+", label: "Factures créées" },
            { value: "15+", label: "Pays couverts" },
            { value: "99.9%", label: "Disponibilité" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-black text-white mb-1">{s.value}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-4">Ce que disent nos utilisateurs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white border border-gray-100 rounded-3xl p-8">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
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

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-12 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Prêt à transformer votre gestion ?</h2>
          <p className="text-white/70 max-w-md mx-auto mb-8">Rejoignez des milliers d'entrepreneurs qui font confiance à NEXORA.</p>
          <button onClick={() => navigate("/login")} className="bg-white text-indigo-700 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-gray-100 transition-colors shadow-xl">
            Commencer maintenant
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">N</span>
            </div>
            <span className="font-black text-sm">NEXORA</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} NEXORA. Tous droits réservés.</p>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Sécurisé & fiable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
