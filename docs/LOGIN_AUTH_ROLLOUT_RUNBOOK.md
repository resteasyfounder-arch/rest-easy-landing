# Login/Auth Rollout Runbook

This runbook is for production rollout after Phases 1-3.

## Scope

- Enforce authenticated-only readiness flows.
- Validate RLS and grants are correctly locked down.
- Verify personalization and report/share behavior for signed-in users.
- Provide rollback instructions if auth rollout causes regression.

## Rollout Order

1. Deploy database migrations.
2. Deploy edge functions.
3. Deploy frontend.
4. Run smoke tests.

Do not deploy frontend first. New frontend expects JWT-protected edge functions and ownership checks.

## Preflight

- Confirm environment secrets exist for all functions:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`
  - `OPENAI_API_KEY` (for summary/report functions)
  - `RESEND_API_KEY` (for report email)
  - `REMY_CHAT_PROVIDER` (`chat_completions`, `responses`, or `hybrid`)
  - `REMY_RESPONSES_CANARY_PERCENT` (`0..100`)
  - `REMY_RESPONSE_STORE` (`false` recommended)
- Confirm auth provider email settings are configured for confirmation emails.
- Confirm current migration head includes:
  - `20260210210500_phase3_readiness_auth_hardening.sql`
  - `20260210134000_remy_chat_provider_hardening.sql`
- Run Remy chat preflight:

```bash
./scripts/preflight-remy-chat.sh
```

## Deploy Commands (example)

```bash
# Database
supabase db push

# Edge Functions
supabase functions deploy agent
supabase functions deploy remy
supabase functions deploy generate-report
supabase functions deploy send-report-email
supabase functions deploy generate-section-summary
supabase functions deploy vault-upload
supabase functions deploy vault-download

# Frontend
npm run build
# deploy build artifact with your hosting pipeline
```

## Security Verification

Run SQL checks in `supabase/verification/phase4_auth_verification.sql`.

Expected outcomes:

- No `anon` grants on `readiness_v1` tables/functions/sequences/schema.
- `authenticated` has only required grants (RLS enforced at row level).
- All readiness tables have RLS enabled.
- Policy set exists for all user-owned readiness tables.

## Auth + Personalization Smoke Tests

1. Sign up with new user.
2. Confirm email; sign in.
3. Visit `/dashboard`.
4. Verify greeting uses user name (metadata first name/full name or email prefix fallback).
5. Start readiness flow in `/readiness` and answer several questions.
6. Verify `/dashboard` progress updates and no auth errors in browser/network.
7. Complete assessment and open `/results`.
8. Verify report renders with personalized user name.
9. Open Share dialog and send test email.
10. Verify email succeeds only for the owner of that assessment.
11. Sign out, then confirm protected routes (`/dashboard`, `/readiness`, `/results`, `/profile`, `/menu`, `/vault`) redirect to `/login`.

## Negative Security Tests

- Unauthenticated function invocation to `agent`/`remy` should return `401`.
- Authenticated user A must not be able to fetch or mutate user B data:
  - `get_state`
  - `get_report`
  - `save_answers`
  - `save_profile`
  - `send-report-email` with another user assessment id

## Observability Checks

- Verify edge function logs contain no authorization failures during normal usage.
- Monitor `readiness_v1.events` for Remy events after deploy.
- Monitor report generation failures (`report_status = 'failed'`) in `readiness_v1.assessments`.

## Rollback Plan

If critical auth regression occurs:

1. Roll back frontend to pre-rollout version.
2. Roll back affected function deploy(s) to prior version.
3. If necessary, revert auth email confirmation requirements in `supabase/config.toml` and redeploy auth config.
4. If database grant hardening blocks emergency paths, apply a targeted hotfix migration restoring minimum required privileges temporarily (do not re-open full `anon` access).

## Exit Criteria

- Smoke tests pass for login, assessment, results, and share flow.
- Negative security tests pass.
- No critical auth errors in logs for 24h after deploy.
- No increase in report generation failure rate.
