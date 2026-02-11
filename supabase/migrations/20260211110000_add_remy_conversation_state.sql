alter table readiness_v1.remy_conversations
  add column if not exists state jsonb not null default '{}'::jsonb;
