import { useNavigate } from "react-router-dom";
import {
  Zap, ShieldCheck, Store, Home, ArrowRight, BarChart3,
  Receipt, Lock, Globe, Star, Play, Mail,
  Phone, MapPin, MessageSquare, HelpCircle, ChevronDown, Send, Menu, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import nexoraHero from "@/assets/nexora-hero.jpg";

const NEXORA_LOGO = "https://i.postimg.cc/c1QgbZsG/ei_1773937801458_removebg_preview.png";

const FEATURES = [
  { icon: BarChart3, title: "Gestion Financière", desc: "Suivez vos entrées, dépenses et votre historique financier en temps réel.", color: "from-blue-500 to-blue-700" },
  { icon: Receipt, title: "Factures Professionnelles", desc: "Créez et téléchargez des factures PDF professionnelles pour vos clients.", color: "from-red-500 to-red-700" },
  { icon: Store, title: "Boutique E-commerce", desc: "Lancez votre boutique en ligne et vendez vos produits facilement.", color: "from-yellow-500 to-yellow-600" },
  { icon: Home, title: "Marché Immobilier", desc: "Publiez et trouvez des biens immobiliers dans toute l'Afrique.", color: "from-violet-500 to-violet-700" },
  { icon: Lock, title: "Coffre-Fort Numérique", desc: "Stockez vos mots de passe et données sensibles en toute sécurité.", color: "from-blue-600 to-indigo-700" },
  { icon: Globe, title: "Transfert d'Argent", desc: "Envoyez et recevez de l'argent via Mobile Money en quelques clics.", color: "from-red-600 to-rose-700" },
];

const PLANS = [
  {
    name: "Gratuit", price: "0", highlight: false,
    features: ["5 produits en boutique", "10 factures/mois", "2 prêts suivis", "Coffre-fort basique", "Support communautaire"],
    cta: "Commencer gratuitement"
  },
  {
    name: "Premium", price: "10", highlight: true,
    features: ["Produits illimités", "Factures illimitées", "Prêts illimités", "Toutes les fonctionnalités", "Support VIP dédié", "Marché immobilier", "Boutique e-commerce complète"],
    cta: "Passer au Premium"
  },
];

const SOCIALS = [
  { name: "Facebook", url: "https://facebook.com/nexora", icon: "f", bg: "bg-blue-600" },
  { name: "TikTok", url: "https://tiktok.com/@nexora", icon: "♪", bg: "bg-black" },
  { name: "WhatsApp", url: "https://wa.me/22990000000", icon: "✆", bg: "bg-green-600" },
  { name: "YouTube", url: "https://youtube.com/@nexora", icon: "▶", bg: "bg-red-600" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Avis
  const [avis, setAvis] = useState<any[]>([]);
  const [avisForm, setAvisForm] = useState({ nom_prenom: "", message: "", note: 5 });
  const [avisLoading, setAvisLoading] = useState(false);

  // Contact form on landing
  const [contactForm, setContactForm] = useState({ nom: "", email: "", sujet: "", message: "" });
  const [contactSending, setContactSending] = useState(false);

  useEffect(() => {
    loadAvis();
  }, []);

  const loadAvis = async () => {
    const { data } = await supabase.from("nexora_avis" as any).select("*").eq("approuve", true).order("created_at", { ascending: false }).limit(20);
    setAvis((data as any[]) || []);
  };

  const submitAvis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avisForm.nom_prenom.trim()) {
      toast({ title: "Nom et prénom obligatoires", variant: "destructive" });
      return;
    }
    if (!avisForm.message.trim()) {
      toast({ title: "Veuillez écrire un avis", variant: "destructive" });
      return;
    }
    setAvisLoading(true);
    await supabase.from("nexora_avis" as any).insert({
      nom_prenom: avisForm.nom_prenom.trim(),
      message: avisForm.message.trim(),
      note: avisForm.note,
    });
    toast({ title: "Merci !", description: "Votre avis sera publié après vérification." });
    setAvisForm({ nom_prenom: "", message: "", note: 5 });
    setAvisLoading(false);
  };

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.nom || !contactForm.email || !contactForm.sujet || !contactForm.message) {
      toast({ title: "Tous les champs sont requis", variant: "destructive" });
      return;
    }
    setContactSending(true);
    await supabase.from("nexora_contact_messages" as any).insert({
      nom: contactForm.nom.trim(),
      email: contactForm.email.trim(),
      sujet: contactForm.sujet.trim(),
      message: contactForm.message.trim(),
    });
    toast({ title: "Message envoyé !", description: "Nous vous répondrons rapidement." });
    setContactForm({ nom: "", email: "", sujet: "", message: "" });
    setContactSending(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={NEXORA_LOGO} alt="NEXORA" className="w-10 h-10 object-contain" />
            <span className="font-black text-xl tracking-tight">NEXORA</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
            <a href="#avis" className="hover:text-foreground transition-colors">Avis</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          {/* Desktop: Connexion/Inscription dans le menu */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => navigate("/login")} className="text-sm font-semibold px-4 py-2 rounded-xl border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors">
              Se connecter
            </button>
            <button onClick={() => navigate("/login")} className="text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 transition-all shadow-md">
              S'inscrire
            </button>
          </div>
          {/* Mobile burger */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-muted">
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-muted-foreground">Fonctionnalités</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-muted-foreground">Tarifs</a>
            <a href="#avis" onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-muted-foreground">Avis</a>
            <a href="#contact" onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-muted-foreground">Contact</a>
            <div className="pt-2 flex flex-col gap-2">
              <button onClick={() => { navigate("/login"); setMobileMenu(false); }} className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-blue-500 text-blue-600">
                Se connecter
              </button>
              <button onClick={() => { navigate("/login"); setMobileMenu(false); }} className="w-full text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white">
                S'inscrire
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-violet-500/5" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-600 mb-6">
                <Zap className="w-3.5 h-3.5" /> Plateforme tout-en-un pour l'Afrique
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6">
                Gérez votre <span className="text-blue-600">business</span> avec <span className="text-red-500">une seule</span> application
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                NEXORA combine gestion financière, facturation, e-commerce et immobilier. Conçue pour les <span className="font-bold text-yellow-600">entrepreneurs africains</span> qui veulent gagner en efficacité.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <button onClick={() => navigate("/login")} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg hover:opacity-90 transition-all text-base">
                  Créer un compte gratuit <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => document.getElementById("demo-video")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-2 text-muted-foreground font-semibold px-5 py-3.5 rounded-2xl border border-border hover:border-violet-300 transition-colors">
                  <Play className="w-4 h-4" /> Voir la démo
                </button>
              </div>
            </div>
            <div className="relative">
              <img src={nexoraHero} alt="NEXORA Dashboard" className="rounded-2xl shadow-2xl border border-border" width={1280} height={720} />
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Sécurisé</p>
                    <p className="text-[10px] text-muted-foreground">Données chiffrées</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section id="demo-video" className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black mb-3">Découvrez <span className="text-red-500">NEXORA</span> en action</h2>
          <p className="text-muted-foreground">Regardez comment NEXORA simplifie la gestion de votre business au quotidien.</p>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-card aspect-video">
          <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Présentation NEXORA" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-muted/30 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-black mb-3">Tout ce dont vous avez <span className="text-blue-600">besoin</span></h2>
            <p className="text-muted-foreground max-w-md mx-auto">Une plateforme complète pour gérer vos finances, votre commerce et vos investissements.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group bg-card border border-border rounded-2xl p-7 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-to-r from-blue-600 via-violet-600 to-red-500 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+", label: "Utilisateurs actifs" },
            { value: "50K+", label: "Factures générées" },
            { value: "15+", label: "Pays couverts" },
            { value: "99.9%", label: "Disponibilité" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-black text-white mb-1">{s.value}</div>
              <div className="text-sm text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING — 2 plans seulement */}
      <section id="pricing" className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-black mb-3">Tarifs <span className="text-yellow-500">simples</span></h2>
          <p className="text-muted-foreground">Commencez gratuitement ou passez au Premium pour des fonctionnalités illimitées.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl p-8 border ${plan.highlight ? "border-violet-500 bg-gradient-to-br from-violet-500/5 to-blue-500/5 shadow-xl scale-[1.02]" : "border-border bg-card"} transition-all`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Recommandé
                </div>
              )}
              <h3 className="text-xl font-black mb-1">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black">${plan.price}</span>
                <span className="text-muted-foreground text-sm mb-1">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/login")}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                  plan.highlight
                    ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:opacity-90 shadow-md"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* AVIS UTILISATEURS + FORMULAIRE */}
      <section id="avis" className="bg-muted/30 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-3">Ce que disent nos <span className="text-violet-600">utilisateurs</span></h2>
            <p className="text-muted-foreground">Des milliers d'entrepreneurs nous font confiance.</p>
          </div>

          {/* Avis existants */}
          {avis.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {avis.map((t: any) => (
                <div key={t.id} className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${t.note >= i ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />)}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">"{t.message}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-600 font-bold text-sm">
                      {t.nom_prenom?.charAt(0) || "?"}
                    </div>
                    <p className="font-bold text-sm">{t.nom_prenom}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulaire d'avis */}
          <div className="max-w-lg mx-auto">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" /> Laissez votre avis
              </h3>
              <form onSubmit={submitAvis} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nom et Prénom *</label>
                  <Input value={avisForm.nom_prenom} onChange={e => setAvisForm({...avisForm, nom_prenom: e.target.value})} placeholder="Votre nom complet" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Note</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <button key={i} type="button" onClick={() => setAvisForm({...avisForm, note: i})}>
                        <Star className={`w-6 h-6 ${avisForm.note >= i ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Votre avis *</label>
                  <Textarea value={avisForm.message} onChange={e => setAvisForm({...avisForm, message: e.target.value})} placeholder="Partagez votre expérience avec NEXORA..." rows={3} required />
                </div>
                <button type="submit" disabled={avisLoading} className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:opacity-90 transition-all">
                  {avisLoading ? "Envoi..." : "Publier mon avis"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* RÉSEAUX SOCIAUX */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl font-black mb-6">Suivez-nous sur les <span className="text-blue-600">réseaux sociaux</span></h2>
          <div className="flex items-center justify-center gap-4">
            {SOCIALS.map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                className={`${s.bg} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg hover:opacity-80 transition-opacity shadow-md`}
                title={s.name}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black mb-3">Questions <span className="text-red-500">fréquentes</span></h2>
        </div>
        <div className="space-y-3">
          {[
            { q: "NEXORA est-il gratuit ?", a: "Oui ! Le plan gratuit inclut les fonctionnalités de base. Pour des fonctionnalités illimitées, passez au Premium à seulement 10$/mois." },
            { q: "Comment fonctionne la facturation ?", a: "Créez des factures professionnelles en quelques clics. Remplissez les infos, ajoutez vos articles et téléchargez le PDF." },
            { q: "Mes données sont-elles sécurisées ?", a: "Toutes vos données sont chiffrées et stockées de manière sécurisée avec les meilleures pratiques de sécurité." },
            { q: "Puis-je vendre en ligne ?", a: "Oui ! Avec le plan Premium, créez votre boutique en ligne, ajoutez vos produits et recevez des commandes." },
            { q: "Quels pays sont couverts ?", a: "NEXORA est disponible dans plus de 15 pays africains avec support FCFA, USD et Mobile Money." },
          ].map((faq, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="font-semibold text-sm">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <button onClick={() => navigate("/faq")} className="text-blue-600 text-sm font-semibold hover:underline">
            Voir toutes les questions →
          </button>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-muted/30 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-3">Nous <span className="text-violet-600">contacter</span></h2>
            <p className="text-muted-foreground">Une question ? Écrivez-nous directement.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Mail className="w-5 h-5 text-blue-600" /></div>
                <div><h3 className="font-bold text-sm">Email</h3><p className="text-xs text-muted-foreground">contact@nexora-app.com</p></div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><Phone className="w-5 h-5 text-red-500" /></div>
                <div><h3 className="font-bold text-sm">Téléphone</h3><p className="text-xs text-muted-foreground">+229 XX XX XX XX</p></div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-yellow-600" /></div>
                <div><h3 className="font-bold text-sm">Adresse</h3><p className="text-xs text-muted-foreground">Cotonou, Bénin</p></div>
              </div>
            </div>
            <div className="md:col-span-3">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MessageSquare className="w-5 h-5 text-violet-600" />
                  <h2 className="font-bold text-lg">Envoyez-nous un message</h2>
                </div>
                <form onSubmit={submitContact} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nom *</label>
                      <Input value={contactForm.nom} onChange={e => setContactForm({...contactForm, nom: e.target.value})} placeholder="Votre nom" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email *</label>
                      <Input type="email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} placeholder="votre@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Sujet *</label>
                    <Input value={contactForm.sujet} onChange={e => setContactForm({...contactForm, sujet: e.target.value})} placeholder="De quoi s'agit-il ?" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Message *</label>
                    <Textarea value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} placeholder="Votre message..." rows={4} />
                  </div>
                  <button type="submit" disabled={contactSending} className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> {contactSending ? "Envoi..." : "Envoyer"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-red-500 rounded-2xl p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Prêt à transformer votre gestion ?</h2>
          <p className="text-white/70 max-w-md mx-auto mb-8">Rejoignez des milliers d'entrepreneurs africains qui utilisent NEXORA chaque jour.</p>
          <button onClick={() => navigate("/login")} className="bg-white text-foreground font-bold px-8 py-3.5 rounded-2xl text-base hover:opacity-90 transition-all shadow-lg">
            Commencer maintenant — C'est gratuit
          </button>
        </div>
      </section>

      {/* FOOTER — fond violet */}
      <footer className="bg-violet-900 text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={NEXORA_LOGO} alt="NEXORA" className="w-8 h-8 object-contain" />
                <span className="font-black text-sm">NEXORA</span>
              </div>
              <p className="text-xs text-violet-200 leading-relaxed">
                La plateforme tout-en-un pour gérer votre business en Afrique. Finances, factures, e-commerce et immobilier.
              </p>
              <div className="flex gap-2 mt-4">
                {SOCIALS.map(s => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold hover:bg-white/20 transition-colors" title={s.name}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Plateforme</h4>
              <ul className="space-y-2 text-sm text-violet-200">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#avis" className="hover:text-white transition-colors">Avis</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-violet-200">
                <li><button onClick={() => navigate("/faq")} className="hover:text-white transition-colors">FAQ</button></li>
                <li><button onClick={() => navigate("/contact")} className="hover:text-white transition-colors">Nous contacter</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Légal</h4>
              <ul className="space-y-2 text-sm text-violet-200">
                <li><button onClick={() => navigate("/confidentialite")} className="hover:text-white transition-colors">Politique de confidentialité</button></li>
                <li><button onClick={() => navigate("/regles")} className="hover:text-white transition-colors">Conditions d'utilisation</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-violet-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-violet-300">© {new Date().getFullYear()} NEXORA. Tous droits réservés.</p>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-violet-300">Plateforme sécurisée & fiable</span>
            </div>
          </div>
        </div>
      </footer>

      {/* BOTTOM MOBILE MENU — uniquement Connexion/Inscription */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-violet-900/95 backdrop-blur-lg border-t border-violet-700">
        <div className="flex items-center justify-around py-2.5 px-2">
          <button onClick={() => navigate("/login")} className="flex flex-col items-center gap-0.5 text-violet-200">
            <Lock className="w-5 h-5" />
            <span className="text-[10px] font-medium">Connexion</span>
          </button>
          <button onClick={() => navigate("/login")} className="flex flex-col items-center gap-0.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center -mt-4 shadow-lg">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-yellow-400">S'inscrire</span>
          </button>
          <button onClick={() => navigate("/contact")} className="flex flex-col items-center gap-0.5 text-violet-200">
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Contact</span>
          </button>
          <button onClick={() => navigate("/faq")} className="flex flex-col items-center gap-0.5 text-violet-200">
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">FAQ</span>
          </button>
        </div>
      </div>
      <div className="h-16 md:hidden" />
    </div>
  );
}
