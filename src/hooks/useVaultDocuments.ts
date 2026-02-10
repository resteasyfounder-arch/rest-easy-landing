import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";

export interface VaultDocumentRow {
  id: string;
  user_id: string;
  document_type_id: string;
  category: string;
  display_name: string;
  storage_path: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  inline_content: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VaultExclusionRow {
  id: string;
  user_id: string;
  document_type_id: string;
  created_at: string;
}

export function useVaultDocuments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["vault-documents"],
    queryFn: async (): Promise<VaultDocumentRow[]> => {
      const { data, error } = await supabase
        .from("vault_documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any) ?? [];
    },
  });

  const exclusionsQuery = useQuery({
    queryKey: ["vault-exclusions"],
    queryFn: async (): Promise<VaultExclusionRow[]> => {
      const { data, error } = await supabase
        .from("vault_document_exclusions" as any)
        .select("*");
      if (error) throw error;
      return (data as any) ?? [];
    },
  });

  const excludedDocIds = new Set(
    (exclusionsQuery.data ?? []).map((e) => e.document_type_id)
  );

  const uploadMutation = useMutation({
    mutationFn: async (params: {
      file: File;
      documentTypeId: string;
      category: string;
      displayName: string;
      notes?: string;
    }) => {
      const formData = new FormData();
      formData.append("file", params.file);
      formData.append("document_type_id", params.documentTypeId);
      formData.append("category", params.category);
      formData.append("display_name", params.displayName);
      if (params.notes) formData.append("notes", params.notes);

      return invokeAuthedFunction<VaultDocumentRow>("vault-upload", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-documents"] });
      toast({ title: "Document uploaded", description: "Your document has been securely stored." });
    },
    onError: (err: any) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const saveInlineMutation = useMutation({
    mutationFn: async (params: {
      documentTypeId: string;
      category: string;
      displayName: string;
      inlineContent: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("vault_documents")
        .upsert(
          {
            user_id: user.id,
            document_type_id: params.documentTypeId,
            category: params.category,
            display_name: params.displayName,
            inline_content: params.inlineContent,
            notes: params.notes || null,
          } as any,
          { onConflict: "user_id,document_type_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return data as unknown as VaultDocumentRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-documents"] });
      toast({ title: "Document saved", description: "Your information has been saved." });
    },
    onError: (err: any) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase
        .from("vault_documents")
        .delete()
        .eq("id", docId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-documents"] });
      toast({ title: "Document removed" });
    },
    onError: (err: any) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (docId: string) => {
      return invokeAuthedFunction<{ url: string; file_name: string }>("vault-download", {
        document_id: docId,
      });
    },
  });

  const markNotApplicable = useMutation({
    mutationFn: async (documentTypeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("vault_document_exclusions" as any)
        .insert({ user_id: user.id, document_type_id: documentTypeId } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-exclusions"] });
      toast({ title: "Marked as not applicable" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    },
  });

  const unmarkNotApplicable = useMutation({
    mutationFn: async (documentTypeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("vault_document_exclusions" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("document_type_id", documentTypeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-exclusions"] });
      toast({ title: "Restored to applicable" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    },
  });

  return {
    documents: query.data ?? [],
    isLoading: query.isLoading,
    excludedDocIds,
    upload: uploadMutation,
    saveInline: saveInlineMutation,
    remove: deleteMutation,
    download: downloadMutation,
    markNotApplicable,
    unmarkNotApplicable,
  };
}
