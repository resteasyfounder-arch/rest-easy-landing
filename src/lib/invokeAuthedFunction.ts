import { supabase } from "@/integrations/supabase/client";

export async function invokeAuthedFunction<TData = unknown>(
  functionName: string,
  body?: unknown,
): Promise<TData> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  let accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      throw refreshError;
    }
    accessToken = refreshed.session?.access_token;
  }

  if (!accessToken) {
    throw new Error("No active session token");
  }

  const { data, error } = await supabase.functions.invoke<TData>(functionName, {
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}
