

## Add Feature Details to Score Hero and Match Remy's Card Styling

### Changes to `src/components/assessment/results/ResultsScoreHero.tsx`

**1. Match Remy's background color**
- Change the outer `div` from `bg-card border-border` to `bg-primary/[0.03] border-primary/10` so both cards share the same soft tinted appearance.

**2. Add three feature highlights below the existing text**
- Add a new section with three rows, each containing an icon and description:
  - ClipboardList icon + "Up to 72 questions tailored to your life needs"
  - FolderLock icon + "Track and store your documents with EasyVault"
  - Users icon + "Add your loved ones to your Trust Network, keeping them in the loop as your Life Readiness journey progresses"
- Each row: icon in a small circle (`w-8 h-8 rounded-full bg-primary/10`) + text, left-aligned, stacked vertically with `space-y-3`
- This fills the remaining whitespace and makes both cards roughly the same height

**3. Import icons**
- Add `ClipboardList`, `FolderLock`, `Users` from `lucide-react`

### Visual Result
Both the Score Hero and Remy's Take cards will have the same soft sage background (`bg-primary/[0.03]`), and the Score Hero will now fill its space with useful feature previews, eliminating the empty whitespace mismatch.

