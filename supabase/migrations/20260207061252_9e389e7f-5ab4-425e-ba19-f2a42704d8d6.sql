CREATE TABLE public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  invited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, contact_email)
);

ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON public.trusted_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON public.trusted_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON public.trusted_contacts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON public.trusted_contacts FOR UPDATE
  USING (auth.uid() = user_id);