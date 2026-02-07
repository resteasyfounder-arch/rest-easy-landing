# Remy V2 Feature Spec (Guided Product Feature)

Date: 2026-02-07  
Status: In implementation

## Constraints

1. Remy is a product feature, not a chatbot.
2. Remy guidance is limited to the Rest Easy domain.
3. Recommendations use profile, readiness, answer, and report state.

## Requirements

1. Guest mode Remy on home page with informational intent chips.
2. Global Remy launcher available across pages.
3. Immediate Remy refresh after profile/answer changes.
4. No chatbot framing on landing.
5. Provenance panel for recommendation rationale.
6. Proactive nudges on profile/menu/post-login surfaces.

## Surface Contract

Supported authenticated surfaces:

1. `dashboard`
2. `readiness`
3. `section_summary`
4. `results`
5. `profile`
6. `menu`

Guest mode uses guided intents on:

1. `/`
2. `/assessment`
3. `/login`
4. Any route without a readiness `subject_id`

## Acceptance Criteria

1. Guest users can choose from:
   1. What is Rest Easy?
   2. Take Findability Assessment
   3. Sign up / Log in
2. Launcher appears and opens contextual guidance on all routes.
3. Profile and readiness changes trigger Remy refresh without page reload.
4. Each Remy surface can show "Why this recommendation".
5. Menu/Profile pages include proactive inline Remy nudge blocks.
6. `npm run test` and `npm run build` pass.

## Implementation Status

Completed:

1. Home page Remy section converted from chat demo framing to guided intents.
2. Global `RemyGlobalLauncher` added to app shell.
3. `profile` and `menu` surfaces added to types and backend payload builder.
4. Proactive inline Remy nudges added on Profile and Menu pages.
5. Remy provenance rendering added to dashboard/readiness/results Remy components.
6. Refresh event wiring added (`remy:refresh`) and triggered after profile/answer mutations.
7. Smoke tests expanded to cover profile/menu surface routing behavior.

Remaining:

1. Optional telemetry enrichment for guest-intent chip interactions.
2. Optional UX polish for launcher animations and per-route quick actions.
