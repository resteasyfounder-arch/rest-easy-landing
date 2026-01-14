-- Readiness v1 schema
create schema if not exists readiness_v1;

-- Extensions
create extension if not exists "pgcrypto";

-- Utility functions
create or replace function readiness_v1.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Core identity
create table if not exists readiness_v1.subjects (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('guest','user')),
  user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint subjects_kind_user_id_check check (
    (kind = 'guest' and user_id is null) or
    (kind = 'user' and user_id is not null)
  )
);

create unique index if not exists subjects_user_id_key
  on readiness_v1.subjects (user_id)
  where user_id is not null;

-- Profile intake
create table if not exists readiness_v1.profile_intake (
  subject_id uuid primary key references readiness_v1.subjects(id) on delete cascade,
  profile_json jsonb not null default '{}'::jsonb,
  confidence_json jsonb not null default '{}'::jsonb,
  version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Assessment runs
create table if not exists readiness_v1.assessments (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references readiness_v1.subjects(id) on delete cascade,
  assessment_id text not null default 'readiness_v1',
  schema_version text not null default 'v1',
  status text not null check (status in ('draft','completed')),
  overall_score numeric,
  dimension_scores jsonb not null default '{}'::jsonb,
  current_step integer not null default 0,
  current_section text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessments_subject_id_idx
  on readiness_v1.assessments (subject_id);

-- Assessment answers
create table if not exists readiness_v1.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references readiness_v1.assessments(id) on delete cascade,
  subject_id uuid not null references readiness_v1.subjects(id) on delete cascade,
  question_id text not null,
  item_id text not null,
  section_id text not null,
  dimension text not null,
  answer_value text not null check (answer_value in ('yes','partial','no','not_sure','na')),
  answer_label text,
  score_fraction numeric check (score_fraction >= 0 and score_fraction <= 1),
  confidence numeric,
  question_text text,
  question_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_answers_unique_question unique (assessment_id, question_id)
);

create index if not exists assessment_answers_assessment_id_idx
  on readiness_v1.assessment_answers (assessment_id);

create index if not exists assessment_answers_subject_id_idx
  on readiness_v1.assessment_answers (subject_id);

-- Flags
create table if not exists readiness_v1.assessment_flags (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references readiness_v1.assessments(id) on delete cascade,
  subject_id uuid not null references readiness_v1.subjects(id) on delete cascade,
  question_id text,
  item_id text,
  section_id text,
  dimension text,
  flag_type text not null check (flag_type in ('review','follow_up','risk')),
  reason text,
  detail text,
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists assessment_flags_assessment_id_idx
  on readiness_v1.assessment_flags (assessment_id);

-- Actions
create table if not exists readiness_v1.readiness_actions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references readiness_v1.subjects(id) on delete cascade,
  assessment_id uuid references readiness_v1.assessments(id) on delete set null,
  item_id text,
  question_id text,
  title text not null,
  why text,
  priority text not null check (priority in ('high','medium','low')),
  effort text not null check (effort in ('low','medium','high')),
  status text not null default 'open' check (status in ('open','in_progress','done','dismissed')),
  source text not null default 'system' check (source in ('system','model','user')),
  dedupe_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists readiness_actions_subject_id_idx
  on readiness_v1.readiness_actions (subject_id);

create index if not exists readiness_actions_status_idx
  on readiness_v1.readiness_actions (status);

-- Conversation summary
create table if not exists readiness_v1.conversation_summaries (
  subject_id uuid primary key references readiness_v1.subjects(id) on delete cascade,
  summary_text text not null,
  token_count integer,
  summary_version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Change ledger
create table if not exists readiness_v1.change_ledger (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references readiness_v1.subjects(id) on delete cascade,
  assessment_id uuid references readiness_v1.assessments(id) on delete set null,
  item_id text not null,
  question_id text,
  from_value text,
  to_value text,
  score_delta numeric,
  reason text,
  source text not null default 'system' check (source in ('system','model','user')),
  created_at timestamptz not null default now()
);

create index if not exists change_ledger_subject_id_idx
  on readiness_v1.change_ledger (subject_id);

-- Events
create table if not exists readiness_v1.events (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references readiness_v1.subjects(id) on delete cascade,
  assessment_id uuid references readiness_v1.assessments(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create index if not exists events_subject_id_idx
  on readiness_v1.events (subject_id);

-- Assessment schemas (question bank storage)
create table if not exists readiness_v1.assessment_schemas (
  id uuid primary key default gen_random_uuid(),
  assessment_id text not null,
  version text not null,
  schema_json jsonb not null,
  created_at timestamptz not null default now(),
  constraint assessment_schemas_unique unique (assessment_id, version)
);

-- Activity functions
create or replace function readiness_v1.touch_assessment_activity()
returns trigger as $$
begin
  update readiness_v1.assessments
  set last_activity_at = now(),
      updated_at = now()
  where id = new.assessment_id;
  return new;
end;
$$ language plpgsql;

create or replace function readiness_v1.touch_subject_last_seen()
returns trigger as $$
begin
  update readiness_v1.subjects
  set last_seen_at = now(),
      updated_at = now()
  where id = new.subject_id;
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger subjects_set_updated_at
before update on readiness_v1.subjects
for each row execute function readiness_v1.set_updated_at();

create trigger profile_intake_set_updated_at
before update on readiness_v1.profile_intake
for each row execute function readiness_v1.set_updated_at();

create trigger assessments_set_updated_at
before update on readiness_v1.assessments
for each row execute function readiness_v1.set_updated_at();

create trigger assessment_answers_set_updated_at
before update on readiness_v1.assessment_answers
for each row execute function readiness_v1.set_updated_at();

create trigger readiness_actions_set_updated_at
before update on readiness_v1.readiness_actions
for each row execute function readiness_v1.set_updated_at();

create trigger conversation_summaries_set_updated_at
before update on readiness_v1.conversation_summaries
for each row execute function readiness_v1.set_updated_at();

-- Activity touch triggers
create trigger assessment_answers_touch_activity
after insert or update on readiness_v1.assessment_answers
for each row execute function readiness_v1.touch_assessment_activity();

create trigger assessment_answers_touch_subject
after insert or update on readiness_v1.assessment_answers
for each row execute function readiness_v1.touch_subject_last_seen();

-- RLS
alter table readiness_v1.subjects enable row level security;
alter table readiness_v1.profile_intake enable row level security;
alter table readiness_v1.assessments enable row level security;
alter table readiness_v1.assessment_answers enable row level security;
alter table readiness_v1.assessment_flags enable row level security;
alter table readiness_v1.readiness_actions enable row level security;
alter table readiness_v1.conversation_summaries enable row level security;
alter table readiness_v1.change_ledger enable row level security;
alter table readiness_v1.events enable row level security;
alter table readiness_v1.assessment_schemas enable row level security;

-- RLS helper
create or replace function readiness_v1.is_subject_owner(sid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from readiness_v1.subjects s
    where s.id = sid
      and s.user_id = auth.uid()
  );
$$;

-- Subjects policies
create policy subjects_select_own
on readiness_v1.subjects
for select
using (user_id = auth.uid());

create policy subjects_insert_own
on readiness_v1.subjects
for insert
with check (user_id = auth.uid());

create policy subjects_update_own
on readiness_v1.subjects
for update
using (user_id = auth.uid());

-- Profile intake policies
create policy profile_intake_select_own
on readiness_v1.profile_intake
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy profile_intake_insert_own
on readiness_v1.profile_intake
for insert
with check (readiness_v1.is_subject_owner(subject_id));

create policy profile_intake_update_own
on readiness_v1.profile_intake
for update
using (readiness_v1.is_subject_owner(subject_id));

-- Assessments policies
create policy assessments_select_own
on readiness_v1.assessments
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy assessments_insert_own
on readiness_v1.assessments
for insert
with check (readiness_v1.is_subject_owner(subject_id));

create policy assessments_update_own
on readiness_v1.assessments
for update
using (readiness_v1.is_subject_owner(subject_id));

-- Assessment answers policies
create policy assessment_answers_select_own
on readiness_v1.assessment_answers
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy assessment_answers_insert_own
on readiness_v1.assessment_answers
for insert
with check (readiness_v1.is_subject_owner(subject_id));

create policy assessment_answers_update_own
on readiness_v1.assessment_answers
for update
using (readiness_v1.is_subject_owner(subject_id));

-- Assessment flags policies
create policy assessment_flags_select_own
on readiness_v1.assessment_flags
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy assessment_flags_insert_own
on readiness_v1.assessment_flags
for insert
with check (readiness_v1.is_subject_owner(subject_id));

create policy assessment_flags_update_own
on readiness_v1.assessment_flags
for update
using (readiness_v1.is_subject_owner(subject_id));

-- Actions policies
create policy readiness_actions_select_own
on readiness_v1.readiness_actions
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy readiness_actions_insert_own
on readiness_v1.readiness_actions
for insert
with check (readiness_v1.is_subject_owner(subject_id));

create policy readiness_actions_update_own
on readiness_v1.readiness_actions
for update
using (readiness_v1.is_subject_owner(subject_id));

-- Conversation summaries policies
create policy conversation_summaries_select_own
on readiness_v1.conversation_summaries
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy conversation_summaries_insert_own
on readiness_v1.conversation_summaries
for insert
with check (readiness_v1.is_subject_owner(subject_id));

create policy conversation_summaries_update_own
on readiness_v1.conversation_summaries
for update
using (readiness_v1.is_subject_owner(subject_id));

-- Change ledger policies
create policy change_ledger_select_own
on readiness_v1.change_ledger
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy change_ledger_insert_own
on readiness_v1.change_ledger
for insert
with check (readiness_v1.is_subject_owner(subject_id));

-- Events policies
create policy events_select_own
on readiness_v1.events
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy events_insert_own
on readiness_v1.events
for insert
with check (readiness_v1.is_subject_owner(subject_id));
