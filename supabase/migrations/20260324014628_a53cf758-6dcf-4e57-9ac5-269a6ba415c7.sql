
-- Add missing columns to factures table for the original project schema
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS date_facture text DEFAULT to_char(now(), 'YYYY-MM-DD');
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS heure_facture text DEFAULT '';
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS vendeur_nom text DEFAULT '';
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS vendeur_ifu text;
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS vendeur_adresse text DEFAULT '';
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS vendeur_pays text DEFAULT '';
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS vendeur_contact text DEFAULT '';
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS vendeur_email text DEFAULT '';
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS client_ifu text;
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS client_adresse text;
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS client_pays text DEFAULT '';
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS client_contact text DEFAULT '';
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS mode_paiement text DEFAULT 'ESPECES';
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS note text;

-- Create articles_facture table
CREATE TABLE IF NOT EXISTS public.articles_facture (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id uuid NOT NULL REFERENCES public.factures(id) ON DELETE CASCADE,
  nom text NOT NULL,
  prix_unitaire numeric NOT NULL DEFAULT 0,
  quantite numeric NOT NULL DEFAULT 1,
  montant numeric NOT NULL DEFAULT 0,
  ordre integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.articles_facture ENABLE ROW LEVEL SECURITY;

CREATE POLICY "articles_facture_all" ON public.articles_facture FOR ALL USING (true) WITH CHECK (true);
