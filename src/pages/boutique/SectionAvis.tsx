import { useState, useEffect } from "react";
import { Star, Send, MessageSquare, Lock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getNexoraUser, isNexoraAuthenticated } from "@/lib/nexora-auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Avis {
  id: string;
  user_nom: string;
  note: number;
  commentaire: string;
  created_at: string;
}

interface SectionAvisProps {
  produitId?: string;
  annonceId?: string;
  nomItem: string;
}

export default function SectionAvis({ produitId, annonceId, nomItem }: SectionAvisProps) {
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const user = getNexoraUser();
  const isLoggedIn = isNexoraAuthenticated();
  const navigate = useNavigate();

  const loadAvis = async () => {
    setLoading(true);
    let query = supabase.from("avis_produits" as any).select("*").order("created_at", { ascending: false });
    if (produitId) query = query.eq("produit_id", produitId);
    if (annonceId) query = query.eq("annonce_id", annonceId);
    const { data } = await query;
    setAvis((data || []) as unknown as Avis[]);
    setLoading(false);
  };

  useEffect(() => { loadAvis(); }, [produitId, annonceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentaire.trim()) {
      toast({ title: "Écrivez un commentaire", variant: "destructive" }); return;
    }
    // ── VÉRIFICATION COMPTE OBLIGATOIRE ──
    if (!isLoggedIn || !user) {
      toast({
        title: "Compte requis",
        description: "Créez un compte gratuit pour laisser un avis.",
        variant: "destructive"
      });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("avis_produits" as any).insert({
      user_id: user.id,
      user_nom: user.nom_prenom || user.username || "Utilisateur",
      produit_id: produitId || null,
      annonce_id: annonceId || null,
      note,
      commentaire: commentaire.trim(),
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Avis publié !" });
      setCommentaire(""); setNote(5);
      loadAvis();
    }
    setSubmitting(false);
  };

  const moyenneNote = avis.length > 0
    ? (avis.reduce((s, a) => s + a.note, 0) / avis.length).toFixed(1)
    : "0";

  return (
    <div className="mt-8 space-y-6 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight dark:text-gray-100">Avis Clients</h3>
          <p className="text-[10px] font-bold text-muted-foreground dark:text-gray-400 uppercase">
            {avis.length} avis • Note moyenne : {moyenneNote}/5
          </p>
        </div>
        {/* Étoiles moyennes */}
        {avis.length > 0 && (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-4 h-4 ${parseFloat(moyenneNote) >= s ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
            ))}
          </div>
        )}
      </div>

      {/* ── Formulaire d'avis ── */}
      {isLoggedIn ? (
        /* Utilisateur connecté → formulaire normal */
        <form onSubmit={handleSubmit} className="bg-muted/30 dark:bg-gray-800/50 p-4 rounded-2xl space-y-4 border border-border dark:border-gray-700">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black text-muted-foreground dark:text-gray-400 uppercase">Quelle note donnez-vous ?</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setNote(s)} className="transition-transform active:scale-90">
                  <Star className={`w-6 h-6 ${note >= s ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 dark:text-gray-600"}`} />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Partagez votre expérience avec ce produit..."
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            className="bg-background dark:bg-gray-900 rounded-xl border-border dark:border-gray-700 text-sm dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          <Button type="submit" disabled={submitting} className="w-full rounded-xl font-black h-11">
            <Send className="w-4 h-4 mr-2" /> {submitting ? "ENVOI..." : "PUBLIER MON AVIS"}
          </Button>
        </form>
      ) : (
        /* Visiteur non connecté → invite à créer un compte */
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h4 className="font-black text-base text-gray-900 dark:text-white">Compte requis pour donner un avis</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Créez un compte gratuit Nexora pour partager votre expérience avec ce produit et aider d'autres acheteurs.
            </p>
          </div>
          {/* Étoiles interactives (preview) */}
          <div className="flex justify-center gap-1 opacity-40">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all"
            >
              <UserPlus className="w-4 h-4" /> Créer un compte gratuit
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all"
            >
              Se connecter
            </button>
          </div>
        </div>
      )}

      {/* ── Liste des avis ── */}
      {loading ? (
        <div className="text-center py-4 text-muted-foreground dark:text-gray-400 text-sm">Chargement...</div>
      ) : avis.length === 0 ? (
        <div className="text-center py-8 bg-muted/20 dark:bg-gray-800/30 rounded-2xl border border-dashed border-border dark:border-gray-700">
          <MessageSquare className="w-8 h-8 text-muted-foreground/30 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-muted-foreground dark:text-gray-500 uppercase">Soyez le premier à donner votre avis !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {avis.map(a => (
            <div key={a.id} className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {a.user_nom.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold dark:text-gray-100">{a.user_nom}</p>
                    <p className="text-[10px] text-muted-foreground dark:text-gray-500">
                      {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${a.note >= s ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20 dark:text-gray-600"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground dark:text-gray-300 leading-relaxed">{a.commentaire}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
