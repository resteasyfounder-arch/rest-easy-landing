

## EasyVault - Secure Document Storage Page

A new full page accessible from the sidebar for paid users to manage important documents, organized by category with progress tracking and a trust network panel. Backend storage integration will come later -- this plan covers the complete UI.

---

### What Gets Built

A dedicated `/vault` page modeled after the reference screenshot, featuring:
- **Essential Documents tracker** with overall progress (e.g., 0/27 completed)
- **Collapsible document categories** (Financial, Legal, Healthcare, Digital, Insurance, Personal) with per-category progress bars
- **Individual document rows** within each category showing status, priority badges, and upload placeholders
- **Trust Network sidebar panel** (desktop) for managing trusted contacts
- **Paid-only gate**: A lock overlay/message for non-paid users
- **"+ Add Documents" action** at the bottom of each category

---

### Design Approach (Matching Reference)

The layout follows the reference screenshot closely:

```text
Desktop (lg+):
+--sidebar--+---------- Main Content ----------+--- Right Panel ---+
|            | Essential Documents       0/27   | Trust Network     |
| EasyVault* | Overall Progress          0%     | Trusted Contacts  |
|            | [Info banner]                    | Who Trusts You    |
|            |                                  | Invite Network    |
|            | > Financial        7 missing  v  |                   |
|            | > Legal            6 missing  v  |                   |
|            | > Healthcare       ...        v  |                   |
|            | > Digital          ...        v  |                   |
|            | > Insurance        ...        v  |                   |
|            | > Personal         ...        v  |                   |
+------------+----------------------------------+-------------------+

Mobile: Stacked vertically, Trust Network below categories
```

Uses shadcn Accordion for collapsible categories, Badge for priority levels, Progress for bars, and Card for panels.

---

### Document Categories & Items

Each category contains recommended document types personalized by the user's profile (static for now):

1. **Financial** (7 items): Bank Accounts, Investment Accounts, Retirement Accounts, Tax Returns, Insurance Policies, Debts/Loans, Property Valuations
2. **Legal** (8 items): Vehicle Titles, Will/Testament, Power of Attorney, Trust Documents, Property Deeds, Guardian Designation, Beneficiary Designations, Marriage/Divorce Docs
3. **Healthcare** (4 items): Healthcare Directive, HIPAA Authorization, Organ Donor Info, Medical History
4. **Digital** (4 items): Digital Account Inventory, Password Manager Info, Social Media Wishes, Email Access Instructions
5. **Insurance** (3 items): Life Insurance, Home/Renters Insurance, Auto Insurance
6. **Personal** (1 item): Letter of Intent / Personal Wishes

---

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/EasyVault.tsx` | Create | Main vault page with layout, categories, and trust panel |
| `src/components/vault/VaultProgress.tsx` | Create | Top progress card (X/27 completed, overall %) |
| `src/components/vault/DocumentCategory.tsx` | Create | Collapsible accordion category with progress bar and document rows |
| `src/components/vault/DocumentRow.tsx` | Create | Individual document item row with status, priority badge, upload placeholder |
| `src/components/vault/TrustNetworkPanel.tsx` | Create | Right-side panel for trusted contacts and invite actions |
| `src/components/vault/VaultPaywall.tsx` | Create | Lock overlay shown to non-paid users |
| `src/components/vault/index.ts` | Create | Barrel export |
| `src/data/vaultDocuments.ts` | Create | Static data for document categories and items |
| `src/App.tsx` | Modify | Add `/vault` route |
| `src/components/layout/AppSidebar.tsx` | Modify | Add "EasyVault" nav item with Vault icon |
| `src/components/layout/AppLayout.tsx` | Modify | Add `/vault` to APP_ROUTES |
| `src/components/layout/BottomNav.tsx` | Modify | Add EasyVault to mobile nav |

---

### Technical Details

**Data structure** (`src/data/vaultDocuments.ts`):
```typescript
interface VaultDocument {
  id: string;
  name: string;
  category: string;
  priority: "high" | "medium" | "low";
  description?: string;
  hasExternalLink?: boolean; // shows external link icon like Will/Testament
}

interface VaultCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  documents: VaultDocument[];
}
```

**Document Row states:**
- Empty (circle outline + "Missing - add a document with this information" in orange/amber)
- Uploaded (filled green circle + document name + date uploaded)
- High priority items get a red "high" badge

**Trust Network Panel** (static UI only):
- "Your Trusted Contacts" list with avatar circles
- "Who Trusts You" list
- "Invite Your Network" section with Email, WhatsApp, Share, Copy Link buttons

**Paywall component:**
- Semi-transparent overlay with lock icon
- "Upgrade to access EasyVault" message and CTA button
- Conditionally rendered based on a `isPaidUser` flag (hardcoded false for now)

**Sidebar update:**
- Add `Vault` icon from lucide-react
- New nav item: `{ title: "EasyVault", url: "/vault", icon: Vault }`
- Placed after "Readiness Report" in the nav list

**Info banner** inside the vault:
- Yellow/amber tinted banner: "Documents are prioritized based on your personal situation" with "Update preferences" link

---

### Styling Approach

- White background (`bg-background`) consistent with the app aesthetic
- Soft rounded cards with `border-border/50` borders
- Category headers use icons and muted progress bars
- Document rows use subtle `bg-muted/30` hover states
- Priority badges use destructive/amber variant
- Trust Network panel uses a card with softer right-column treatment
- All components use existing shadcn primitives (Accordion, Badge, Progress, Card, Button, Avatar, Separator)

