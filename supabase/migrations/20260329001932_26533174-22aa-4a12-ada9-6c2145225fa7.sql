
-- Table pour stocker les transactions de paiement GeniusPay
CREATE TABLE IF NOT EXISTS public.nexora_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  moneroo_id text,
  type text NOT NULL DEFAULT 'recharge_transfert',
  amount numeric NOT NULL DEFAULT 0,
  frais numeric NOT NULL DEFAULT 100,
  currency text NOT NULL DEFAULT 'XOF',
  status text NOT NULL DEFAULT 'pending',
  checkout_url text,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nexora_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nexora_transactions_all" ON public.nexora_transactions FOR ALL USING (true) WITH CHECK (true);

-- Table pour stocker les payouts (retraits)
CREATE TABLE IF NOT EXISTS public.nexora_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  moneroo_id text,
  type text NOT NULL DEFAULT 'retrait_transfert',
  amount numeric NOT NULL DEFAULT 0,
  amount_net numeric NOT NULL DEFAULT 0,
  frais numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XOF',
  status text NOT NULL DEFAULT 'pending',
  pays text,
  reseau text,
  moneroo_code text,
  numero text,
  nom_beneficiaire text,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nexora_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nexora_payouts_all" ON public.nexora_payouts FOR ALL USING (true) WITH CHECK (true);

-- Table pour les comptes transfert (solde utilisateur)
CREATE TABLE IF NOT EXISTS public.nexora_transfert_comptes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  solde numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nexora_transfert_comptes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nexora_transfert_comptes_all" ON public.nexora_transfert_comptes FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.nexora_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nexora_transfert_comptes;
