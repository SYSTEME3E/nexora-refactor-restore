import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { useState } from "react";

const NEXORA_LOGO = "https://i.postimg.cc/c1QgbZsG/ei_1773937801458_removebg_preview.png";

const FAQ_SECTIONS = [
  {
    title: "Général",
    questions: [
      { q: "Qu'est-ce que NEXORA ?", a: "NEXORA est une plateforme tout-en-un conçue pour les entrepreneurs africains. Elle combine la gestion financière, la facturation professionnelle, une boutique e-commerce et un marché immobilier dans une seule application." },
      { q: "NEXORA est-il gratuit ?", a: "Oui, NEXORA propose un plan gratuit qui inclut les fonctionnalités de base : suivi des dépenses, création de factures (limité à 10), coffre-fort numérique et plus encore. Des plans premium (Boss et Roi) sont disponibles pour débloquer toutes les fonctionnalités." },
      { q: "Comment créer un compte ?", a: "Rendez-vous sur la page d'inscription, remplissez votre nom complet, un nom d'utilisateur unique, votre email et un mot de passe sécurisé. Votre compte sera actif immédiatement." },
      { q: "NEXORA est disponible dans quels pays ?", a: "NEXORA est disponible dans plus de 15 pays africains dont le Bénin, le Togo, la Côte d'Ivoire, le Sénégal, le Mali, le Burkina Faso, le Cameroun, le Ghana, le Nigeria et bien d'autres." },
    ]
  },
  {
    title: "Facturation",
    questions: [
      { q: "Comment créer une facture ?", a: "Depuis votre tableau de bord, accédez à la section Factures. Cliquez sur 'Nouvelle', remplissez les informations du vendeur et du client, ajoutez vos articles (nom, prix unitaire, quantité) et enregistrez. Vous pouvez ensuite télécharger le PDF." },
      { q: "Puis-je personnaliser mes factures ?", a: "Oui, chaque facture contient vos informations de vendeur personnalisées, votre IFU si applicable, et vos articles avec les prix détaillés. Le PDF généré est professionnel et prêt à être envoyé à vos clients." },
      { q: "Combien de factures puis-je créer ?", a: "Le plan gratuit vous permet de créer jusqu'à 10 factures. Les plans Boss (100 factures) et Roi (illimité) vous offrent plus de capacité selon vos besoins." },
    ]
  },
  {
    title: "Boutique & E-commerce",
    questions: [
      { q: "Comment ouvrir ma boutique en ligne ?", a: "La boutique en ligne est disponible avec les plans premium. Une fois activée, vous pouvez ajouter vos produits, définir les prix, et partager le lien de votre vitrine avec vos clients." },
      { q: "Quels types de produits puis-je vendre ?", a: "Vous pouvez vendre des produits physiques et des produits digitaux. Chaque produit peut avoir une description, des images, un prix et des catégories." },
      { q: "Comment mes clients passent-ils commande ?", a: "Vos clients accèdent à votre vitrine via un lien unique, parcourent vos produits et passent commande. Vous recevez les commandes dans votre espace de gestion." },
    ]
  },
  {
    title: "Sécurité & Compte",
    questions: [
      { q: "Mes données sont-elles sécurisées ?", a: "Absolument. Toutes les données sont chiffrées et stockées de manière sécurisée. Nous utilisons des protocoles de sécurité de niveau bancaire pour protéger vos informations." },
      { q: "Qu'est-ce que le coffre-fort numérique ?", a: "Le coffre-fort est un espace sécurisé pour stocker vos mots de passe, informations bancaires et autres données sensibles. Seul vous pouvez y accéder." },
      { q: "Comment changer mon mot de passe ?", a: "Accédez à votre profil depuis le menu latéral, puis modifiez votre mot de passe dans les paramètres de sécurité." },
    ]
  },
];

export default function FaqPage() {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src={NEXORA_LOGO} alt="NEXORA" className="w-7 h-7 object-contain" />
          <span className="font-black text-lg">FAQ</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-black mb-2">Questions Fréquentes</h1>
        <p className="text-muted-foreground mb-10">Trouvez les réponses à vos questions sur NEXORA.</p>

        {FAQ_SECTIONS.map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="text-lg font-black text-primary mb-3">{section.title}</h2>
            <div className="space-y-2">
              {section.questions.map((faq, i) => {
                const key = `${section.title}-${i}`;
                return (
                  <div key={key} className="bg-card border border-border rounded-xl overflow-hidden">
                    <button onClick={() => toggleItem(key)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                      <span className="font-semibold text-sm">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${openItems[key] ? "rotate-180" : ""}`} />
                    </button>
                    {openItems[key] && (
                      <div className="px-5 pb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
