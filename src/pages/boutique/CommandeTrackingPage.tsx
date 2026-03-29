import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, MessageCircle, Package, ArrowLeft, ExternalLink } from "lucide-react";

interface Commande {
  id: string;
  numero: string;
  client_nom: string;
  client_email: string | null;
  client_tel: string | null;
  total: number;
  devise: string;
  statut: string;
  statut_paiement: string;
  items: any;
  created_at: string;
  boutique_id: string;
}

interface Boutique {
  id: string;
  nom: string;
  whatsapp: string;
  telephone: string;
}

function fmt(n: number, devise: string) {
  if (devise === "USD") return `$${n.toFixed(2)}`;
  return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${devise}`;
}

export default function CommandeTrackingPage() {
  const { commandeId } = useParams<{ commandeId: string }>();
  const navigate = useNavigate();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadCommande();
  }, [commandeId]);

  const loadCommande = async () => {
    if (!commandeId) return;
    const { data } = await supabase
      .from("commandes" as any)
      .select("*")
      .eq("id", commandeId)
      .maybeSingle();

    if (data) {
      const cmd = data as unknown as Commande;
      setCommande(cmd);

      const { data: shop } = await supabase
        .from("boutiques" as any)
        .select("id, nom, whatsapp, telephone")
        .eq("id", cmd.boutique_id)
        .maybeSingle();
      if (shop) setBoutique(shop as unknown as Boutique);
    }
    setLoading(false);
  };

  const confirmReception = async () => {
    if (!commande) return;
    setConfirming(true);
    
    await supabase
      .from("commandes" as any)
      .update({
        statut: "confirme",
        statut_paiement: "en_traitement",
      })
      .eq("id", commande.id);

    // Notify seller
    const { data: shopData } = await supabase
      .from("boutiques" as any)
      .select("user_id, nom")
      .eq("id", commande.boutique_id)
      .maybeSingle();

    if (shopData) {
      await supabase.from("nexora_notifications" as any).insert({
        user_id: (shopData as any).user_id,
        titre: "Réception confirmée ✅",
        message: `${commande.client_nom} a confirmé la réception de sa commande #${commande.numero} (${fmt(commande.total, commande.devise)}). Le paiement sera versé sous 24h.`,
        type: "success",
      });
    }

    setCommande({ ...commande, statut: "confirme", statut_paiement: "en_traitement" });
    setConfirming(false);
  };

  const whatsappLink = boutique?.whatsapp
    ? `https://wa.me/${boutique.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Bonjour ! J'ai passé la commande #${commande?.numero} sur ${boutique.nom}. Merci de m'envoyer le produit.`
      )}`
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Package className="w-16 h-16 text-gray-300" />
        <h1 className="text-xl font-black">Commande introuvable</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Cette commande n'existe pas ou le lien est invalide.</p>
        <button onClick={() => navigate("/")} className="text-primary underline text-sm">Retour à l'accueil</button>
      </div>
    );
  }

  const items = Array.isArray(commande.items) ? commande.items : [];
  const isDigital = items.some((item: any) => item.type === "digital" || item.type === "numerique");

  const STATUT_STEPS = [
    { key: "en_attente", label: "Commande passée", icon: Clock },
    { key: "whatsapp", label: "Contacter le vendeur", icon: MessageCircle },
    { key: "confirme", label: "Réception confirmée", icon: CheckCircle },
  ];

  const currentStep = commande.statut === "confirme" ? 2
    : commande.statut === "en_attente" ? 0
    : 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl hover:bg-gray-100 dark:bg-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="font-black text-sm">Suivi de commande</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">#{commande.numero}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Status Steps */}
        <div className="bg-white rounded-2xl border p-5">
          <h2 className="font-black text-sm mb-4">Statut de votre commande</h2>
          <div className="space-y-4">
            {STATUT_STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentStep;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${done ? "bg-green-100" : "bg-gray-100 dark:bg-gray-700"}`}>
                    <Icon className={`w-4 h-4 ${done ? "text-green-600" : "text-gray-400 dark:text-gray-500"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${done ? "text-gray-900" : "text-gray-400 dark:text-gray-500"}`}>{step.label}</p>
                  </div>
                  {i <= currentStep && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* WhatsApp Contact for digital products */}
        {isDigital && commande.statut === "en_attente" && whatsappLink && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
            <h3 className="font-black text-sm text-green-800 mb-2">📱 Contactez le vendeur</h3>
            <p className="text-xs text-green-700 mb-4">
              Votre commande de produit digital a été enregistrée. Contactez le vendeur via WhatsApp pour recevoir votre produit.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" /> Contacter via WhatsApp
            </a>
          </div>
        )}

        {/* Confirm reception */}
        {isDigital && commande.statut === "en_attente" && (
          <div className="bg-white border rounded-2xl p-5">
            <h3 className="font-black text-sm mb-2">Vous avez reçu votre produit ?</h3>
            <p className="text-xs text-gray-500 mb-4">
              Une fois que vous avez reçu votre produit digital, confirmez la réception pour finaliser la commande.
            </p>
            <button
              onClick={confirmReception}
              disabled={confirming}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
            >
              {confirming ? "Confirmation..." : "✅ Confirmer la réception"}
            </button>
          </div>
        )}

        {commande.statut === "confirme" && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-black text-green-800 mb-1">Commande confirmée !</h3>
            <p className="text-xs text-green-700">
              Le vendeur recevra son paiement sous 24 heures. Merci pour votre achat !
            </p>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-2xl border p-5">
          <h3 className="font-black text-sm mb-3">Détails de la commande</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Client</span>
              <span className="font-bold">{commande.client_nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Date</span>
              <span className="font-medium">{new Date(commande.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Boutique</span>
              <span className="font-medium">{boutique?.nom || "—"}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between py-1">
                  <span className="text-gray-700 dark:text-gray-200">{item.nom || item.produit?.nom || "Produit"} x{item.quantite || 1}</span>
                  <span className="font-bold">{fmt(item.prix || item.montant || 0, commande.devise)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 flex justify-between font-black">
              <span>Total</span>
              <span className="text-primary">{fmt(commande.total, commande.devise)}</span>
            </div>
          </div>
        </div>

        {/* Share link */}
        <div className="bg-white rounded-2xl border p-5">
          <h3 className="font-black text-sm mb-2">🔗 Lien de suivi</h3>
          <p className="text-xs text-gray-500 mb-3">Partagez ce lien pour suivre votre commande à tout moment.</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={`${window.location.origin}/commande/${commande.id}`}
              className="flex-1 text-xs bg-gray-50 border rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-200"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/commande/${commande.id}`);
              }}
              className="p-2.5 bg-primary text-white rounded-xl hover:opacity-90"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
