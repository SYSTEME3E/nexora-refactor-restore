
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.nexora_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_prenom TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  plan TEXT NOT NULL DEFAULT 'gratuit',
  badge_premium BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'actif',
  suspended_reason TEXT,
  suspended_at TIMESTAMPTZ,
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  premium_since TIMESTAMPTZ,
  premium_expires_at TIMESTAMPTZ,
  remember_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.nexora_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nexora_users_all" ON public.nexora_users FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_nexora_users_updated_at BEFORE UPDATE ON public.nexora_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.nexora_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  is_admin_session BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.nexora_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nexora_sessions_all" ON public.nexora_sessions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.nexora_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  lu BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.nexora_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nexora_notifications_all" ON public.nexora_notifications FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.nexora_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.nexora_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.nexora_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nexora_logs_all" ON public.nexora_logs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.abonnements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'gratuit',
  montant NUMERIC NOT NULL DEFAULT 0,
  devise TEXT NOT NULL DEFAULT 'USD',
  date_debut TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_fin TIMESTAMPTZ,
  statut TEXT NOT NULL DEFAULT 'actif',
  mode_paiement TEXT,
  reference_paiement TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.abonnements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "abonnements_all" ON public.abonnements FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.depenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  montant NUMERIC NOT NULL DEFAULT 0,
  devise TEXT NOT NULL DEFAULT 'XOF',
  categorie TEXT NOT NULL DEFAULT 'autre',
  date_depense TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  note TEXT,
  semaine_num INTEGER,
  mois_num INTEGER,
  annee_num INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.depenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "depenses_all" ON public.depenses FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.entrees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  montant NUMERIC NOT NULL DEFAULT 0,
  devise TEXT NOT NULL DEFAULT 'XOF',
  categorie TEXT NOT NULL DEFAULT 'autre',
  date_entree TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  note TEXT,
  semaine_num INTEGER,
  mois_num INTEGER,
  annee_num INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.entrees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entrees_all" ON public.entrees FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.coffre_fort (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  type_entree TEXT NOT NULL DEFAULT 'compte',
  email_identifiant TEXT,
  mot_de_passe_visible TEXT,
  site_url TEXT,
  telephone TEXT,
  note TEXT,
  ordre INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.coffre_fort ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coffre_fort_all" ON public.coffre_fort FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.liens_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  valeur TEXT NOT NULL,
  type_entree TEXT NOT NULL DEFAULT 'lien',
  description TEXT,
  ordre INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.liens_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "liens_contacts_all" ON public.liens_contacts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.prets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  nom_personne TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'pret',
  montant NUMERIC NOT NULL,
  montant_rembourse NUMERIC NOT NULL DEFAULT 0,
  devise TEXT NOT NULL DEFAULT 'XOF',
  date_pret TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  date_echeance TEXT,
  objectif TEXT NOT NULL DEFAULT '',
  note TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente',
  nom_temoin TEXT,
  signature_preteur TEXT,
  signature_emprunteur TEXT,
  signature_temoin TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.prets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prets_all" ON public.prets FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.remboursements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  pret_id UUID NOT NULL REFERENCES public.prets(id) ON DELETE CASCADE,
  montant NUMERIC NOT NULL,
  devise TEXT NOT NULL DEFAULT 'XOF',
  date_remboursement TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.remboursements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "remboursements_all" ON public.remboursements FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.factures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  client_nom TEXT NOT NULL,
  client_email TEXT,
  client_tel TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  sous_total NUMERIC NOT NULL DEFAULT 0,
  taxe NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  devise TEXT NOT NULL DEFAULT 'XOF',
  statut TEXT NOT NULL DEFAULT 'brouillon',
  date_emission TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  date_echeance TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "factures_all" ON public.factures FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.investissements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT,
  montant_objectif NUMERIC NOT NULL DEFAULT 0,
  montant_actuel NUMERIC NOT NULL DEFAULT 0,
  devise TEXT NOT NULL DEFAULT 'XOF',
  type_investissement TEXT NOT NULL DEFAULT 'epargne',
  date_debut TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  date_objectif TEXT,
  statut TEXT NOT NULL DEFAULT 'actif',
  contrat_accepte BOOLEAN NOT NULL DEFAULT false,
  contrat_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.investissements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investissements_all" ON public.investissements FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.versements_investissement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  investissement_id UUID NOT NULL REFERENCES public.investissements(id) ON DELETE CASCADE,
  montant NUMERIC NOT NULL,
  devise TEXT NOT NULL DEFAULT 'XOF',
  date_versement TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  note TEXT,
  type TEXT NOT NULL DEFAULT 'depot',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.versements_investissement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "versements_investissement_all" ON public.versements_investissement FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.boutiques (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  actif BOOLEAN NOT NULL DEFAULT true,
  type_boutique TEXT NOT NULL DEFAULT 'physique',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.boutiques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boutiques_all" ON public.boutiques FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.produits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  boutique_id UUID NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT,
  prix NUMERIC NOT NULL,
  prix_promo NUMERIC,
  categorie TEXT,
  type_produit TEXT NOT NULL DEFAULT 'physique',
  stock INTEGER NOT NULL DEFAULT 0,
  stock_illimite BOOLEAN NOT NULL DEFAULT false,
  photos JSONB DEFAULT '[]'::jsonb,
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produits_all" ON public.produits FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.commandes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  boutique_id UUID NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  client_nom TEXT NOT NULL,
  client_email TEXT,
  client_tel TEXT,
  client_adresse TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL DEFAULT 0,
  devise TEXT NOT NULL DEFAULT 'XOF',
  statut TEXT NOT NULL DEFAULT 'en_attente',
  statut_paiement TEXT NOT NULL DEFAULT 'en_attente',
  acheteur_id UUID REFERENCES public.nexora_users(id),
  produit_id UUID REFERENCES public.produits(id),
  montant NUMERIC NOT NULL DEFAULT 0,
  kkiapay_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commandes_all" ON public.commandes FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.medias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  url TEXT NOT NULL,
  type_media TEXT NOT NULL DEFAULT 'image',
  description TEXT,
  taille_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.medias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medias_all" ON public.medias FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  icone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_all" ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.app_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  access_code_hash TEXT NOT NULL DEFAULT 'DEFAULT_HASH',
  avatar_url TEXT,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  login_token TEXT,
  theme_color TEXT NOT NULL DEFAULT '#1d4ed8',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_users_all" ON public.app_users FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL DEFAULT 'Admin',
  email TEXT NOT NULL DEFAULT 'admin@nexora.com',
  avatar_url TEXT,
  access_code_hash TEXT NOT NULL DEFAULT 'DEFAULT_HASH',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.nexora_annonces_immo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.nexora_users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT,
  prix NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'maison',
  ville TEXT NOT NULL DEFAULT '',
  quartier TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  contact TEXT NOT NULL DEFAULT '',
  whatsapp TEXT,
  statut TEXT NOT NULL DEFAULT 'disponible',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.nexora_annonces_immo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nexora_annonces_immo_all" ON public.nexora_annonces_immo FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_depenses_user_id ON public.depenses(user_id);
CREATE INDEX idx_entrees_user_id ON public.entrees(user_id);
CREATE INDEX idx_coffre_fort_user_id ON public.coffre_fort(user_id);
CREATE INDEX idx_liens_contacts_user_id ON public.liens_contacts(user_id);
CREATE INDEX idx_prets_user_id ON public.prets(user_id);
CREATE INDEX idx_factures_user_id ON public.factures(user_id);
CREATE INDEX idx_investissements_user_id ON public.investissements(user_id);
CREATE INDEX idx_boutiques_user_id ON public.boutiques(user_id);
CREATE INDEX idx_medias_user_id ON public.medias(user_id);
CREATE INDEX idx_nexora_notifications_user_id ON public.nexora_notifications(user_id);
CREATE INDEX idx_nexora_sessions_token ON public.nexora_sessions(session_token);

ALTER PUBLICATION supabase_realtime ADD TABLE public.nexora_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commandes;
