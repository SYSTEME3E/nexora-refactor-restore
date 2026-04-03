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
  Star, Edit2, ToggleLeft, ToggleRight,
  Tag, Image, AlertCircle, Crown, Share2
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ModeTarification = "unique" | "abonnement_mensuel" | "abonnement_annuel" | "versements";

interface Variation { nom: string; valeurs: string[]; }
interface PaiementProduit { reseau: string; numero: string; nom_titulaire: string; }
interface ReseauxSociaux { instagram: string; tiktok: string; facebook: string; youtube: string; whatsapp: string; site_web: string; }
interface Module { titre: string; description: string; }

interface ProduitPhysique {
  id: string; boutique_id: string; nom: string; description: string;
  prix: number; prix_promo: number | null; type: "physique"; categorie: string;
  tags: string[]; stock: number; stock_illimite: boolean; photos: string[];
  actif: boolean; vedette: boolean; paiement_reception: boolean;
  paiement_lien: string | null; moyens_paiement: PaiementProduit[];
  politique_remboursement: string; politique_confidentialite: string;
  reseaux_sociaux: ReseauxSociaux; poids: string; dimensions: string; sku: string;
  variations?: Variation[];
}


// ─── Constantes ───────────────────────────────────────────────────────────────
const CATEGORIES_PHYSIQUE = [
  "Vêtements", "Chaussures", "Accessoires", "Électronique",
  "Alimentation", "Beauté & Santé", "Maison & Déco",
  "Sport", "Enfants", "Auto & Moto", "Autre"
];

const CATEGORIES_DIGITAL = [
  "Marketing Digital", "Développement Web", "Design Graphique",
  "Business & Finance", "Photographie", "Musique & Audio",
  "Développement Personnel", "Langues", "Cuisine", "Sport & Fitness",
  "Informatique", "Art & Créativité", "Autre"
];


const MODES_TARIFICATION: Record<ModeTarification, string> = {
  unique:             "Paiement unique",
  abonnement_mensuel: "Abonnement mensuel",
  abonnement_annuel:  "Abonnement annuel",
  versements:         "Paiement en plusieurs fois",
};

const SECTIONS_PHYSIQUE = [
  { id: "general", label: "Général" }, { id: "media", label: "Médias" },
  { id: "prix", label: "Prix & Stock" }, { id: "variations", label: "Variations" },
  { id: "paiement", label: "Paiement" }, { id: "reseaux", label: "Réseaux" },
  { id: "politiques", label: "Politiques" }, { id: "seo", label: "SEO" },
];

const SECTIONS_DIGITAL = [
  { id: "type", label: "Type" }, { id: "general", label: "Général" },
  { id: "media", label: "Couverture" }, { id: "contenu", label: "Contenu" },
  { id: "prix", label: "Prix" }, { id: "paiement", label: "Paiement" },
  { id: "reseaux", label: "Réseaux" }, { id: "politiques", label: "Politiques" },
  { id: "seo", label: "SEO" },
];

function formatPrix(prix: number, devise: string = "XOF"): string {
  if (devise === "USD") return `$${prix.toFixed(2)}`;
  return Math.round(prix).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " " + devise;
}

function calcPct(prix: number, promo: number): number {
  return Math.round(((prix - promo) / prix) * 100);
}

const EMPTY_RESEAUX: ReseauxSociaux = { instagram: "", tiktok: "", facebook: "", youtube: "", whatsapp: "", site_web: "" };

const RESEAUX_LINKS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/...", icon: "📸" },
  { key: "tiktok",    label: "TikTok",    placeholder: "https://tiktok.com/@...",   icon: "🎵" },
  { key: "facebook",  label: "Facebook",  placeholder: "https://facebook.com/...",  icon: "👥" },
  { key: "youtube",   label: "YouTube",   placeholder: "https://youtube.com/@...",  icon: "▶️" },
  { key: "whatsapp",  label: "WhatsApp",  placeholder: "+229 XX XX XX XX",          icon: "💬" },
  { key: "site_web",  label: "Site web",  placeholder: "https://votre-site.com",    icon: "🌐" },
];

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ProduitsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileProduitRef = useRef<HTMLInputElement>(null);

  // ── Vérification premium
  const isPremium = hasNexoraPremium();

  const [boutique, setBoutique] = useState<any>(null);
  const [produitsPhysiques, setProduitsPhysiques] = useState<ProduitPhysique[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeSection, setActiveSection] = useState("general");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingFichier, setUploadingFichier] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const [variations, setVariations] = useState<Variation[]>([]);
  const [newVarNom, setNewVarNom] = useState("");
  const [newVarValeurs, setNewVarValeurs] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newPaiement, setNewPaiement] = useState<PaiementProduit>({ reseau: "", numero: "", nom_titulaire: "" });
  const [newModule, setNewModule] = useState<Module>({ titre: "", description: "" });

  const emptyFormPhysique = {
    nom: "", description: "", prix: "", prix_promo: "",
    categorie: "", tags: [] as string[], stock: "0", stock_illimite: false,
    photos: [] as string[], photo_url: "", actif: true, vedette: false,
    paiement_reception: true, paiement_lien: "", moyens_paiement: [] as PaiementProduit[],
    politique_remboursement: "", politique_confidentialite: "",
    reseaux_sociaux: { ...EMPTY_RESEAUX },
    poids: "", dimensions: "", sku: "", seo_titre: "", seo_description: "",
  };


  const [formP, setFormP] = useState(emptyFormPhysique);

  const pctP = formP.prix && formP.prix_promo ? calcPct(parseFloat(formP.prix), parseFloat(formP.prix_promo)) : 0;

  const load = async () => {
    setLoading(true);
    const userId = getNexoraUser()?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    const { data: b } = await supabase
      .from("boutiques" as any)
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (b) {
      setBoutique(b);
      const { data: phys } = await supabase
        .from("produits" as any).select("*, variations_produit(*)")
        .eq("boutique_id", (b as any).id).eq("type", "physique")
        .order("created_at", { ascending: false });
      setProduitsPhysiques((phys as any[] || []).map(p => ({
        ...p, variations: p.variations_produit || [],
        moyens_paiement: p.moyens_paiement || [], tags: p.tags || [],
        reseaux_sociaux: p.reseaux_sociaux || {},
      })));

    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Mur premium ──────────────────────────────────────────────────────────────
  if (!isPremium) {
    return (
      <BoutiqueLayout boutiqueName="Nexora Shop">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mb-6 shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Fonctionnalité Premium</h2>
          <p className="text-gray-500 text-sm mb-1 max-w-xs">
            La boutique est réservée aux membres <span className="font-bold text-yellow-600">Premium</span>.
          </p>
          <p className="text-gray-400 text-xs mb-8 max-w-xs">
            Passez au plan Premium pour créer votre boutique, ajouter vos produits et gérer vos commandes.
          </p>
          <Button
            onClick={() => navigate("/boutique/parametres")}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold px-8 py-3 rounded-xl shadow-md gap-2"
          >
            <Crown className="w-4 h-4" /> Passer à Premium
          </Button>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </BoutiqueLayout>
    );
  }

  // ── Copier le lien du produit ─────────────────────────────────────────────
  const copyLink = (produitId: string) => {
    if (!boutique?.slug) {
      toast({ title: "Configurez d'abord votre boutique", variant: "destructive" });
      return;
    }
    const link = `${window.location.origin}/shop/${boutique.slug}/produit/${produitId}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Lien copié !", description: link });
  };

  // ── Upload photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `produits/${""}${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("mes-secrets-media").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("mes-secrets-media").getPublicUrl(path);
      setFormP(prev => ({ ...prev, photos: [...prev.photos, urlData.publicUrl] }));
      toast({ title: "Photo ajoutée !" });
    } catch (err: any) {
      toast({ title: "Erreur upload", description: err.message, variant: "destructive" });
    }
    setUploadingPhoto(false);
  };

  const handleFichierUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFichier(true);
    try {
      const path = `produits/fichiers/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("mes-secrets-media").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("mes-secrets-media").getPublicUrl(path);
      const taille = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;
      toast({ title: "Fichier uploadé !" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
    setUploadingFichier(false);
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    setFormP(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
    setNewTag("");
  };

  const addVariation = () => {
    if (!newVarNom) return;
    const valeurs = newVarValeurs.split(",").map(v => v.trim()).filter(Boolean);
    if (!valeurs.length) return;
    setVariations(prev => [...prev, { nom: newVarNom, valeurs }]);
    setNewVarNom(""); setNewVarValeurs("");
  };

  const addModule = () => {
    if (!newModule.titre) return;
    setNewModule({ titre: "", description: "" });
  };

  const addPaiement = () => {
    if (!newPaiement.reseau || !newPaiement.numero) {
      toast({ title: "Réseau et numéro requis", variant: "destructive" }); return;
    }
    setFormP(prev => ({ ...prev, moyens_paiement: [...prev.moyens_paiement, { ...newPaiement }] }));
    setNewPaiement({ reseau: "", numero: "", nom_titulaire: "" });
  };

  const handleSubmitPhysique = async () => {
    if (!boutique) { toast({ title: "Configurez d'abord votre boutique", variant: "destructive" }); return; }
    if (!formP.nom || !formP.prix) { toast({ title: "Nom et prix obligatoires", variant: "destructive" }); return; }
    setSaving(true);
    const payload = {
      boutique_id: boutique.id, type: "physique",
      nom: formP.nom, description: formP.description || null,
      prix: parseFloat(formP.prix), prix_promo: formP.prix_promo ? parseFloat(formP.prix_promo) : null,
      categorie: formP.categorie || null, tags: formP.tags,
      stock: formP.stock_illimite ? 0 : parseInt(formP.stock) || 0,
      stock_illimite: formP.stock_illimite, photos: formP.photos,
      actif: formP.actif, vedette: formP.vedette,
      paiement_reception: formP.paiement_reception, paiement_lien: formP.paiement_lien || null,
      moyens_paiement: formP.moyens_paiement,
      politique_remboursement: formP.politique_remboursement || null,
      politique_confidentialite: formP.politique_confidentialite || null,
      reseaux_sociaux: formP.reseaux_sociaux,
      poids: formP.poids || null, dimensions: formP.dimensions || null, sku: formP.sku || null,
      seo_titre: formP.seo_titre || null, seo_description: formP.seo_description || null,
    };
    let produitId = editingId;
    if (editingId) {
      const { error } = await supabase.from("produits" as any).update(payload).eq("id", editingId);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); setSaving(false); return; }
      await supabase.from("variations_produit" as any).delete().eq("produit_id", editingId);
    } else {
      const { data, error } = await supabase.from("produits" as any).insert(payload).select().single();
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); setSaving(false); return; }
      produitId = (data as any).id;
    }
    if (variations.length > 0 && produitId) {
      await supabase.from("variations_produit" as any).insert(
        variations.map(v => ({ produit_id: produitId, nom: v.nom, valeurs: v.valeurs }))
      );
    }
    toast({ title: `Produit ${editingId ? "modifié" : "créé"} avec succès !` });
    setShowForm(false); setFormP(emptyFormPhysique); setVariations([]); setEditingId(null); setSaving(false); load();
  };


  const handleEditPhysique = (p: ProduitPhysique) => {
    setFormP({
      nom: p.nom, description: p.description || "",
      prix: String(p.prix), prix_promo: String(p.prix_promo || ""),
      categorie: p.categorie || "", tags: p.tags || [],
      stock: String(p.stock), stock_illimite: p.stock_illimite,
      photos: p.photos || [], photo_url: "", actif: p.actif, vedette: p.vedette,
      paiement_reception: p.paiement_reception ?? true, paiement_lien: p.paiement_lien || "",
      moyens_paiement: p.moyens_paiement || [],
      politique_remboursement: p.politique_remboursement || "",
      politique_confidentialite: p.politique_confidentialite || "",
      reseaux_sociaux: p.reseaux_sociaux || { ...EMPTY_RESEAUX },
      poids: p.poids || "", dimensions: p.dimensions || "", sku: p.sku || "",
      seo_titre: (p as any).seo_titre || "", seo_description: (p as any).seo_description || "",
    });
    setVariations(p.variations || []);
    setEditingId(p.id); setActiveSection("general"); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  // ── Suppression corrigée : supprime d'abord les variations liées, puis le produit ──
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;

    // 1. Supprimer les variations liées
    await supabase.from("variations_produit" as any).delete().eq("produit_id", id);

    // 2. Supprimer le produit
    const { error } = await supabase.from("produits" as any).delete().eq("id", id);

    if (error) {
      toast({ title: "Erreur lors de la suppression", description: error.message, variant: "destructive" });
      return;
    }

    // 3. Mettre à jour l'état local immédiatement sans recharger
    setProduitsPhysiques(prev => prev.filter(p => p.id !== id));

    toast({ title: "Produit supprimé" });
  };

  const toggleField = async (id: string, field: "actif" | "vedette", value: boolean) => {
    await supabase.from("produits" as any).update({ [field]: value }).eq("id", id); load();
  };

  const resetForm = () => {
    setShowForm(false); setEditingId(null);
    setFormP(emptyFormPhysique);
    setVariations([]);
    setActiveSection("general");
  };


  return (
    <BoutiqueLayout boutiqueName={boutique?.nom} boutiqueSlug={boutique?.slug}>
      <div className="space-y-5 pb-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100">Produits</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {produitsPhysiques.length} produit{produitsPhysiques.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="bg-pink-500 hover:bg-pink-600 text-white gap-1">
            <Plus className="w-4 h-4" /> Nouveau
          </Button>
        </div>
