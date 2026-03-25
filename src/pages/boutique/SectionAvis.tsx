import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getNexoraUser } from "@/lib/nexora-auth";
import { useToast } from "@/hooks/use-toast";
import { Star, Send, User, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Avis {
  id: string;
  user_nom: string;
  user_avatar: string;
  note: number;
  commentaire: string;
  created_at: string;
}

interface SectionAvisProps {
  produitId: string;
  nomProduit: string;
}

export default function SectionAvis({ produitId, nomProduit }: SectionAvisProps) {
  const { toast } = useToast();
  const user = getNexoraUser();
  
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  
  // État du formulaire
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");

  const chargerAvis = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("avis_boutique")
      .select("*")
      .eq("produit_id", produitId)
      .order("created_at", { ascending: false });

    if (!error && data) setAvis(data);
    setLoading(false);
  };

  useEffect(() => { if (produitId) chargerAvis(); }, [produitId]);

  const soumettreAvis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour laisser un avis.", variant: "destructive" });
      return;
    }
    if (!commentaire.trim()) return;

    setEnvoiEnCours(true);
    const { error } = await supabase.from("avis_boutique").insert({
      produit_id: produitId,
      user_id: user.id,
      user_nom: user.user_metadata?.full_name || "Utilisateur Nexora",
      user_avatar: user.user_metadata?.avatar_url,
      note,
      commentaire
    });

    if (error) {
      toast({ title: "Erreur", description: "Impossible de publier l'avis.", variant: "destructive" });
    } else {
      toast({ title: "Merci !", description: "Votre avis a été publié." });
      setCommentaire("");
      chargerAvis();
    }
    setEnvoiEnCours(false);
  };

  const moyenne = avis.length > 0 ? (avis.reduce((acc, curr) => acc + curr.note, 0) / avis.length).toFixed(1) : 0;

  return (
    <div className="mt-8 space-y-6 border-t pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">Avis Clients</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Retours sur {nomProduit}</p>
        </div>
        {avis.length > 0 && (
          <div className="bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1 border border-amber-100">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-black text-amber-700">{moyenne}/5</span>
          </div>
        )}
      </div>

      {/* Formulaire de saisie */}
      <form onSubmit={soumettreAvis} className="bg-slate-50 p-4 rounded-[24px] space-y-4 border border-slate-100">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black text-slate-500 uppercase">Quelle note donnez-vous ?</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setNote(s)} className="transition-transform active:scale-90">
                <Star className={`w-6 h-6 ${note >= s ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          placeholder="Écrivez votre avis ici..."
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          className="bg-white rounded-xl border-none text-sm focus-visible:ring-primary shadow-sm"
        />

        <Button disabled={envoiEnCours} type="submit" className="w-full bg-primary text-white rounded-xl font-black h-11 shadow-lg shadow-primary/20">
          {envoiEnCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> PUBLIER MON AVIS</>}
        </Button>
      </form>

      {/* Liste des avis */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
        ) : avis.length === 0 ? (
          <div className="text-center py-8 bg-slate-50/50 rounded-[24px] border border-dashed">
            <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase">Soyez le premier à donner votre avis !</p>
          </div>
        ) : (
          avis.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                    {item.user_avatar ? <img src={item.user_avatar} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase text-slate-900">{item.user_nom}</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-2 h-2 ${i < item.note ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-10">{item.commentaire}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
