
-- Table vendeurs crypto
CREATE TABLE IF NOT EXISTS public.crypto_sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  payment_reseau text DEFAULT '',
  payment_numero text DEFAULT '',
  payment_lien text DEFAULT '',
  whatsapp text DEFAULT '',
  reserve numeric NOT NULL DEFAULT 0,
  max_sell numeric NOT NULL DEFAULT 500000,
  min_sell numeric NOT NULL DEFAULT 5000,
  daily_limit numeric NOT NULL DEFAULT 2000000,
  allowed_cryptos jsonb NOT NULL DEFAULT '[]'::jsonb,
  allowed_countries jsonb NOT NULL DEFAULT '[]'::jsonb,
  expires_at timestamptz,
  active_days integer NOT NULL DEFAULT 30,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.crypto_sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crypto_sellers_read" ON public.crypto_sellers FOR SELECT USING (true);
CREATE POLICY "crypto_sellers_write" ON public.crypto_sellers FOR INSERT WITH CHECK (true);
CREATE POLICY "crypto_sellers_update" ON public.crypto_sellers FOR UPDATE USING (true);
CREATE POLICY "crypto_sellers_delete" ON public.crypto_sellers FOR DELETE USING (true);

-- Table annonces crypto
CREATE TABLE IF NOT EXISTS public.crypto_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  seller_name text NOT NULL DEFAULT '',
  crypto text NOT NULL,
  custom_crypto_name text,
  rate numeric NOT NULL DEFAULT 0,
  min_amount numeric NOT NULL DEFAULT 0,
  max_amount numeric NOT NULL DEFAULT 0,
  available numeric NOT NULL DEFAULT 0,
  network_fee numeric NOT NULL DEFAULT 0,
  wallet_address text DEFAULT '',
  payment_methods jsonb NOT NULL DEFAULT '[]'::jsonb,
  allowed_countries jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crypto_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crypto_offers_read" ON public.crypto_offers FOR SELECT USING (true);
CREATE POLICY "crypto_offers_write" ON public.crypto_offers FOR INSERT WITH CHECK (true);
CREATE POLICY "crypto_offers_update" ON public.crypto_offers FOR UPDATE USING (true);
CREATE POLICY "crypto_offers_delete" ON public.crypto_offers FOR DELETE USING (true);

-- Table commandes crypto
CREATE TABLE IF NOT EXISTS public.crypto_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL,
  crypto text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  amount_fcfa numeric NOT NULL DEFAULT 0,
  network_fee numeric NOT NULL DEFAULT 0,
  total_fcfa numeric NOT NULL DEFAULT 0,
  wallet_addr text NOT NULL DEFAULT '',
  seller_id uuid NOT NULL,
  seller_name text NOT NULL DEFAULT '',
  buyer_id uuid NOT NULL,
  buyer_name text NOT NULL DEFAULT '',
  buyer_whatsapp text DEFAULT '',
  buyer_country text DEFAULT '',
  payment_message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  offer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crypto_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crypto_orders_read" ON public.crypto_orders FOR SELECT USING (true);
CREATE POLICY "crypto_orders_write" ON public.crypto_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "crypto_orders_update" ON public.crypto_orders FOR UPDATE USING (true);
CREATE POLICY "crypto_orders_delete" ON public.crypto_orders FOR DELETE USING (true);
