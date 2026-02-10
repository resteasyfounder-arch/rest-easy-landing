-- Phase 3: readiness auth and privilege hardening
-- 1) Remove anonymous role access to readiness data-plane objects.
revoke usage on schema readiness_v1 from anon;
revoke all privileges on all tables in schema readiness_v1 from anon;
revoke all privileges on all sequences in schema readiness_v1 from anon;
revoke all privileges on all functions in schema readiness_v1 from anon;

-- 2) Narrow authenticated grants from overly broad ALL to RLS-backed DML + execute.
revoke all privileges on all tables in schema readiness_v1 from authenticated;
revoke all privileges on all sequences in schema readiness_v1 from authenticated;
revoke all privileges on all functions in schema readiness_v1 from authenticated;

grant usage on schema readiness_v1 to authenticated;
grant select, insert, update, delete on all tables in schema readiness_v1 to authenticated;
grant usage, select on all sequences in schema readiness_v1 to authenticated;
grant execute on all functions in schema readiness_v1 to authenticated;

-- 3) Ensure service_role retains full operational access for edge functions.
grant usage on schema readiness_v1 to service_role;
grant all privileges on all tables in schema readiness_v1 to service_role;
grant all privileges on all sequences in schema readiness_v1 to service_role;
grant execute on all functions in schema readiness_v1 to service_role;

-- 4) Harden default privileges for future readiness_v1 objects.
alter default privileges in schema readiness_v1 revoke all on tables from anon;
alter default privileges in schema readiness_v1 revoke all on tables from authenticated;
alter default privileges in schema readiness_v1 revoke all on tables from service_role;
alter default privileges in schema readiness_v1 grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema readiness_v1 grant all on tables to service_role;

alter default privileges in schema readiness_v1 revoke all on sequences from anon;
alter default privileges in schema readiness_v1 revoke all on sequences from authenticated;
alter default privileges in schema readiness_v1 revoke all on sequences from service_role;
alter default privileges in schema readiness_v1 grant usage, select on sequences to authenticated;
alter default privileges in schema readiness_v1 grant all on sequences to service_role;

alter default privileges in schema readiness_v1 revoke all on functions from anon;
alter default privileges in schema readiness_v1 revoke all on functions from authenticated;
alter default privileges in schema readiness_v1 revoke all on functions from service_role;
alter default privileges in schema readiness_v1 grant execute on functions to authenticated;
alter default privileges in schema readiness_v1 grant execute on functions to service_role;
