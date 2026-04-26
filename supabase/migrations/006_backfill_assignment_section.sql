-- Backfill missing assignment section column in older deployments.
alter table if exists workload_assignments
  add column if not exists section int;
