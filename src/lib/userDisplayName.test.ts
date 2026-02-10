import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { getUserFirstName } from "@/lib/userDisplayName";

function makeUser(overrides: Partial<User>): User {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    ...overrides,
  } as User;
}

describe("getUserFirstName", () => {
  it("returns null when user is null", () => {
    expect(getUserFirstName(null)).toBeNull();
  });

  it("prefers first_name metadata", () => {
    const user = makeUser({
      email: "alex@example.com",
      user_metadata: { first_name: "Alex", full_name: "Alex Murray" },
    });

    expect(getUserFirstName(user)).toBe("Alex");
  });

  it("falls back to given_name then full_name then email prefix", () => {
    const withGivenName = makeUser({
      email: "alex@example.com",
      user_metadata: { given_name: "Lex" },
    });
    expect(getUserFirstName(withGivenName)).toBe("Lex");

    const withFullName = makeUser({
      email: "alex@example.com",
      user_metadata: { full_name: "Alex Murray" },
    });
    expect(getUserFirstName(withFullName)).toBe("Alex");

    const withEmailOnly = makeUser({
      email: "friend.person@example.com",
      user_metadata: {},
    });
    expect(getUserFirstName(withEmailOnly)).toBe("friend.person");
  });
});
