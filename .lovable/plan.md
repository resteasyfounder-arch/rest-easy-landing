

## Fix Report Generation 403 Error

### Root Cause

The edge function logs confirm the `generate-report` function returned **403 Forbidden** when the `agent` function called it in the background. This means either:

1. The `verify_jwt = false` config change hasn't fully propagated for `generate-report` on the deployed infrastructure (the gateway is still checking JWTs before the function code runs), OR
2. The background task's fetch is failing because the `readiness` Supabase client (passed by reference to `triggerReportRegeneration`) becomes stale after the main request completes

Both issues need to be addressed.

### Changes

#### 1. Make `triggerReportRegeneration` self-contained (`supabase/functions/agent/index.ts`)

The function currently receives the `readiness` client as a parameter. Since this runs in a background task via `EdgeRuntime.waitUntil`, the original client may be garbage-collected. Refactor to create its own fresh Supabase client internally:

- Remove `readiness` parameter from the function signature
- Create a fresh `createClient(SUPABASE_URL, SERVICE_ROLE_KEY)` inside the function
- Derive `.schema("readiness_v1")` from that fresh client
- Update all 3 call sites (lines ~1129, ~1205, ~1228) to remove the `readiness` argument

#### 2. Add detailed error logging (`supabase/functions/agent/index.ts`)

In `triggerReportRegeneration`, after the fetch call to `generate-report`:

- Log the fetch URL being used
- If the response is not OK, log the HTTP status code and the response body text before attempting `.json()` parse
- Wrap the entire function body in a try/catch that logs the error and marks the report as failed

#### 3. Add a `retry_report` action to the agent (`supabase/functions/agent/index.ts`)

New action handler so users can recover from failed reports:

- Add `"retry_report"` to the `AgentRequest.action` union type
- Handler: look up the active assessment, verify `report_status` is `"failed"`, reset to `"generating"`, call `triggerReportRegeneration` via `EdgeRuntime.waitUntil`, return `{ ok: true, report_status: "generating" }`

#### 4. Handle "failed" state in the Results page (`src/pages/Results.tsx`)

- Detect `report_status === "failed"` from the `get_state` response
- Show a "Report Generation Failed" card with a "Retry" button instead of the misleading "Continue Assessment" CTA
- The retry button calls the agent with `{ action: "retry_report" }`, then switches to the generating/polling UI

#### 5. Redeploy the `agent` and `generate-report` edge functions

Redeploy both functions to ensure the `verify_jwt = false` config is fully applied on the gateway.

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/agent/index.ts` | Refactor `triggerReportRegeneration` to create own client; add error logging; add `retry_report` action |
| `src/pages/Results.tsx` | Handle `"failed"` report status with retry UI |

