import type { User } from "@supabase/supabase-js";

export function getUserFirstName(user: User | null): string | null {
  if (!user) return null;

  const metadata = user.user_metadata ?? {};
  const firstName = typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const givenName = typeof metadata.given_name === "string" ? metadata.given_name.trim() : "";
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";

  if (firstName) return firstName;
  if (givenName) return givenName;
  if (fullName) return fullName.split(/\s+/)[0] ?? null;
  if (user.email) return user.email.split("@")[0] ?? null;

  return null;
}
