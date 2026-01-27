# Report Status Sync - COMPLETED

## Summary

Fixed the mismatch between Dashboard ("Generate Report" button) and Results page (showing existing report) by migrating report storage from localStorage to the database.

## Changes Made

### 1. Database Schema
Added to `readiness_v1.assessments` table:
- `report_data` (JSONB) - Stores the full report JSON
- `report_generated_at` (TIMESTAMP WITH TIME ZONE) - When the report was generated

### 2. Agent Edge Function (`supabase/functions/agent/index.ts`)
Added two new actions:
- `save_report` - Stores report JSON and updates `report_status` to "ready"
- `get_report` - Retrieves stored report for a subject/assessment

### 3. Readiness.tsx (`src/pages/Readiness.tsx`)
Updated `handleGenerateReport` to:
- Call `save_report` action after successful report generation
- Remove localStorage writes for report data

### 4. Results.tsx (`src/pages/Results.tsx`)
Updated to:
- Fetch report from server via `get_report` action on mount
- Remove localStorage-based report loading

## Data Flow

```
Report Generated
       │
       ▼
save_report action ───► Database (report_data, report_status = "ready")
       │
       ▼
Dashboard reads ───► report_status from get_state ───► Shows "View Full Report" ✓
       │
       ▼
Results page ───► get_report action ───► Displays report from DB ✓
```

## Testing

1. Complete assessment
2. Click "Generate Report" 
3. Report generates and saves to database
4. Dashboard should show "View Full Report" button
5. Results page should load report from server
