import { useState } from "react";
import { Star, Send, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SectionAvisProps {
  produitId: string;
  nomProduit: string;
}

export default function SectionAvis({ produitId, nomProduit }: SectionAvisProps) {
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");

  return (
    <div className="mt-8 space-y-6 border-t pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">Avis Clients</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Retours sur {nomProduit}</p>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="bg-muted/30 p-4 rounded-2xl space-y-4 border border-border">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase">Quelle note donnez-vous ?</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setNote(s)} className="transition-transform active:scale-90">
                <Star className={`w-6 h-6 ${note >= s ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          placeholder="Écrivez votre avis ici..."
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          className="bg-background rounded-xl border-border text-sm"
        />

        <Button type="submit" className="w-full rounded-xl font-black h-11">
          <Send className="w-4 h-4 mr-2" /> PUBLIER MON AVIS
        </Button>
      </form>

      <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border">
        <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs font-bold text-muted-foreground uppercase">Soyez le premier à donner votre avis !</p>
      </div>
    </div>
  );
}
