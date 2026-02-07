
-- Create vault_documents table
CREATE TABLE public.vault_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type_id TEXT NOT NULL,
  category TEXT NOT NULL,
  display_name TEXT NOT NULL,
  storage_path TEXT,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  inline_content TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own vault documents"
ON public.vault_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault documents"
ON public.vault_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault documents"
ON public.vault_documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault documents"
ON public.vault_documents FOR DELETE
USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_vault_documents_updated_at
BEFORE UPDATE ON public.vault_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_vault_documents_user_id ON public.vault_documents(user_id);
CREATE UNIQUE INDEX idx_vault_documents_user_type ON public.vault_documents(user_id, document_type_id);

-- Private storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault-documents', 'vault-documents', false);

-- Storage RLS policies
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vault-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (bucket_id = 'vault-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vault-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'vault-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
