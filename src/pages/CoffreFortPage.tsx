import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { playSuccessSound } from "@/lib/app-utils";
import { getNexoraUser } from "@/lib/nexora-auth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Eye, EyeOff, Trash2, ExternalLink, Globe, User, Key, Lock, FileText, Edit2, Copy, Check, FolderPlus, Folder, ChevronDown, ChevronUp, ShieldCheck
} from "lucide-react";

interface CoffreGroup {
  id: string;
  nom: string;
  fields: CoffreItem[];
}

interface CoffreItem {
  id: string;
  type_entree: string;
  nom: string;
  site_url?: string;
  email_identifiant?: string;
  mot_de_passe_visible?: string;
  telephone?: string;
  note?: string;
  ordre: number;
  created_at: string;
}

export default function CoffreFortPage() {
  const [items, setItems] = useState<CoffreItem[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const user = getNexoraUser();
  const userId = user?.id;

  const [form, setForm] = useState({
    nom: "", site_url: "", email_identifiant: "", mot_de_passe_visible: "", telephone: "", note: "", type_entree: "compte",
  });

  // Group management
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => { if (userId) loadItems(); }, [userId]);

  const loadItems = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("coffre_fort")
      .select("*")
      .eq("user_id", userId)
      .order("type_entree")
      .order("ordre")
      .order("created_at", { ascending: false });
    setItems((data || []) as CoffreItem[]);
    setLoading(false);
  };

  // Group items by type_entree
  const groups: Record<string, CoffreItem[]> = {};
  items.forEach(item => {
    const group = item.type_entree || "compte";
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  });

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return (
      i.nom.toLowerCase().includes(q) ||
      (i.site_url || "").toLowerCase().includes(q) ||
      (i.email_identifiant || "").toLowerCase().includes(q)
    );
  });

  const filteredGroups: Record<string, CoffreItem[]> = {};
  filtered.forEach(item => {
    const group = item.type_entree || "compte";
    if (!filteredGroups[group]) filteredGroups[group] = [];
    filteredGroups[group].push(item);
  });

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setNewGroupName("");
    setShowGroupForm(false);
    setForm(f => ({ ...f, type_entree: newGroupName.trim().toLowerCase() }));
    setShowForm(true);
    toast({ title: "Groupe créé", description: `Ajoutez un champ dans le groupe "${newGroupName.trim()}"` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !userId) return;
    const payload: any = {
      type_entree: form.type_entree || "compte",
      nom: form.nom,
      site_url: form.site_url || null,
      email_identifiant: form.email_identifiant || null,
      mot_de_passe_visible: form.mot_de_passe_visible || null,
      telephone: form.telephone || null,
      note: form.note || null,
      user_id: userId,
    };
    let error;
    if (editingId) {
      const { user_id, ...updatePayload } = payload;
      ({ error } = await supabase.from("coffre_fort").update(updatePayload).eq("id", editingId).eq("user_id", userId));
    } else {
      ({ error } = await supabase.from("coffre_fort").insert([payload]));
    }
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      playSuccessSound();
      toast({ title: "✅ Succès !", description: editingId ? "Modifié." : "Enregistré dans le coffre-fort." });
      resetForm();
      loadItems();
    }
  };

  const resetForm = () => {
    setForm({ nom: "", site_url: "", email_identifiant: "", mot_de_passe_visible: "", telephone: "", note: "", type_entree: "compte" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (item: CoffreItem) => {
    setForm({
      nom: item.nom,
      site_url: item.site_url || "",
      email_identifiant: item.email_identifiant || "",
      mot_de_passe_visible: item.mot_de_passe_visible || "",
      telephone: item.telephone || "",
      note: item.note || "",
      type_entree: item.type_entree || "compte",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    await supabase.from("coffre_fort").delete().eq("id", id).eq("user_id", userId);
    toast({ title: "Supprimé" });
    loadItems();
  };

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (text: string, fieldId: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast({ title: `✅ ${label} copié !` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: prev[group] === false ? true : prev[group] === undefined ? false : !prev[group] }));
  };

  const groupNames = Object.keys(filteredGroups);

  return (
    <AppLayout searchQuery={search} onSearchChange={setSearch}>
      <div className="space-y-5 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" /> Coffre-fort
            </h1>
            <p className="text-sm text-muted-foreground">Vos comptes et identifiants sécurisés</p>
          </div>
          <Button onClick={() => setShowGroupForm(true)} variant="outline" size="sm" className="gap-1.5">
            <FolderPlus className="w-4 h-4" /> Nouveau groupe
          </Button>
          <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gap-1.5 bg-primary text-primary-foreground">
            <Plus className="w-4 h-4" /> Ajouter un champ
          </Button>
        </div>

        {/* Group creation */}
        {showGroupForm && (
          <div className="bg-card border border-primary/20 rounded-xl p-4 shadow-brand animate-fade-in-up flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground">Nom du groupe</label>
              <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Ex: Réseaux sociaux, Banques..." className="mt-1" />
            </div>
            <Button onClick={handleCreateGroup} size="sm" className="bg-primary text-primary-foreground">Créer</Button>
            <Button onClick={() => setShowGroupForm(false)} variant="outline" size="sm">Annuler</Button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-card border border-primary/20 rounded-xl p-5 shadow-brand animate-fade-in-up">
            <h3 className="font-display font-bold mb-4 text-primary flex items-center gap-2">
              <Lock className="w-4 h-4" /> {editingId ? "Modifier le champ" : "Nouveau champ"}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Groupe</label>
                <select value={form.type_entree} onChange={e => setForm(f => ({ ...f, type_entree: e.target.value }))} className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="compte">Compte (par défaut)</option>
                  {Object.keys(groups).filter(g => g !== "compte").map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <Input placeholder="Nom du site / service *" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required className="sm:col-span-2" />
              <Input placeholder="Lien du site (https://...)" value={form.site_url} onChange={e => setForm(f => ({ ...f, site_url: e.target.value }))} className="sm:col-span-2" />
              <Input placeholder="Email / Identifiant" value={form.email_identifiant} onChange={e => setForm(f => ({ ...f, email_identifiant: e.target.value }))} />
              <Input type="password" placeholder="Mot de passe" value={form.mot_de_passe_visible} onChange={e => setForm(f => ({ ...f, mot_de_passe_visible: e.target.value }))} />
              <Input placeholder="Téléphone" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
              <Input placeholder="Note (optionnel)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
                <Button type="submit" className="bg-primary text-primary-foreground">✅ Enregistrer</Button>
              </div>
            </form>
          </div>
        )}

        {/* Items grouped */}
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement...</div>
        ) : groupNames.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-xl">
            <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {search ? "Aucun résultat" : "Aucun compte enregistré — cliquez sur « Ajouter »"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupNames.map(groupName => {
              const groupItems = filteredGroups[groupName];
              const isOpen = expandedGroups[groupName] !== false;
              return (
                <div key={groupName} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button onClick={() => toggleGroup(groupName)} className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                    <Folder className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm capitalize flex-1">{groupName}</span>
                    <span className="text-xs text-muted-foreground">{groupItems.length} champ(s)</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {isOpen && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-3">
                      {groupItems.map(item => {
                        const showPwd = visiblePasswords[item.id];
                        return (
                          <div key={item.id} className="bg-background border border-border rounded-xl p-4 card-hover">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Lock className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-foreground truncate">{item.nom}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(item.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              {item.site_url && (
                                <div className="flex items-center gap-2">
                                  <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  <a href={item.site_url.startsWith("http") ? item.site_url : `https://${item.site_url}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate flex items-center gap-1 flex-1">
                                    {item.site_url} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </a>
                                  <button onClick={() => copyToClipboard(item.site_url!, `url-${item.id}`, "Lien")} className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0">
                                    {copiedField === `url-${item.id}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                                  </button>
                                </div>
                              )}
                              {item.email_identifiant && (
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="text-foreground truncate flex-1">{item.email_identifiant}</span>
                                  <button onClick={() => copyToClipboard(item.email_identifiant!, `email-${item.id}`, "Email")} className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0">
                                    {copiedField === `email-${item.id}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                                  </button>
                                </div>
                              )}
                              {item.mot_de_passe_visible && (
                                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 py-1.5">
                                  <Key className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="flex-1 font-mono text-sm">
                                    {showPwd ? item.mot_de_passe_visible : "•".repeat(Math.min(item.mot_de_passe_visible.length, 14))}
                                  </span>
                                  <button onClick={() => copyToClipboard(item.mot_de_passe_visible!, `pwd-${item.id}`, "Mot de passe")} className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0">
                                    {copiedField === `pwd-${item.id}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                                  </button>
                                  <button onClick={() => togglePassword(item.id)} className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0">
                                    {showPwd ? <EyeOff className="w-3.5 h-3.5 text-primary" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                                  </button>
                                </div>
                              )}
                              {item.telephone && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">📞</span>
                                  <span className="text-foreground text-sm">{item.telephone}</span>
                                </div>
                              )}
                              {item.note && (
                                <div className="flex items-start gap-2 mt-2 p-2 bg-accent/20 rounded-lg">
                                  <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground text-xs">{item.note}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Security note */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Vos coordonnées sont sécurisées</p>
            <p className="text-xs text-emerald-600 mt-1">
              Toutes vos données sont stockées de manière sécurisée et accessibles uniquement depuis votre compte. Personne d'autre ne peut y accéder.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}