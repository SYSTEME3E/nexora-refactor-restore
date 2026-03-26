import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { getNexoraUser, hasNexoraPremium } from "@/lib/nexora-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin, Home, Zap, Plus, X, Search, Star,
  Phone, MessageCircle, Trash2, Download,
  Filter, Image, ChevronDown, ChevronUp, ShieldCheck, Crown, User,
  Send, Loader2
} from "lucide-react";

// --- TYPES ---
interface Avis {
  id: string;
  note: number;
  commentaire: string;
  user_nom: string;
  created_at: string;
}

interface Annonce {
  id: string;
  user_id: string;
  auteur_nom: string;
  auteur_avatar?: string;
  auteur_note: number;
  auteur_plan?: string;
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

export default function ImmobilierPage() {
  const { toast } = useToast();
  const user = getNexoraUser();
  const isPremium = hasNexoraPremium();
  
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState<Annonce | null>(null);
  
  // États pour le formulaire d'avis
  const [showAvisForm, setShowAvisForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Charger les données avec score de confiance et profils
  const loadAnnonces = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("nexora_annonces_immo")
        .select("*");

      if (error) throw error;

      if (data) {
        const formatted = data.map((a: any) => ({
          ...a,
          auteur_nom: a.profiles?.nom || "Utilisateur Nexora",
          auteur_avatar: a.profiles?.avatar_url,
          auteur_note: a.profiles?.avg_rating || 0,
          auteur_plan: a.profiles?.plan
        }));

        // TRI : Les mieux notés (Confiance) apparaissent en premier
        const sorted = formatted.sort((a, b) => (b.auteur_note || 0) - (a.auteur_note || 0));
        setAnnonces(sorted);
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnonces();
  }, []);

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `nexora-immo-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible de télécharger l'image" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-24 px-4">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-5 rounded-[32px] border shadow-sm mt-4">
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">Marché Immobilier</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Offres en direct</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-primary hover:bg-primary/90 text-white rounded-2xl font-black px-6 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5 mr-1" /> PUBLIER
          </Button>
        </div>

        {/* LISTE DES ANNONCES */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-xs font-bold uppercase">Recherche des meilleures offres...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {annonces.map((annonce) => (
              <div key={annonce.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                
                {/* Image Section */}
                <div className="relative h-64 bg-slate-100 cursor-pointer group" onClick={() => setSelectedAnnonce(annonce)}>
                  <img src={annonce.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={annonce.titre} />
                  
                  {/* Badge Unique Flottant */}
                  <div className="absolute top-4 left-4">
                    {annonce.auteur_note >= 4.5 ? (
                      <div className="flex items-center gap-1.5 bg-blue-600 text-white text-[10px] px-4 py-1.5 rounded-full font-black shadow-xl border border-white/20">
                        <ShieldCheck className="w-3.5 h-3.5" /> VENDEUR CONFIANT
                      </div>
                    ) : annonce.auteur_plan === "premium" ? (
                      <div className="flex items-center gap-1.5 bg-amber-400 text-black text-[10px] px-4 py-1.5 rounded-full font-black shadow-xl">
                        <Crown className="w-3.5 h-3.5" /> MEMBRE ROI
                      </div>
                    ) : null}
                  </div>

                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl shadow-lg">
                    <span className="text-primary font-black text-sm">{annonce.prix.toLocaleString()} FCFA</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-4">
                  {/* Profil Vendeur */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-md overflow-hidden">
                          {annonce.auteur_avatar ? (
                            <img src={annonce.auteur_avatar} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-full h-full p-2.5 text-slate-400" />
                          )}
                        </div>
                        {annonce.auteur_note >= 4.5 && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
                            <ShieldCheck className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-xs uppercase text-slate-900 tracking-tight">{annonce.auteur_nom}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-black text-slate-500">{annonce.auteur_note.toFixed(1)}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="font-black text-lg text-slate-800 leading-tight mb-1">{annonce.titre}</h2>
                    <div className="flex items-center text-slate-400 text-[11px] gap-1 font-bold uppercase tracking-tighter">
                      <MapPin className="w-3 h-3 text-primary" /> {annonce.ville} • {annonce.quartier}
                    </div>
                  </div>

                  {/* Bouton Voir Détails & Avis */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => setSelectedAnnonce(annonce)}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-900 border-none rounded-2xl font-bold text-xs h-11"
                    >
                      DÉTAILS & AVIS
                    </Button>
                    <a 
                      href={`https://wa.me/${annonce.whatsapp}`}
                      className="w-11 h-11 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 hover:scale-105 transition-transform"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DÉTAILS, PHOTOS HD ET AVIS */}
        {selectedAnnonce && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-300">
            {/* Header Modal */}
            <div className="p-4 flex justify-between items-center text-white">
              <button onClick={() => setSelectedAnnonce(null)} className="p-2 bg-white/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Détails de l'annonce</span>
              <div className="w-10" />
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-8">
              {/* Galerie HD */}
              <div className="space-y-4">
                {selectedAnnonce.images.map((img, i) => (
                  <div key={i} className="relative group rounded-[32px] overflow-hidden bg-white/5">
                    <img src={img} className="w-full object-contain max-h-[70vh]" alt="" />
                    <button 
                      onClick={() => downloadImage(img)}
                      className="absolute top-4 right-4 bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center gap-2 font-black text-xs hover:scale-105 active:scale-95 transition-all"
                    >
                      <Download className="w-5 h-5" /> TÉLÉCHARGER HD
                    </button>
                  </div>
                ))}
              </div>

              {/* Infos Techniques */}
              <div className="bg-white rounded-[32px] p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{selectedAnnonce.titre}</h2>
                    <p className="text-primary font-black text-xl mt-1">{selectedAnnonce.prix.toLocaleString()} FCFA</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase">Localisation</div>
                    <div className="font-bold text-slate-700">{selectedAnnonce.ville}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest">Description du bien</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {selectedAnnonce.description}
                  </p>
                </div>

                {/* Section Avis Intégrée */}
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-sm uppercase">Avis & Notes</h3>
                    <Button size="sm" variant="outline" className="rounded-xl text-[10px] font-black" onClick={() => setShowAvisForm(!showAvisForm)}>
                      {showAvisForm ? "ANNULER" : "NOTER LE VENDEUR"}
                    </Button>
                  </div>

                  {showAvisForm && (
                    <div className="bg-slate-50 p-4 rounded-2xl mb-4 space-y-3">
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setRating(star)}>
                            <Star className={`w-6 h-6 ${rating >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                          </button>
                        ))}
                      </div>
                      <Textarea 
                        placeholder="Votre expérience avec ce vendeur..." 
                        className="bg-white border-none rounded-xl text-xs"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <Button className="w-full bg-slate-900 rounded-xl font-bold h-10 text-xs">ENVOYER L'AVIS</Button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-[11px] uppercase text-slate-900">Jean-Marc</span>
                        <div className="flex gap-0.5"><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /></div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">Super réactif, la visite s'est très bien passée. Je recommande ce vendeur Nexora.</p>
                    </div>
                  </div>
                </div>

                {/* Boutons Actions */}
                <div className="flex gap-3 pt-4">
                  <a href={`tel:${selectedAnnonce.contact}`} className="flex-1 bg-slate-900 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-xl">
                    <Phone className="w-5 h-5" /> APPELER
                  </a>
                  <a href={`https://wa.me/${selectedAnnonce.whatsapp}`} className="flex-1 bg-green-500 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-xl shadow-green-200">
                    <MessageCircle className="w-5 h-5" /> WHATSAPP
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
