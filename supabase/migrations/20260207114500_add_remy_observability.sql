-- Remy telemetry query performance
create index if not exists events_event_type_created_at_idx
  on readiness_v1.events (event_type, created_at desc);

create index if not exists events_subject_event_type_created_at_idx
  on readiness_v1.events (subject_id, event_type, created_at desc);

-- Daily rollup for Remy feature usage
create or replace view readiness_v1.remy_event_daily
with (security_invoker = true) as
select
  date_trunc('day', created_at)::date as event_day,
  event_type,
  count(*)::bigint as event_count,
  count(distinct subject_id)::bigint as unique_subjects
from readiness_v1.events
where event_type like 'remy_%'
group by 1, 2
order by 1 desc, 2;

-- Per-subject Remy engagement funnel
create or replace view readiness_v1.remy_event_subject_funnel
with (security_invoker = true) as
select
  subject_id,
  count(*) filter (where event_type = 'remy_impression')::bigint as impressions,
  count(*) filter (where event_type = 'remy_ack_action')::bigint as action_acks,
  count(*) filter (where event_type = 'remy_dismiss_nudge')::bigint as dismissals,
  max(created_at) as last_remy_event_at
from readiness_v1.events
where event_type like 'remy_%'
group by subject_id;

grant select on readiness_v1.remy_event_daily to authenticated, service_role;
grant select on readiness_v1.remy_event_subject_funnel to authenticated, service_role;
