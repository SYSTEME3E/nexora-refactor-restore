-- Étendre la table des boutiques pour correspondre au code existant
ALTER TABLE public.boutiques
  ADD COLUMN IF NOT EXISTS banniere_url text,
  ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS telephone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS adresse text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pays text NOT NULL DEFAULT 'Bénin',
  ADD COLUMN IF NOT EXISTS ville text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS devise text NOT NULL DEFAULT 'XOF',
  ADD COLUMN IF NOT EXISTS pixel_facebook_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pixel_actif boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS api_conversion_token text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS api_conversion_actif boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS domaine_personnalise text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS domaine_actif boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notifications_actives boolean NOT NULL DEFAULT true;

-- Étendre la table des produits pour correspondre au code existant
ALTER TABLE public.produits
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'physique',
  ADD COLUMN IF NOT EXISTS vedette boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paiement_reception boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS paiement_lien text,
  ADD COLUMN IF NOT EXISTS moyens_paiement jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS politique_remboursement text,
  ADD COLUMN IF NOT EXISTS politique_confidentialite text,
  ADD COLUMN IF NOT EXISTS reseaux_sociaux jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS poids text,
  ADD COLUMN IF NOT EXISTS dimensions text,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_titre text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS type_digital text,
  ADD COLUMN IF NOT EXISTS mode_tarification text,
  ADD COLUMN IF NOT EXISTS fichier_url text,
  ADD COLUMN IF NOT EXISTS fichier_nom text,
  ADD COLUMN IF NOT EXISTS fichier_taille text,
  ADD COLUMN IF NOT EXISTS modules jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS protection_antipiratage boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS livraison_automatique boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS nb_telechargements integer;

UPDATE public.produits
SET type = COALESCE(NULLIF(type, ''), CASE WHEN type_produit = 'physique' THEN 'physique' ELSE 'numerique' END)
WHERE type IS NULL OR type = '';

-- Variations de produits
CREATE TABLE IF NOT EXISTS public.variations_produit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  nom text NOT NULL,
  valeurs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.variations_produit ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'variations_produit' AND policyname = 'variations_produit_all'
  ) THEN
    CREATE POLICY variations_produit_all
    ON public.variations_produit
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_variations_produit_produit_id ON public.variations_produit(produit_id);

-- Étendre les annonces immobilières pour correspondre au code existant
ALTER TABLE public.nexora_annonces_immo
  ADD COLUMN IF NOT EXISTS auteur_nom text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS favoris jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Bucket média pour les uploads images/fichiers
INSERT INTO storage.buckets (id, name, public)
SELECT 'mes-secrets-media', 'mes-secrets-media', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'mes-secrets-media'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'mes_secrets_media_public_select'
  ) THEN
    CREATE POLICY mes_secrets_media_public_select
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'mes-secrets-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'mes_secrets_media_public_insert'
  ) THEN
    CREATE POLICY mes_secrets_media_public_insert
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'mes-secrets-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'mes_secrets_media_public_update'
  ) THEN
    CREATE POLICY mes_secrets_media_public_update
    ON storage.objects
    FOR UPDATE
    TO public
    USING (bucket_id = 'mes-secrets-media')
    WITH CHECK (bucket_id = 'mes-secrets-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'mes_secrets_media_public_delete'
  ) THEN
    CREATE POLICY mes_secrets_media_public_delete
    ON storage.objects
    FOR DELETE
    TO public
    USING (bucket_id = 'mes-secrets-media');
  END IF;
END $$;