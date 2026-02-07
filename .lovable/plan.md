

## EasyVault Improvements (4 Changes)

---

### 1. Remove "Add Document" Button from Category Sections

The "Add Document" ghost button at the bottom of each accordion section is redundant since each document row already has its own upload/edit action button.

**File:** `src/components/vault/DocumentCategory.tsx`
- Remove the `<Button>` with `<Plus>` icon (lines 62-65) and the `Plus` import

---

### 2. "Not Applicable" Support for Document Types

Allow users to mark individual documents as "not applicable" so they are excluded from progress tracking. This adjusts both the per-category and overall totals dynamically.

**Database:** Add a `vault_document_exclusions` table (or reuse `vault_documents` with a special marker). The simplest approach: store N/A status as a vault_documents row with a special `inline_content` value of `"__na__"` (no new table needed, uses the existing upsert pattern).

Actually, a cleaner approach: add a new database table to track exclusions separately, keeping vault_documents clean.

**Migration (new table):**
```sql
CREATE TABLE public.vault_document_exclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_type_id)
);
ALTER TABLE public.vault_document_exclusions ENABLE ROW LEVEL SECURITY;
-- RLS: auth.uid() = user_id for SELECT, INSERT, DELETE
```

**Hook:** `src/hooks/useVaultDocuments.ts`
- Add a query for `vault_document_exclusions`
- Add `markNotApplicable(docTypeId)` and `unmarkNotApplicable(docTypeId)` mutations
- Export an `excludedDocs` set alongside `documents`

**UI -- DocumentRow:**
- Add a "Not applicable" button (e.g., a small `Ban` or `MinusCircle` icon) in the hover actions for incomplete documents
- When marked N/A, show the row with a strikethrough/dimmed style, a "N/A" badge, and an "Undo" button on hover
- N/A documents are neither "completed" nor "missing"

**UI -- DocumentCategory:**
- Adjust `completedCount` and `totalCount` to exclude N/A documents
- Update "X missing" count to exclude N/A docs

**UI -- VaultProgress:**
- Accept both `completedCount` and `applicableTotal` (instead of using the static `totalDocumentCount`)
- The denominator becomes `totalDocumentCount - excludedCount`

**UI -- EasyVault.tsx:**
- Compute `applicableTotal = totalDocumentCount - excludedDocs.size`
- Pass `applicableTotal` to `VaultProgress`
- Pass `excludedDocs` set down to `DocumentCategory`

---

### 3. Remove "Share" Button from Trust Network

**File:** `src/components/vault/TrustNetworkPanel.tsx`
- Remove the Share button (lines 152-154) from the invite grid
- Remove the `Share2` import and `handleShare` function
- Change grid from `grid-cols-2` to `grid-cols-3` (Email, WhatsApp, Copy Link)

---

### 4. Add EasyVault Progress to Dashboard

Add a vault progress card on the dashboard alongside the Life Readiness tracking section.

**File:** `src/pages/Dashboard.tsx`
- Import `useVaultDocuments` hook and `vaultCategories`/`totalDocumentCount` from data
- In the completed assessment view, replace the static `VaultPreviewCard` with a live vault progress card showing:
  - Document count (completed / applicable total)
  - Progress bar
  - Link to `/vault`
- In the in-progress view, keep the existing teaser but optionally add a small vault stat

**New component:** `src/components/dashboard/VaultProgressCard.tsx`
- A compact card that uses data from `useVaultDocuments` hook
- Shows completed count, applicable total, percentage, and a "Go to Vault" link
- Styled consistently with the dashboard's existing cards

---

### Technical Summary

| File | Action |
|------|--------|
| Migration SQL | Create `vault_document_exclusions` table with RLS |
| `src/hooks/useVaultDocuments.ts` | Add exclusions query + mutations |
| `src/components/vault/DocumentRow.tsx` | Add N/A toggle, dimmed state |
| `src/components/vault/DocumentCategory.tsx` | Remove Add button, adjust counts for N/A |
| `src/components/vault/VaultProgress.tsx` | Accept dynamic total |
| `src/components/vault/TrustNetworkPanel.tsx` | Remove Share button |
| `src/pages/EasyVault.tsx` | Wire exclusions, compute dynamic totals |
| `src/components/dashboard/VaultProgressCard.tsx` | Create new dashboard card |
| `src/pages/Dashboard.tsx` | Replace static VaultPreviewCard with live progress |

