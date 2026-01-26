
# Fix Report Status Sync Between Dashboard and Results

## Problem Summary
The Dashboard shows "Generate Report" button even though a report exists and is visible on the Results page. This is caused by a data source mismatch after the backend-only refactor.

## Root Cause

| Component | Current Data Source | Expected |
|-----------|-------------------|----------|
| Dashboard CTA | Server (`report_status` field) | Correct approach |
| Results Page | localStorage (`rest-easy.readiness.report`) | Should use server |
| Report Generation | Writes to localStorage only | Should update database |

The database `report_status` column is never updated when a report is generated, so the Dashboard (correctly) shows "Generate Report" while the Results page (incorrectly) reads from stale localStorage.

## Solution

### Phase 1: Update Report Generation to Persist to Database

**File: `supabase/functions/generate-report/index.ts`**

After successfully generating a report:
1. Accept `assessment_id` in the request payload
2. Store the report JSON in the database (new `report_data` column or separate table)
3. Update `assessments.report_status` to `"ready"`

Alternatively, handle this in the calling code (`Readiness.tsx`) by calling a new `save_report` action on the agent.

### Phase 2: Update Readiness.tsx Report Generation Flow

**File: `src/pages/Readiness.tsx`**

After receiving the generated report:
1. Call the agent with a new action `save_report` that:
   - Stores the report JSON in the database
   - Updates `report_status` to `"ready"`
2. Remove localStorage write for the report

### Phase 3: Update Results Page to Fetch from Server

**File: `src/pages/Results.tsx`**

1. Remove localStorage-based report loading
2. Add `useEffect` to fetch report from server via the agent edge function
3. Add a new `get_report` action to the agent that returns the stored report JSON

### Phase 4: Add Report Storage to Agent Edge Function

**File: `supabase/functions/agent/index.ts`**

Add two new actions:
- `save_report`: Store report JSON in database and update `report_status`
- `get_report`: Retrieve stored report JSON for a subject/assessment

### Phase 5: Database Schema Update (Optional)

Add a column to store the report JSON:
```sql
ALTER TABLE readiness_v1.assessments 
ADD COLUMN report_data JSONB;
```

Or create a separate `reports` table for cleaner separation.

---

## Implementation Details

### Agent Edge Function Changes

Add action handlers:

```typescript
// save_report action
if (action === "save_report") {
  const { assessment_id, report_data } = body;
  
  await readiness
    .from("assessments")
    .update({
      report_status: "ready",
      report_data: report_data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessment_id);
    
  return jsonResponse({ success: true });
}

// get_report action  
if (action === "get_report") {
  const { data } = await readiness
    .from("assessments")
    .select("report_data, report_status")
    .eq("subject_id", subjectId)
    .eq("assessment_id", assessmentId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
    
  return jsonResponse({ 
    report: data?.report_data, 
    status: data?.report_status 
  });
}
```

### Readiness.tsx Changes

Update `handleGenerateReport`:

```typescript
const handleGenerateReport = async () => {
  // ... existing generation logic ...
  
  if (response.ok && data.report) {
    // Save to server instead of localStorage
    await callAgent({
      action: "save_report",
      subject_id: subjectId,
      assessment_id: assessmentId,
      report_data: data.report,
    });
    
    // Remove localStorage write
    // localStorage.setItem("rest-easy.readiness.report", JSON.stringify(data.report));
    
    navigate("/results");
  }
};
```

### Results.tsx Changes

Fetch report from server:

```typescript
const Results = () => {
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      const subjectId = localStorage.getItem("rest-easy.readiness.subject_id");
      if (!subjectId) {
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/agent`, {
        method: "POST",
        headers: { /* ... */ },
        body: JSON.stringify({
          action: "get_report",
          subject_id: subjectId,
          assessment_id: "readiness_v1",
        }),
      });
      
      const data = await response.json();
      if (data.report) {
        setReport(data.report);
      }
      setLoading(false);
    };
    
    fetchReport();
  }, []);
  
  // ... rest of component
};
```

---

## Migration Consideration

For existing users who have reports in localStorage but not in the database:
- On Results page load, if no server report exists but localStorage has one, offer to "save" it to the server
- Or simply let them regenerate (cleaner approach)

---

## Files to Modify

1. `supabase/functions/agent/index.ts` - Add `save_report` and `get_report` actions
2. `src/pages/Readiness.tsx` - Update report generation to save to server
3. `src/pages/Results.tsx` - Fetch report from server instead of localStorage
4. Database migration - Add `report_data` JSONB column to assessments table

---

## Expected Outcome

After implementation:
- Report generated → saved to database with `report_status = "ready"`
- Dashboard checks server `report_status` → shows "View Full Report" ✓
- Results page fetches from server → shows the report ✓
- No more localStorage dependencies for report data

---

## Technical Notes

- The report JSON can be large (10-20KB), JSONB storage in PostgreSQL handles this efficiently
- Consider adding `report_generated_at` timestamp for tracking
- The `report_stale` concept should be handled server-side by comparing answer timestamps vs report timestamp
