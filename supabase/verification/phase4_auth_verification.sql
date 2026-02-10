-- Phase 4 auth verification checks for readiness_v1

-- 1) Confirm anon has no readiness_v1 schema-level usage.
select
  n.nspname as schema_name,
  r.rolname as role_name,
  has_schema_privilege(r.rolname, n.oid, 'USAGE') as has_usage
from pg_namespace n
cross join pg_roles r
where n.nspname = 'readiness_v1'
  and r.rolname = 'anon';

-- 2) Confirm anon has no table privileges in readiness_v1.
select grantee, table_schema, table_name, privilege_type
from information_schema.table_privileges
where table_schema = 'readiness_v1'
  and grantee = 'anon'
order by table_name, privilege_type;

-- 3) Confirm anon has no function execute privileges in readiness_v1.
select
  n.nspname as schema_name,
  p.proname as function_name,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'readiness_v1'
order by p.proname;

-- 4) Confirm RLS is enabled on all readiness_v1 tables.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'readiness_v1'
order by tablename;

-- 5) Confirm each readiness_v1 table has at least one policy.
select
  t.tablename,
  count(p.policyname) as policy_count
from pg_tables t
left join pg_policies p
  on p.schemaname = t.schemaname
 and p.tablename = t.tablename
where t.schemaname = 'readiness_v1'
group by t.tablename
order by t.tablename;

-- 6) Confirm subject records are user-bound (spot check distribution).
select kind, count(*)
from readiness_v1.subjects
group by kind
order by kind;

-- 7) Verify no duplicate active readiness assessments per subject.
select subject_id, assessment_id, count(*) as active_count
from readiness_v1.assessments
where status <> 'archived'
group by subject_id, assessment_id
having count(*) > 1;

-- 8) Report generation health snapshot.
select report_status, count(*)
from readiness_v1.assessments
group by report_status
order by report_status;
