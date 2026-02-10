-- Remy conversational chat persistence
create table if not exists readiness_v1.remy_conversations (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references readiness_v1.subjects(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists remy_conversations_subject_updated_idx
  on readiness_v1.remy_conversations (subject_id, updated_at desc);

create trigger remy_conversations_set_updated_at
before update on readiness_v1.remy_conversations
for each row execute function readiness_v1.set_updated_at();

alter table readiness_v1.remy_conversations enable row level security;

create policy remy_conversations_select_own
on readiness_v1.remy_conversations
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy remy_conversations_insert_own
on readiness_v1.remy_conversations
for insert
with check (readiness_v1.is_subject_owner(subject_id));

create policy remy_conversations_update_own
on readiness_v1.remy_conversations
for update
using (readiness_v1.is_subject_owner(subject_id))
with check (readiness_v1.is_subject_owner(subject_id));

create table if not exists readiness_v1.remy_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references readiness_v1.remy_conversations(id) on delete cascade,
  subject_id uuid not null references readiness_v1.subjects(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  message_text text not null check (char_length(trim(message_text)) > 0 and char_length(message_text) <= 2000),
  intent text check (intent is null or intent in ('clarify', 'prioritize', 'explain_score', 'plan_next', 'reassure', 'unknown')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists remy_messages_conversation_created_idx
  on readiness_v1.remy_messages (conversation_id, created_at desc);

create index if not exists remy_messages_subject_created_idx
  on readiness_v1.remy_messages (subject_id, created_at desc);

alter table readiness_v1.remy_messages enable row level security;

create policy remy_messages_select_own
on readiness_v1.remy_messages
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy remy_messages_insert_own
on readiness_v1.remy_messages
for insert
with check (
  readiness_v1.is_subject_owner(subject_id)
  and exists (
    select 1
    from readiness_v1.remy_conversations c
    where c.id = remy_messages.conversation_id
      and c.subject_id = remy_messages.subject_id
  )
);

create table if not exists readiness_v1.remy_feedback (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references readiness_v1.remy_messages(id) on delete cascade,
  subject_id uuid not null references readiness_v1.subjects(id) on delete cascade,
  rating smallint not null check (rating in (-1, 1)),
  reason text,
  created_at timestamptz not null default now(),
  constraint remy_feedback_unique_message_subject unique (message_id, subject_id)
);

create index if not exists remy_feedback_subject_created_idx
  on readiness_v1.remy_feedback (subject_id, created_at desc);

alter table readiness_v1.remy_feedback enable row level security;

create policy remy_feedback_select_own
on readiness_v1.remy_feedback
for select
using (readiness_v1.is_subject_owner(subject_id));

create policy remy_feedback_insert_own
on readiness_v1.remy_feedback
for insert
with check (
  readiness_v1.is_subject_owner(subject_id)
  and exists (
    select 1
    from readiness_v1.remy_messages m
    where m.id = remy_feedback.message_id
      and m.subject_id = remy_feedback.subject_id
  )
);

create or replace function readiness_v1.touch_remy_conversation()
returns trigger as $$
begin
  update readiness_v1.remy_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

create trigger remy_messages_touch_conversation
after insert on readiness_v1.remy_messages
for each row execute function readiness_v1.touch_remy_conversation();

grant select, insert, update, delete on readiness_v1.remy_conversations to authenticated, service_role;
grant select, insert, update, delete on readiness_v1.remy_messages to authenticated, service_role;
grant select, insert, update, delete on readiness_v1.remy_feedback to authenticated, service_role;
