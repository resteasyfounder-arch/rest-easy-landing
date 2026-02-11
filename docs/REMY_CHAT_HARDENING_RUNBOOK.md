# Remy Chat Hardening Runbook

## Deployment Order

1. Run preflight checks:

```bash
./scripts/preflight-remy-chat.sh
```

2. Apply database migrations:

```bash
supabase db push
```

3. Deploy edge function:

```bash
supabase functions deploy remy
```

4. Deploy frontend after edge function rollout succeeds.

## Environment Flags

- `REMY_CHAT_PROVIDER=chat_completions|responses|hybrid`
- `REMY_RESPONSES_CANARY_PERCENT=0..100`
- `REMY_RESPONSE_STORE=false` (recommended)
- `REMY_CHAT_PROVIDER_TIMEOUT_MS` (default `2800`)
- `REMY_CHAT_PROVIDER_MAX_RETRIES` (default `2`, max `2`)
- `REMY_CHAT_PROVIDER_BACKOFF_MS` (default `180`)

## Recommended Canary Progression

1. Set `REMY_CHAT_PROVIDER=hybrid` and `REMY_RESPONSES_CANARY_PERCENT=10`.
2. Monitor for 24h, then increase to `50`.
3. Monitor for 24h, then increase to `100`.
4. Flip `REMY_CHAT_PROVIDER=responses` after 100% canary stability window.

## Monitoring

Monitor `readiness_v1.events` for:

- `remy_chat_turn`
- `remy_chat_response`
- `remy_chat_fallback`
- `remy_chat_error`

Track these fields:

- `trace_id`
- `provider`
- `openai_request_id`
- `provider_response_id`
- `provider_attempt_count`
- `provider_latency_ms`
- `provider_failure_code`

## Rollback

1. Immediate rollback:
   - `REMY_CHAT_PROVIDER=chat_completions`
   - `REMY_RESPONSES_CANARY_PERCENT=0`
2. Keep deterministic fallback active.
3. Investigate failures by `trace_id` and `provider_request_id`.

