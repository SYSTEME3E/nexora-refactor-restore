import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ChevronDown, ChevronUp, CheckCircle2, Play, 
  ShieldCheck, Zap, Globe, MessageSquare, 
  ArrowRight, Star, Facebook, Twitter, Instagram, 
  Mail, Phone, TrendingUp, Store, Home, Wallet, 
  Lock, PieChart, ShoppingBag, Landmark, Download, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-[100] bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black italic">N</div>
          <span className="font-black text-xl italic tracking-tighter">NEXORA</span>
        </div>
        <div className="hidden lg:flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
          <a href="#finance" className="hover:text-primary transition-colors">Finance</a>
          <a href="#boutique" className="hover:text-primary transition-colors">Boutique</a>
          <a href="#immobilier" className="hover:text-primary transition-colors">Immobilier</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Tarifs</a>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden sm:flex text-xs font-black uppercase tracking-widest">Connexion</Button>
          <Button onClick={() => navigate("/auth")} className="bg-slate-900 text-white rounded-2xl px-6 text-xs font-black uppercase shadow-xl hover:bg-primary transition-all">Rejoindre</Button>
        </div>
      </nav>

      {/* --- HERO : L'ACCROCHE --- */}
      <section className="pt-40 pb-20 px-6 text-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-white">
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm mb-8 animate-bounce">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">L'Elite de la gestion en Afrique</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
          VOTRE EMPIRE. <br /> <span className="text-primary">UNE SEULE APP.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-slate-500 text-sm md:text-lg font-medium leading-relaxed">
          Nexora fusionne la gestion de vos finances personnelles, votre boutique e-commerce et vos investissements immobiliers dans une interface révolutionnaire.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate("/auth")} className="h-16 px-10 rounded-[24px] bg-primary text-white font-black uppercase italic text-base shadow-2xl shadow-primary/30 group">
            Ouvrir mon compte <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </section>

      {/* --- SECTION 1 : FINANCE (LE CŒUR) --- */}
      <section id="finance" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <PieChart className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter italic leading-none">Gestion Financière <br /> <span className="text-blue-600">Intelligente</span></h2>
            <p className="text-slate-500 font-medium">Prenez le contrôle total de votre flux de trésorerie avec des outils de niveau professionnel, simplifiés pour vous.</p>
            <ul className="space-y-4">
              {[
                "Suivi automatisé des entrées et dépenses",
                "Gestion des dettes et prêts avec rappels",
                "Épargnes sécurisées avec pénalités de retrait (10%)",
                "Génération de factures PDF professionnelles"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-tight">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-100 rounded-[48px] p-8 border-8 border-white shadow-2xl">
             <div className="aspect-[4/3] bg-white rounded-[32px] shadow-inner flex items-center justify-center text-slate-300">
                [Image de l'interface Dashboard Finance]
             </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2 : BOUTIQUE (LE BUSINESS) --- */}
      <section id="boutique" className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 bg-slate-800 rounded-[48px] p-8 border-8 border-slate-700 shadow-2xl">
             <div className="aspect-[4/3] bg-slate-900 rounded-[32px] shadow-inner flex items-center justify-center text-slate-700">
                [Image de Nexora Shop / Boutique]
             </div>
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Nexora <span className="text-primary">Shop</span></h2>
            <p className="text-slate-400 font-medium">Transformez vos produits en revenus. Une plateforme de vente intégrée pour toucher toute la communauté Nexora.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 p-6 rounded-3xl">
                <h4 className="text-primary font-black text-xl mb-1">0%</h4>
                <p className="text-[10px] uppercase font-bold text-slate-400">Frais sur vos premières ventes</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-3xl">
                <h4 className="text-primary font-black text-xl mb-1">ROI</h4>
                <p className="text-[10px] uppercase font-bold text-slate-400">Visibilité Prioritaire</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">Inclus : Système d'avis clients, gestion de stock et paiement Kkiapay.</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 3 : IMMOBILIER (L'INVESTISSEMENT) --- */}
      <section id="immobilier" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter">Marché Immobilier <span className="text-primary">Vérifié</span></h2>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">Achetez, louez ou vendez des biens immobiliers en toute sérénité avec notre système de confiance exclusif.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: "Terrains Homologués", desc: "Des parcelles vérifiées avec titres fonciers sécurisés.", icon: Globe },
             { title: "Villas de Luxe", desc: "Le meilleur de l'immobilier moderne pour votre famille.", icon: Home },
             { title: "Bureaux & Commerces", desc: "Des emplacements stratégiques pour votre entreprise.", icon: Landmark }
           ].map((item, i) => (
             <div key={i} className="bg-white border border-slate-100 p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all group">
                <item.icon className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-black text-lg uppercase mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* --- SECTION VIDÉO : DÉMONSTRATION --- */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
           <div className="text-center mb-12">
              <h3 className="font-black text-2xl uppercase italic italic">Découvrez Nexora en action</h3>
           </div>
           <div className="relative aspect-video rounded-[48px] overflow-hidden shadow-3xl border-[12px] border-white">
              <img src="/video-thumbnail.jpg" className="w-full h-full object-cover" alt="Video demo" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                 <button className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-current ml-1" />
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-center mb-16">Questions & Réponses</h2>
        <div className="space-y-4">
           <FAQItem 
             question="Comment fonctionne la sécurité de mes données ?" 
             answer="Nexora utilise une isolation multi-tenante stricte via Supabase. Vos données financières, vos factures et vos messages sont chiffrés et invisibles pour les autres utilisateurs."
           />
           <FAQItem 
             question="Quels sont les avantages du Plan ROI ?" 
             answer="Le Plan ROI vous offre un badge 'Membre ROI' doré, la publication illimitée de produits et d'annonces immobilières, et une remontée automatique de vos annonces en tête de liste."
           />
           <FAQItem 
             question="Le système d'épargne est-il flexible ?" 
             answer="Oui, mais pour encourager la discipline financière, tout retrait anticipé sur vos épargnes Nexora entraîne une pénalité automatique de 10% créditée à la plateforme."
           />
        </div>
      </section>

      {/* --- FOOTER FINAL --- */}
      <footer className="bg-slate-900 text-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black italic">N</div>
              <span className="font-black text-2xl italic tracking-tighter">NEXORA</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              La plateforme de référence pour bâtir votre avenir financier et immobilier en Afrique de l'Ouest.
            </p>
          </div>
          <div>
            <h5 className="text-primary font-black text-xs uppercase tracking-widest mb-8">Navigation</h5>
            <ul className="space-y-4 text-xs font-black uppercase text-slate-300">
              <li><a href="#finance" className="hover:text-white transition-colors">Finance Personnelle</a></li>
              <li><a href="#boutique" className="hover:text-white transition-colors">Boutique Nexora</a></li>
              <li><a href="#immobilier" className="hover:text-white transition-colors">Marché Immobilier</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Plans d'abonnement</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-primary font-black text-xs uppercase tracking-widest mb-8">Légal & Règles</h5>
            <ul className="space-y-4 text-xs font-black uppercase text-slate-300">
              <li><Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link to="/regles" className="hover:text-white transition-colors">Règles d'utilisation</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition-colors">Gestion des Cookies</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Centre d'aide</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-primary font-black text-xs uppercase tracking-widest mb-8">Contact</h5>
            <div className="space-y-4 text-xs font-black text-slate-300">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> contact@nexora.app</div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> +229 00 00 00 00</div>
              <div className="flex gap-4 pt-4">
                <Facebook className="w-5 h-5 hover:text-primary transition-colors cursor-pointer" />
                <Instagram className="w-5 h-5 hover:text-primary transition-colors cursor-pointer" />
                <Twitter className="w-5 h-5 hover:text-primary transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
        <div className="text-center pt-12 border-t border-slate-800">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            © 2026 NEXORA GROUP . TOUS DROITS RÉSERVÉS . CONCEPTION PAR LOVABLE
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- SOUS-COMPOSANT FAQ ---
function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 transition-all">
      <button onClick={() => setOpen(!open)} className="w-full p-6 flex justify-between items-center text-left">
        <span className="font-black text-sm uppercase tracking-tight">{question}</span>
        {open ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-6 pb-6 text-slate-500 text-xs font-medium leading-relaxed animate-in fade-in duration-300">
          {answer}
        </div>
      )}
    </div>
  );
}
