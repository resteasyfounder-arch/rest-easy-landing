alter table if exists readiness_v1.remy_conversations
  add column if not exists openai_last_response_id text;

alter table if exists readiness_v1.remy_messages
  add column if not exists provider_request_id text,
  add column if not exists client_turn_id text;

create index if not exists remy_messages_provider_request_idx
  on readiness_v1.remy_messages (provider_request_id)
  where provider_request_id is not null;

