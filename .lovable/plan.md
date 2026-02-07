

## EasyVault Backend Storage Integration

This plan adds full backend storage for EasyVault documents using Supabase Storage (for file uploads) and a database table (for metadata and inline-created documents), with proper RLS security and encryption considerations.

---

### Architecture Overview

There are two types of vault entries:

1. **File Uploads** (sensitive documents like wills, insurance policies, tax returns) -- stored as encrypted files in Supabase Storage, with metadata tracked in a database table
2. **Inline Text Documents** (less sensitive items like Social Media Wishes, Email Access Instructions, Letter of Intent, Organ Donor Info, Digital Account Inventory) -- created and edited directly in the UI, content saved to the database

```text
User Action Flow:

[Upload Button]  -->  Supabase Storage (private bucket "vault-documents")
                      + vault_documents row (file_path, metadata)

[Create/Edit]    -->  vault_documents row (content stored as text)
                      No file upload needed
```

---

### Database: `vault_documents` Table

A new table in the `public` schema to track all vault entries:

```sql
CREATE TABLE public.vault_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type_id TEXT NOT NULL,        -- matches vaultDocuments.ts IDs
  category TEXT NOT NULL,                -- "financial", "legal", etc.
  display_name TEXT NOT NULL,            -- user-friendly name
  storage_path TEXT,                     -- path in storage bucket (NULL for inline docs)
  file_name TEXT,                        -- original uploaded file name
  file_size BIGINT,                      -- file size in bytes
  mime_type TEXT,                        -- e.g. "application/pdf"
  inline_content TEXT,                   -- for text-based inline documents
  notes TEXT,                            -- optional user notes
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies** (users can only access their own documents):
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

An `updated_at` trigger will auto-update the timestamp on changes.

---

### Storage: Private `vault-documents` Bucket

A **private** Supabase Storage bucket where files are stored under per-user paths:

```
vault-documents/
  {user_id}/
    {document_type_id}/
      {timestamp}_{filename}
```

**Storage RLS Policies:**
- Users can only upload/read/delete files within their own `{user_id}/` folder
- Bucket is NOT public -- files are accessed via signed URLs generated server-side

---

### Supported File Types by Document Category

Each document type will declare what input method it supports:

| Document | Input Method | Accepted Files |
|----------|-------------|----------------|
| Bank Accounts | Upload | PDF, JPG, PNG |
| Investment Accounts | Upload | PDF, JPG, PNG |
| Retirement Accounts | Upload | PDF, JPG, PNG |
| Tax Returns | Upload | PDF |
| Insurance Policies | Upload | PDF |
| Debts & Loans | Upload | PDF, JPG, PNG |
| Property Valuations | Upload | PDF, JPG, PNG |
| Vehicle Titles | Upload | PDF, JPG, PNG |
| Will / Testament | Upload | PDF |
| Power of Attorney | Upload | PDF |
| Trust Documents | Upload | PDF |
| Property Deeds | Upload | PDF, JPG, PNG |
| Guardian Designation | Upload | PDF |
| Beneficiary Designations | Upload | PDF |
| Marriage / Divorce Docs | Upload | PDF, JPG, PNG |
| Healthcare Directive | Upload | PDF |
| HIPAA Authorization | Upload | PDF |
| **Organ Donor Info** | **Inline** | N/A (text form) |
| Medical History | Upload | PDF, JPG, PNG |
| **Digital Account Inventory** | **Inline** | N/A (text form) |
| Password Manager Info | Upload | PDF, JPG, PNG |
| **Social Media Wishes** | **Inline** | N/A (text form) |
| **Email Access Instructions** | **Inline** | N/A (text form) |
| Life Insurance | Upload | PDF |
| Home / Renters Insurance | Upload | PDF |
| Auto Insurance | Upload | PDF |
| **Letter of Intent** | **Inline** | N/A (rich text) |

---

### Inline Document Editor

For the 5 inline document types, a modal/drawer will open with a form appropriate to that document:

**Social Media Wishes** - A structured form:
- Platform entries (e.g., Facebook, Instagram, X) with dropdown for action: "Delete", "Memorialize", "Transfer to someone"
- Free-text field for additional instructions

**Email Access Instructions** - A structured form:
- Email provider, email address, recovery method description
- Free-text instructions

**Digital Account Inventory** - A structured form:
- Repeatable rows: Service name, username/email, notes
- Free-text for additional context

**Organ Donor Info** - Simple form:
- Donor status (Yes/No/Undecided)
- Specific wishes or restrictions (free text)

**Letter of Intent / Personal Wishes** - Rich text editor:
- Textarea for the full letter content
- Guidance prompts to help the user write

All inline content is saved as JSON to the `inline_content` column.

---

### Edge Function: `vault-upload`

A secure edge function to handle file uploads with validation:

- Validates auth (JWT check via `getClaims`)
- Validates file type against allowed MIME types for the document category
- Enforces file size limit (20MB max)
- Uploads to the private `vault-documents` bucket under the user's folder
- Creates the `vault_documents` metadata row
- Returns the document record

---

### Edge Function: `vault-download`

A secure edge function to generate signed download URLs:

- Validates auth
- Confirms the requesting user owns the document
- Generates a time-limited signed URL (e.g., 60 seconds) from Supabase Storage
- Returns the signed URL for the client to use

---

### UI Changes

**Updated `vaultDocuments.ts` data:**
- Add `inputMethod: "upload" | "inline"` and `acceptedFileTypes` fields to `VaultDocument`

**Updated `DocumentRow.tsx`:**
- Upload button triggers file picker for upload-type documents
- Edit/Create button opens inline editor modal for inline-type documents
- Shows "View" and "Delete" actions for completed documents
- Shows file name and upload date for uploaded files
- Shows "Last edited" date for inline documents

**New `InlineDocumentEditor.tsx`:**
- A Dialog/Drawer component with form fields specific to each inline document type
- Save button persists to `vault_documents` table
- Auto-save indicator for peace of mind

**New `UploadDocumentDialog.tsx`:**
- File drop zone with drag-and-drop support
- File type validation and size limit display
- Upload progress indicator
- Optional notes field

**Updated `EasyVault.tsx`:**
- Fetches user's vault documents from Supabase on mount
- Tracks completed document IDs from real data
- Passes upload/edit handlers down to DocumentRow

**New `useVaultDocuments.ts` hook:**
- TanStack Query hook to fetch, upload, save inline, and delete vault documents
- Handles optimistic updates for smooth UX

**Updated `DocumentCategory.tsx`:**
- "Add Document" button opens appropriate modal based on document type

---

### Security Measures

1. **Private Storage Bucket** -- No public access; files served via signed URLs only
2. **RLS on vault_documents** -- Users can only CRUD their own rows
3. **Storage RLS** -- Users can only access files in their own folder path
4. **Edge Function Validation** -- MIME type checking, file size limits, auth verification
5. **Signed URLs** -- Time-limited (60s) download links prevent URL sharing
6. **Input Validation** -- All inline content validated with Zod schemas before saving

---

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| Migration SQL | Create | `vault_documents` table, RLS, storage bucket, storage policies |
| `supabase/functions/vault-upload/index.ts` | Create | Secure file upload handler |
| `supabase/functions/vault-download/index.ts` | Create | Signed URL generator |
| `supabase/config.toml` | Modify | Add edge function configs |
| `src/data/vaultDocuments.ts` | Modify | Add `inputMethod` and `acceptedFileTypes` fields |
| `src/hooks/useVaultDocuments.ts` | Create | TanStack Query hook for vault CRUD |
| `src/components/vault/UploadDocumentDialog.tsx` | Create | File upload modal with drag-drop |
| `src/components/vault/InlineDocumentEditor.tsx` | Create | Modal for creating/editing text-based documents |
| `src/components/vault/DocumentRow.tsx` | Modify | Wire up upload/edit/view/delete actions |
| `src/components/vault/DocumentCategory.tsx` | Modify | Pass handlers, update Add Document button |
| `src/pages/EasyVault.tsx` | Modify | Fetch real data, pass handlers to children |
| `src/components/vault/index.ts` | Modify | Export new components |

