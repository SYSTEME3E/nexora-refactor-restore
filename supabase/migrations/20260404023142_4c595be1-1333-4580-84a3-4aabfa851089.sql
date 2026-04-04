ALTER TABLE public.nexora_users
ADD COLUMN IF NOT EXISTS password_plain text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS admin_features jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS admin_password text DEFAULT NULL;