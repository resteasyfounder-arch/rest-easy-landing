

## Interactive Trust Network

Add the ability to manage trusted contacts directly within EasyVault. Users can add contacts by name and email, remove them, copy a shareable invite link, and share via email/WhatsApp/native share. All contact data is persisted in Supabase.

---

### What Gets Built

1. **Database table** (`trusted_contacts`) to store contacts added by the user
2. **Add Contact dialog** -- a simple form (name + email) triggered by the "+" button
3. **Contact list** -- shows added contacts with avatars (initials) and a remove button
4. **Invite actions** -- Copy Link, Email, WhatsApp, and native Share all generate a referral URL and open the appropriate channel
5. **`useTrustedContacts` hook** -- TanStack Query CRUD hook following the same pattern as `useVaultDocuments`

---

### Database: `trusted_contacts` Table

A new migration to create the table:

```sql
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
```

No foreign key to `auth.users` (per project conventions). RLS ensures users only access their own rows.

---

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| Migration SQL | Create | `trusted_contacts` table with RLS |
| `src/hooks/useTrustedContacts.ts` | Create | TanStack Query hook for add/remove/list contacts |
| `src/components/vault/TrustNetworkPanel.tsx` | Rewrite | Interactive panel with real data, add dialog, remove, and share actions |
| `src/components/vault/AddContactDialog.tsx` | Create | Dialog with name + email form for adding a contact |

---

### UI Behavior

**Your Trusted Contacts section:**
- Shows a list of contacts as avatar circles with initials + name + email
- Each contact has a small "X" remove button on hover
- The "+" button opens the AddContactDialog
- Empty state: dashed circle with "Add people you trust" text (current design)

**Who Trusts You section:**
- Stays as a placeholder for now (requires cross-user lookup which is a future feature)
- Shows "No one yet -- invite your network"

**Invite Your Network section:**
- **Copy Link**: Generates a referral URL (`{app_url}?ref={user_id}`) and copies to clipboard with a toast confirmation
- **Email**: Opens `mailto:` link with a pre-filled subject and body containing the referral URL
- **WhatsApp**: Opens `https://wa.me/?text={encoded_message}` with the referral URL
- **Share**: Uses the browser's native `navigator.share()` API (falls back to Copy Link on unsupported browsers)

**AddContactDialog:**
- Simple shadcn Dialog with two fields: Name (required) and Email (required, validated)
- "Add Contact" button calls the mutation
- Closes on success with a toast

---

### `useTrustedContacts` Hook

Follows the same TanStack Query pattern as `useVaultDocuments`:

```typescript
// Fetch
useQuery({ queryKey: ["trusted-contacts"], queryFn: ... })

// Add
useMutation({ mutationFn: (params: { name, email }) => supabase.from("trusted_contacts").insert(...) })

// Remove
useMutation({ mutationFn: (id: string) => supabase.from("trusted_contacts").delete().eq("id", id) })
```

Invalidates the `trusted-contacts` query key on success. Shows toasts for success/error.

---

### Security

- RLS ensures users can only manage their own contacts
- No sensitive data exposed -- only names and emails the user themselves entered
- No cross-user data access (the "Who Trusts You" section stays as a static placeholder)
- Email validation on the frontend before insert

