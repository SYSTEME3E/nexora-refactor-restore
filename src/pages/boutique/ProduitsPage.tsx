import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BoutiqueLayout from "@/components/BoutiqueLayout";
import { getNexoraUser, hasNexoraPremium } from "@/lib/nexora-auth";
import { useNavigate } from "react-router-dom";
import {
  Plus, Trash2, ChevronDown, ChevronUp, Package,
  Star, Edit2, FileText, BookOpen, Key, Package2,
  Briefcase, Tag, Image, AlertCircle,
  Download, Lock, Zap, Crown, MessageCircle, CheckCircle, ExternalLink
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type TypeDigital = "fichier" | "formation" | "licence" | "bundle" | "service";

interface Variation { nom: string; valeurs: string[]; }
interface PaiementProduit { reseau: string; numero: string; nom_titulaire: string; }

interface ProduitBase {
  id: string; boutique_id: string; nom: string; description: string;
  prix: number; prix_promo: number | null; photos: string[];
  actif: boolean; vedette: boolean; categorie: string; tags: string[];
  moyens_paiement: PaiementProduit[];
}

interface ProduitPhysique extends ProduitBase {
  type: "physique"; stock: number; stock_illimite: boolean;
  paiement_reception: boolean; variations?: Variation[];
}

interface ProduitDigital extends ProduitBase {
  type: "numerique"; type_digital: TypeDigital;
  fichier_url: string | null; vendeur_whatsapp: string;
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function ProduitsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isPremium = hasNexoraPremium();

  // États UI
  const [onglet, setOnglet] = useState<"physique" | "numerique">("physique");
  const [boutique, setBoutique] = useState<any>(null);
  const [produitsPhysiques, setProduitsPhysiques] = useState<ProduitPhysique[]>([]);
  const [produitsDigitaux, setProduitsDigitaux] = useState<ProduitDigital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Formulaire Unique (Adaptatif)
  const [formData, setFormData] = useState<any>({
    nom: "", description: "", prix: "", prix_promo: "",
    categorie: "", tags: [], photos: [], actif: true, vedette: true,
    // Specifique physique
    stock: "10", stock_illimite: false, paiement_reception: true,
    // Specifique digital
    type_digital: "fichier", vendeur_whatsapp: "", fichier_url: ""
  });

  const loadData = async () => {
    setLoading(true);
    const user = getNexoraUser();
    if (!user) return;

    const { data: b } = await supabase.from("boutiques").select("*").eq("user_id", user.id).maybeSingle();
    if (b) {
      setBoutique(b);
      const { data: p } = await supabase.from("produits").select("*").eq("boutique_id", b.id).order("created_at", { ascending: false });
      if (p) {
        setProduitsPhysiques(p.filter(x => x.type === "physique"));
        setProduitsDigitaux(p.filter(x => x.type === "numerique"));
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!formData.nom || !formData.prix) return toast({ title: "Nom et prix requis" });
    setSaving(true);

    const payload = {
      boutique_id: boutique.id,
      type: onglet === "physique" ? "physique" : "numerique",
      nom: formData.nom,
      description: formData.description,
      prix: parseFloat(formData.prix),
      prix_promo: formData.prix_promo ? parseFloat(formData.prix_promo) : null,
      photos: formData.photos,
      actif: formData.actif,
      vedette: formData.vedette,
      categorie: formData.categorie,
      // Champs spécifiques
      stock: onglet === "physique" ? parseInt(formData.stock) : 0,
      vendeur_whatsapp: onglet === "numerique" ? formData.vendeur_whatsapp : null,
      type_digital: onglet === "numerique" ? formData.type_digital : null,
    };

    const { error } = editingId 
      ? await supabase.from("produits").update(payload).eq("id", editingId)
      : await supabase.from("produits").insert(payload);

    if (!error) {
      toast({ title: "Produit enregistré !" });
      setShowForm(false);
      setEditingId(null);
      loadData();
    }
    setSaving(false);
  };

  const deleteProduit = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await supabase.from("produits").delete().eq("id", id);
    loadData();
  };

  if (!isPremium) return <div className="p-10 text-center font-bold">Accès Premium requis pour la boutique.</div>;

  return (
    <BoutiqueLayout boutiqueName={boutique?.nom}>
      <div className="space-y-6 pb-20">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border shadow-sm">
          <div>
            <h1 className="text-xl font-black italic">MES PRODUITS</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Gestion de stock & Ventes</p>
          </div>
          <Button onClick={() => { setEditingId(null); setFormData({ ...formData, nom: "" }); setShowForm(true); }} className="bg-primary rounded-2xl gap-2 font-bold">
            <Plus className="w-4 h-4" /> AJOUTER
          </Button>
        </div>

        {/* Sélecteur de type */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button onClick={() => setOnglet("physique")} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${onglet === "physique" ? "bg-white shadow-sm text-primary" : "text-slate-500"}`}>
            PRODUITS PHYSIQUES
          </button>
          <button onClick={() => setOnglet("numerique")} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${onglet === "numerique" ? "bg-white shadow-sm text-primary" : "text-slate-500"}`}>
            PRODUITS DIGITAUX
          </button>
        </div>

        {/* Formulaire Modal (Simplifié pour l'exemple) */}
        {showForm && (
          <div className="bg-white border-2 border-primary/20 rounded-3xl p-6 space-y-4 animate-in slide-in-from-top">
            <h2 className="font-black text-lg">CONFIGURATION DU PRODUIT</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Nom du produit" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
              <Input placeholder="Prix (FCFA)" type="number" value={formData.prix} onChange={e => setFormData({...formData, prix: e.target.value})} />
              
              {onglet === "numerique" && (
                <div className="md:col-span-2 bg-green-50 p-4 rounded-2xl border border-green-100 space-y-3">
                  <div className="flex items-center gap-2 text-green-700 font-bold text-xs uppercase">
                    <MessageCircle className="w-4 h-4" /> Tunnel de vente WhatsApp
                  </div>
                  <Input 
                    placeholder="Numéro WhatsApp (ex: 229XXXXXXXX)" 
                    value={formData.vendeur_whatsapp} 
                    onChange={e => setFormData({...formData, vendeur_whatsapp: e.target.value})}
                    className="bg-white border-green-200"
                  />
                  <p className="text-[10px] text-green-600 font-medium">
                    Après paiement, l'acheteur verra un bouton pour vous contacter sur ce numéro.
                  </p>
                </div>
              )}

              {onglet === "physique" && (
                <Input placeholder="Stock disponible" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary font-black h-12 rounded-2xl shadow-lg shadow-primary/20">
                {saving ? "ENREGISTREMENT..." : "VALIDER LE PRODUIT"}
              </Button>
              <Button onClick={() => setShowForm(false)} variant="ghost" className="font-bold">ANNULER</Button>
            </div>
          </div>
        )}

        {/* Liste des produits */}
        <div className="grid grid-cols-1 gap-4">
          {(onglet === "physique" ? produitsPhysiques : produitsDigitaux).map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-3xl border shadow-sm flex items-center gap-4 hover:border-primary/50 transition-colors group">
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border group-hover:bg-primary/5">
                {p.photos?.[0] ? <img src={p.photos[0]} className="w-full h-full object-cover rounded-2xl" /> : <Package className="text-slate-300" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">{p.nom}</h3>
                  {p.type === "numerique" && <div className="bg-blue-100 text-blue-600 p-1 rounded-md"><Zap className="w-3 h-3 fill-current" /></div>}
                </div>
                <p className="font-black text-primary text-lg">{p.prix.toLocaleString()} <span className="text-[10px]">FCFA</span></p>
                
                <div className="flex gap-4 mt-2">
                  <button onClick={() => { setEditingId(p.id); setFormData(p); setShowForm(true); }} className="text-[10px] font-bold text-slate-400 hover:text-primary flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> MODIFIER
                  </button>
                  <button onClick={() => deleteProduit(p.id)} className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> SUPPRIMER
                  </button>
                </div>
              </div>

              {/* Badges de Statut */}
              <div className="text-right">
                <div className={`text-[9px] font-black px-3 py-1 rounded-full border ${p.actif ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                  {p.actif ? "EN LIGNE" : "BROUILLON"}
                </div>
                {p.type === "physique" && (
                  <p className="text-[9px] font-bold text-slate-400 mt-2">STOCK: {p.stock}</p>
                )}
              </div>
            </div>
          ))}

          {(onglet === "physique" ? produitsPhysiques : produitsDigitaux).length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
              <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="font-bold text-slate-400">Aucun produit dans cette catégorie</p>
            </div>
          )}
        </div>
      </div>
    </BoutiqueLayout>
  );
}
