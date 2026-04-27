-- Backfill commonly-missing columns in older deployments.
alter table if exists courses
  add column if not exists annual_sections_required int not null default 1;

alter table if exists faculty
  add column if not exists prefix text not null default 'Dr.';
