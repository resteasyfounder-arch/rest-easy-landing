-- Grants for readiness_v1
grant usage on schema readiness_v1 to authenticated, anon, service_role;

-- Current tables
grant all on all tables in schema readiness_v1 to authenticated, anon, service_role;
-- Current sequences
grant all on all sequences in schema readiness_v1 to authenticated, anon, service_role;
-- Current functions
grant execute on all functions in schema readiness_v1 to authenticated, anon, service_role;

-- Default privileges
alter default privileges in schema readiness_v1 grant all on tables to authenticated, anon, service_role;
alter default privileges in schema readiness_v1 grant all on sequences to authenticated, anon, service_role;
alter default privileges in schema readiness_v1 grant execute on functions to authenticated, anon, service_role;
