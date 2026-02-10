

## Add Trust Network Section to Profile Page

### Overview
Add the existing `TrustNetworkPanel` component to the Profile page, below the life area cards. Since this component already reads/writes from the `trusted_contacts` table via the `useTrustedContacts` hook, any changes made here will automatically sync with the EasyVault page -- both use the same data source.

### Changes

**File: `src/pages/Profile.tsx`**

- Import `TrustNetworkPanel` from `@/components/vault/TrustNetworkPanel`
- Add the `<TrustNetworkPanel />` component after the life area cards grid (line ~317) and before the Assessment CTA card
- Only render it when `hasStarted` is true (within the existing started-state block)

That's it -- no new components, hooks, or database changes needed. The `TrustNetworkPanel` is fully self-contained with its own data fetching, add/remove mutations, and invite actions.

### Technical Details

| Area | Detail |
|------|--------|
| File modified | `src/pages/Profile.tsx` |
| Import added | `TrustNetworkPanel` from `@/components/vault/TrustNetworkPanel` |
| Placement | Between the life cards grid and the Assessment CTA card |
| Data sync | Automatic -- both Profile and EasyVault use `useTrustedContacts` hook querying the same `trusted_contacts` table |
| Auth required | Yes -- the hook calls `supabase.auth.getUser()` and RLS enforces `auth.uid() = user_id` |
