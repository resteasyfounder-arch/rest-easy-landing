-- Remy feature preferences (nudge dismissals, user-level feature settings)
create table if not exists readiness_v1.remy_preferences (
  subject_id uuid primary key references readiness_v1.subjects(id) on delete cascade,
  dismissed_nudges jsonb not null default '{}'::jsonb,
  preferences_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger remy_preferences_set_updated_at
before update on readiness_v1.remy_preferences
for each row execute function readiness_v1.set_updated_at();

alter table readiness_v1.remy_preferences enable row level security;

create policy remy_preferences_select_own
on readiness_v1.remy_preferences
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy remy_preferences_insert_own
on readiness_v1.remy_preferences
for insert
with check (readiness_v1.is_subject_owner(subject_id));

create policy remy_preferences_update_own
on readiness_v1.remy_preferences
for update
using (readiness_v1.is_subject_owner(subject_id));
