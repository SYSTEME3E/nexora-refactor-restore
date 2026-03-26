
CREATE TABLE public.avis_produits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_nom text NOT NULL DEFAULT '',
  produit_id uuid DEFAULT NULL,
  annonce_id uuid DEFAULT NULL,
  note integer NOT NULL DEFAULT 5,
  commentaire text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.avis_produits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "avis_produits_all" ON public.avis_produits FOR ALL TO public USING (true) WITH CHECK (true);

CREATE INDEX idx_avis_produit ON public.avis_produits(produit_id);
CREATE INDEX idx_avis_annonce ON public.avis_produits(annonce_id);
