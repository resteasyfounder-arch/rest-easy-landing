
# Schema-Driven Roadmap: Backend-Authoritative Action Tracking

## Core Principle: Schema Drives Everything

You're absolutely right - the roadmap MUST be schema-driven, not AI-generated. The key insight is:

**Every "action" is simply a question that can be improved (score_fraction < 1.0)**

This means:
1. The roadmap is a filtered view of **assessment_answers** where the user hasn't scored perfectly
2. When a user "completes" an action, they're actually **updating their answer** to a better value
3. The score and report automatically stay in sync because they read from the same answers table

This is fundamentally different from tracking AI-generated actions - we're tracking **actual question states** from the schema.

---

## Architecture: Single Source of Truth

```text
+------------------------+       +------------------------+
|   Schema (JSON)        |       |   assessment_answers   |
|   - questions[]        | <---- |   - question_id        |
|   - sections[]         |       |   - answer_value       |
|   - options[]          |       |   - score_fraction     |
+------------------------+       +------------------------+
           |                              |
           v                              v
+--------------------------------------------------+
|           computeAssessmentState()               |
|   - Calculates section scores from answers       |
|   - Determines tier from weighted average        |
|   - Identifies applicable questions              |
+--------------------------------------------------+
           |
           v
+--------------------------------------------------+
|         Roadmap (Frontend Derived View)          |
|   Questions where score_fraction < 1.0           |
|   Grouped by section, sorted by priority/weight  |
+--------------------------------------------------+
```

---

## What the Roadmap Actually Shows

The Roadmap is NOT a separate list of actions - it's a **filtered view of answered questions that need improvement**:

| Roadmap Item | Source |
|--------------|--------|
| "Complete and sign your will" | Question 1.1.B.1 where answer is "partial" (drafted but not signed) |
| "Get professional legal input" | Question 1.1.A.5 where answer is "no" |
| "Share documents with family" | Question 1.1.B.11 where answer is "no" |

When the user clicks "Improve This" on any roadmap item:
1. They navigate directly to that question in the assessment
2. They update their answer to a better value (e.g., "no" → "yes")
3. The score recalculates automatically
4. The report is marked stale and regenerates
5. The roadmap item disappears (or shows as improved)

---

## Data Model: No New Tables Needed

The existing tables already support this model:

### assessment_answers (existing)
```sql
- question_id: "1.1.B.1"           -- Links to schema
- answer_value: "partial"          -- Current answer
- score_fraction: 0.5              -- Current score (0-1)
- question_text: "Do you have..."  -- Display text
- section_id: "1"                  -- For grouping
```

### Schema question (existing)
```json
{
  "id": "1.1.B.1",
  "prompt": "Do you currently have a legally valid will?",
  "weight": 1,
  "options": [
    {"value": "yes", "label": "Yes, completed and signed"},
    {"value": "partial", "label": "Drafted but not signed"},
    {"value": "no", "label": "No"}
  ]
}
```

### Derived Roadmap Item
```typescript
interface RoadmapItem {
  question_id: string;           // Links to schema question
  section_id: string;            // For navigation
  section_label: string;         // "Legal Planning & Decision Makers"
  question_text: string;         // Display text
  current_answer: string;        // "partial"
  current_answer_label: string;  // "Drafted but not signed"
  score_fraction: number;        // 0.5
  max_possible_score: 1;         // Always 1.0
  improvement_potential: number; // 0.5 (1.0 - 0.5)
  weight: number;                // Question weight for priority
  improvement_options: {         // Options that would improve score
    value: string;
    label: string;
  }[];
}
```

---

## Priority Calculation: Schema-Based

Priority is calculated from schema data, not AI:

```typescript
function calculatePriority(item: RoadmapItem, section: SchemaSection): "HIGH" | "MEDIUM" | "LOW" {
  const sectionWeight = section.weight; // 25 for Legal, 5 for Digital, etc.
  const improvementPotential = item.improvement_potential;
  const impactScore = sectionWeight * improvementPotential;
  
  // High priority: High-weight sections with low scores
  if (sectionWeight >= 15 && item.score_fraction < 0.5) return "HIGH";
  // Medium: Either high-weight with partial, or medium-weight with no
  if (sectionWeight >= 10 || item.score_fraction === 0) return "MEDIUM";
  return "LOW";
}
```

---

## Agent Enhancement: get_improvement_items Action

Add a new action to the agent that returns improvable items:

```typescript
if (payload.action === "get_improvement_items") {
  const { data: answers } = await readiness
    .from("assessment_answers")
    .select("*")
    .eq("assessment_id", assessmentDbId)
    .lt("score_fraction", 1.0)  // Only imperfect answers
    .order("section_id");
  
  // Load schema for question details
  const { data: schemaData } = await readiness
    .from("assessment_schemas")
    .select("schema_json")
    .eq("assessment_id", "readiness_v1")
    .single();
  
  const schema = schemaData.schema_json;
  
  // Build improvement items
  const items = answers.map(answer => {
    const question = schema.questions.find(q => q.id === answer.question_id);
    const section = schema.sections.find(s => s.id === answer.section_id);
    
    // Find options that would improve the score
    const currentScoreIndex = question.options.findIndex(o => o.value === answer.answer_value);
    const betterOptions = question.options.filter((o, i) => 
      schema.answer_scoring[o.value] > answer.score_fraction
    );
    
    return {
      question_id: answer.question_id,
      section_id: answer.section_id,
      section_label: section.label,
      question_text: question.prompt,
      current_answer: answer.answer_value,
      current_answer_label: answer.answer_label,
      score_fraction: answer.score_fraction,
      improvement_potential: 1.0 - answer.score_fraction,
      section_weight: section.weight,
      priority: calculatePriority(answer, section),
      improvement_options: betterOptions,
    };
  });
  
  return jsonResponse({ items });
}
```

---

## Frontend: RoadmapCard Becomes a Query View

The RoadmapCard no longer needs its own action list - it displays query results from the backend:

### New Hook: useImprovementItems

```typescript
// src/hooks/useImprovementItems.ts
export function useImprovementItems(subjectId: string) {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchItems = async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/agent`, {
      method: "POST",
      headers: { ... },
      body: JSON.stringify({
        action: "get_improvement_items",
        subject_id: subjectId,
      }),
    });
    const data = await response.json();
    setItems(data.items || []);
  };
  
  return { items, isLoading, refresh: fetchItems };
}
```

### Updated RoadmapCard Props

```typescript
interface RoadmapCardProps {
  items: RoadmapItem[];       // From get_improvement_items
  onImprove: (item: RoadmapItem) => void;  // Navigate to question
  isLoading: boolean;
}
```

### Navigation to Question

When user clicks "Improve This":

```typescript
const handleImprove = (item: RoadmapItem) => {
  // Navigate to readiness page with specific question
  navigate(`/readiness?section=${item.section_id}&question=${item.question_id}`);
};
```

---

## Answer Update Flow: Keeping Everything in Sync

When user updates an answer from the Roadmap navigation:

```text
1. User clicks "Improve This" on Roadmap item
2. Navigate to /readiness?section=1&question=1.1.B.1
3. User selects "Yes, completed and signed" (was "Drafted but not signed")
4. Frontend calls agent with new answer
5. Agent updates assessment_answers table
6. Agent marks report_stale = true (if report exists)
7. computeAssessmentState() recalculates:
   - Section score goes up
   - Overall score goes up
   - Tier may change
8. Dashboard refreshes:
   - Score card shows new score
   - Roadmap no longer shows that item (score_fraction = 1.0)
9. When user views Results page:
   - Report regenerates automatically
   - AI generates fresh insights based on new answers
```

---

## Completed Items: Also Schema-Driven

"Completed" items are simply questions where score_fraction = 1.0:

```typescript
if (payload.action === "get_completed_items") {
  const { data: answers } = await readiness
    .from("assessment_answers")
    .select("*")
    .eq("assessment_id", assessmentDbId)
    .eq("score_fraction", 1.0);  // Perfect answers
  
  // Return with schema enrichment
}
```

This allows a "Completed" filter toggle on the Roadmap without any additional state.

---

## Progress Calculation: Real Data

Roadmap progress is calculated from actual answer data:

```typescript
const totalApplicableQuestions = items.length + completedItems.length;
const completedCount = completedItems.length;
const progressPercent = Math.round((completedCount / totalApplicableQuestions) * 100);
```

This is the same calculation used for `overall_progress` in `computeAssessmentState()`, ensuring consistency.

---

## What About AI-Generated Actions?

The AI report still generates `action_plan[]` items, but these serve a **different purpose**:

| Schema-Driven Roadmap | AI Action Plan (in Report) |
|-----------------------|---------------------------|
| "Update your will to completed" | "Consider working with an estate attorney to finalize your will and trust documents" |
| Direct 1:1 to question | Holistic advice across multiple questions |
| Clicking updates answer | Clicking may navigate or just inform |
| Affects score immediately | Doesn't affect score |
| Disappears when done | Part of static report |

The Roadmap is for **tracking and action**. The Report Action Plan is for **guidance and context**.

---

## Implementation Sequence

### Phase 1: Backend (Agent Enhancement)
1. Add `get_improvement_items` action to agent
2. Add `get_completed_items` action to agent
3. Both return schema-enriched answer data

### Phase 2: Frontend Hook
4. Create `useImprovementItems` hook
5. Integrate with Dashboard
6. Update RoadmapCard to use new data shape

### Phase 3: Navigation & Answer Update
7. Add `?question=X` parameter support to Readiness page
8. Scroll to and highlight the specific question
9. Ensure answer update refreshes Dashboard state

### Phase 4: Polish
10. Add "Completed" filter toggle
11. Add progress animation when items complete
12. Mobile responsiveness

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useImprovementItems.ts` | Fetch improvable questions from backend |

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/agent/index.ts` | Add get_improvement_items, get_completed_items actions |
| `src/components/dashboard/RoadmapCard.tsx` | Update to use RoadmapItem shape from backend |
| `src/pages/Dashboard.tsx` | Use useImprovementItems hook |
| `src/pages/Readiness.tsx` | Support ?question= param for direct navigation |
| `src/types/assessment.ts` | Add RoadmapItem interface |

---

## Why This Approach Is Better

1. **Single Source of Truth**: All data comes from assessment_answers + schema
2. **No Drift**: Roadmap items ARE questions, not a separate list
3. **Automatic Sync**: Updating an answer updates the score, report, and roadmap
4. **No Manual Completion**: You don't "mark as done" - you improve your answer
5. **Schema-Authoritative**: Priority, weight, and options come from the schema
6. **Simpler Database**: No new tables or columns needed
7. **Consistent Calculation**: Same scoring logic everywhere

The Roadmap becomes a **lens into the assessment data**, not a separate tracking system.
