import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TrustedContact {
  id: string;
  user_id: string;
  contact_name: string;
  contact_email: string;
  invited_at: string | null;
  created_at: string;
}

export function useTrustedContacts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["trusted-contacts"],
    queryFn: async (): Promise<TrustedContact[]> => {
      const { data, error } = await supabase
        .from("trusted_contacts" as any)
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as any) ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (params: { name: string; email: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("trusted_contacts" as any)
        .insert({
          user_id: user.id,
          contact_name: params.name.trim(),
          contact_email: params.email.trim().toLowerCase(),
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as TrustedContact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted-contacts"] });
      toast({ title: "Contact added", description: "Your trusted contact has been saved." });
    },
    onError: (err: any) => {
      const msg = err.message?.includes("duplicate")
        ? "This contact has already been added."
        : err.message;
      toast({ title: "Could not add contact", description: msg, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("trusted_contacts" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted-contacts"] });
      toast({ title: "Contact removed" });
    },
    onError: (err: any) => {
      toast({ title: "Could not remove contact", description: err.message, variant: "destructive" });
    },
  });

  return {
    contacts: query.data ?? [],
    isLoading: query.isLoading,
    add: addMutation,
    remove: removeMutation,
  };
}
