
CREATE TABLE public.vault_document_exclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_type_id)
);

ALTER TABLE public.vault_document_exclusions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exclusions"
  ON public.vault_document_exclusions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exclusions"
  ON public.vault_document_exclusions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exclusions"
  ON public.vault_document_exclusions FOR DELETE
  USING (auth.uid() = user_id);
