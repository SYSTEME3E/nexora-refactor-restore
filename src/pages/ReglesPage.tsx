import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NEXORA_LOGO = "https://i.postimg.cc/c1QgbZsG/ei_1773937801458_removebg_preview.png";

export default function ReglesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src={NEXORA_LOGO} alt="NEXORA" className="w-7 h-7 object-contain" />
          <span className="font-black text-lg">Conditions d'utilisation</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-black mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">1. Acceptation des conditions</h2>
            <p>En accédant à NEXORA et en utilisant nos services, vous acceptez d'être lié par les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">2. Description du service</h2>
            <p>NEXORA est une plateforme de gestion tout-en-un qui propose :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>La gestion financière (suivi des entrées et dépenses)</li>
              <li>La création de factures professionnelles</li>
              <li>Une boutique e-commerce en ligne</li>
              <li>Un marché immobilier</li>
              <li>Un coffre-fort numérique sécurisé</li>
              <li>Le transfert d'argent via Mobile Money</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">3. Inscription et compte</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vous devez fournir des informations exactes et complètes lors de votre inscription</li>
              <li>Vous êtes responsable de la confidentialité de votre mot de passe</li>
              <li>Un seul compte par personne est autorisé</li>
              <li>NEXORA se réserve le droit de suspendre ou supprimer tout compte en cas de violation des conditions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">4. Abonnements et paiements</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Le plan gratuit est accessible sans engagement</li>
              <li>Les plans premium (Boss et Roi) sont facturés mensuellement</li>
              <li>Les paiements sont traités de manière sécurisée via nos partenaires de paiement</li>
              <li>Aucun remboursement n'est possible après activation d'un plan premium</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">5. Utilisation acceptable</h2>
            <p>Vous vous engagez à :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Utiliser NEXORA uniquement à des fins légales</li>
              <li>Ne pas tenter de compromettre la sécurité de la plateforme</li>
              <li>Ne pas publier de contenu illégal, offensant ou frauduleux</li>
              <li>Ne pas utiliser la plateforme pour des activités de blanchiment d'argent</li>
              <li>Respecter les droits des autres utilisateurs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">6. Boutique en ligne</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Les vendeurs sont responsables de la qualité et de la légalité de leurs produits</li>
              <li>NEXORA n'est pas responsable des transactions entre vendeurs et acheteurs</li>
              <li>Tout contenu contrefait ou illégal sera supprimé sans préavis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">7. Limitation de responsabilité</h2>
            <p>NEXORA fournit ses services « en l'état ». Nous ne garantissons pas que le service sera ininterrompu ou exempt d'erreurs. NEXORA ne pourra être tenu responsable des pertes directes ou indirectes résultant de l'utilisation de la plateforme.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">8. Modification des conditions</h2>
            <p>NEXORA se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des modifications importantes. L'utilisation continue de la plateforme après modification vaut acceptation des nouvelles conditions.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">9. Contact</h2>
            <p>Pour toute question concernant ces conditions, contactez-nous à : <strong className="text-foreground">contact@nexora-app.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
}
