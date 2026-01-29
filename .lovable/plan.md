
# QuestionEditModal Implementation Plan

## Overview
Create a modal component that allows users to update roadmap questions directly from the Dashboard without navigating away. The modal uses existing `RoadmapItem` data and integrates with the same backend save flow, ensuring synchronization across the entire application.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/dashboard/QuestionEditModal.tsx` | Create | New modal component for editing questions |
| `src/components/dashboard/index.ts` | Modify | Export the new modal |
| `src/components/dashboard/RoadmapCard.tsx` | Modify | Add `onEditQuestion` callback prop |
| `src/pages/Dashboard.tsx` | Modify | Wire up modal state and handlers |

---

## Technical Details

### 1. QuestionEditModal Component

**Props Interface:**
```typescript
interface QuestionEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: RoadmapItem | null;
  subjectId: string;
  onSuccess: () => void;  // Called after save to trigger refresh
}
```

**UI Structure:**
- Dialog with title "Update Your Answer"
- Section label badge
- Question text display
- Current answer shown (styled as muted)
- Radio group for improvement options
- Cancel + Save buttons in footer
- Loading state during save

**Answer Scoring Map:**
The modal will use the standard scoring:
- `yes` = 1.0
- `partial` = 0.5
- `no` = 0.0
- `not_sure` = 0.25
- `na` = null (skip from score)

**Save Payload Structure:**
Matches the existing agent edge function format:
```typescript
{
  subject_id: subjectId,
  assessment_id: "readiness_v1",
  answers: [{
    question_id: item.question_id,
    item_id: item.question_id,
    section_id: item.section_id,
    dimension: item.section_id,
    answer_value: selectedValue,
    answer_label: selectedOption.label,
    score_fraction: newScoreFraction,
    question_text: item.question_text,
  }]
}
```

### 2. RoadmapCard Updates

Add new prop:
```typescript
interface RoadmapCardProps {
  // ...existing props
  onEditQuestion?: (item: RoadmapItem) => void;
}
```

Modify `handleNavigateToQuestion`:
- If `onEditQuestion` prop is provided, call it instead of navigating
- This allows the Dashboard to control the behavior

### 3. Dashboard Integration

Add modal state:
```typescript
const [editModalOpen, setEditModalOpen] = useState(false);
const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
```

Add handler:
```typescript
const handleEditQuestion = (item: RoadmapItem) => {
  setEditingItem(item);
  setEditModalOpen(true);
};
```

Wire up refresh on success:
```typescript
const handleEditSuccess = () => {
  setEditModalOpen(false);
  setEditingItem(null);
  refresh(); // From useImprovementItems hook
};
```

## Data Flow

```text
User clicks "Improve" on roadmap item
            |
            v
RoadmapCard calls onEditQuestion(item)
            |
            v
Dashboard opens QuestionEditModal with item data
            |
            v
User selects new answer and clicks Save
            |
            v
Modal POSTs to /functions/v1/agent with answer payload
            |
            v
Backend:
  1. Updates assessment_answers table
  2. Marks report as stale
  3. Triggers background report regeneration
            |
            v
Modal closes, calls onSuccess()
            |
            v
Dashboard calls refresh() from useImprovementItems
            |
            v
Roadmap updates:
  - Item moves to "completed" if score = 1.0
  - OR item updates with new score/options
```

## Synchronization Guarantee

The modal uses the exact same backend endpoint (`/functions/v1/agent`) and payload structure as the Readiness page. When the backend saves the answer:

1. It updates `assessment_answers` table with the new value
2. It marks `report_stale = true` and `report_status = "generating"`
3. It triggers background report regeneration via `EdgeRuntime.waitUntil`
4. The next time the user visits `/readiness`, `get_state` returns the updated answer

No additional synchronization code is needed because the backend is authoritative.

## Error Handling

- Network errors display toast notification via sonner
- Modal stays open on error so user can retry
- Loading state disables buttons during save
- Empty improvement_options guard (should not happen, but safe to handle)

## Animations

- Item moves from "remaining" to "completed" list with existing animation
- `newCompleted` detection in RoadmapCard already handles this via `useEffect`
