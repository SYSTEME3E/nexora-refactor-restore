import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Phone, MessageCircle, Heart, User } from "lucide-react";
import SectionAvis from "@/pages/boutique/SectionAvis";

interface Annonce {
  id: string;
  user_id: string;
  auteur_nom: string;
  titre: string;
  description: string;
  prix: number;
  type: string;
  ville: string;
  quartier: string;
  images: string[];
  contact: string;
  whatsapp: string;
  statut: string;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = { maison: "🏠 Maison", terrain: "🌿 Terrain", appartement: "🏢 Appartement", boutique: "🏪 Boutique" };
const STATUT_COLORS: Record<string, string> = { disponible: "bg-green-500", vendu: "bg-red-500", loue: "bg-yellow-500" };

function formatPrix(prix: number) {
  return prix.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " $";
}

export default function AnnonceDetailPage() {
  const { annonceId } = useParams<{ annonceId: string }>();
  const navigate = useNavigate();
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!annonceId) return;
      const { data } = await supabase.from("nexora_annonces_immo" as any).select("*").eq("id", annonceId).maybeSingle();
      if (data) {
        setAnnonce({ ...(data as any), images: (data as any).images || [] });
      }
      setLoading(false);
    };
    load();
  }, [annonceId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!annonce) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-700">Annonce introuvable</h2>
        <button onClick={() => navigate("/immobilier")} className="mt-4 flex items-center gap-2 text-purple-600 font-semibold mx-auto">
          <ArrowLeft className="w-4 h-4" /> Retour au marché
        </button>
      </div>
    </div>
  );

  const images = annonce.images || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button onClick={() => navigate("/immobilier")} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-purple-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au marché immobilier
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Images */}
          <div className="space-y-3">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm aspect-[4/3]">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={annonce.titre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-6xl">
                  {TYPE_LABELS[annonce.type]?.split(" ")[0] || "🏠"}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`rounded-2xl overflow-hidden border-2 ${selectedImage === i ? "border-purple-500" : "border-gray-200"}`}>
                    <img src={img} alt="" className="w-full aspect-square object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détails */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                  {TYPE_LABELS[annonce.type] || annonce.type}
                </span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white ${STATUT_COLORS[annonce.statut] || "bg-gray-500"}`}>
                  {annonce.statut === "disponible" ? "Disponible" : annonce.statut === "vendu" ? "Vendu" : "Loué"}
                </span>
              </div>

              <h1 className="text-2xl font-black text-gray-900">{annonce.titre}</h1>

              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin className="w-4 h-4" />
                {annonce.quartier ? `${annonce.quartier}, ` : ""}{annonce.ville}
              </div>

              <div className="text-3xl font-black text-purple-600">{formatPrix(annonce.prix)}</div>

              {annonce.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{annonce.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-gray-400">Publié par</p>
                  <p className="font-bold text-gray-800 mt-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> {annonce.auteur_nom}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-gray-400">Date</p>
                  <p className="font-bold text-gray-800 mt-1">
                    {new Date(annonce.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              {/* Contact buttons */}
              <div className="grid grid-cols-2 gap-3">
                {annonce.whatsapp && (
                  <a href={`https://wa.me/${annonce.whatsapp.replace(/[^0-9]/g, "")}?text=Bonjour, je suis intéressé par: ${annonce.titre}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-green-500 text-white font-bold text-sm">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                <a href={`tel:${annonce.contact}`}
                  className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-gray-900 text-white font-bold text-sm">
                  <Phone className="w-4 h-4" /> Appeler
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section Avis */}
        <SectionAvis annonceId={annonce.id} nomItem={annonce.titre} />
      </div>
    </div>
  );
}
