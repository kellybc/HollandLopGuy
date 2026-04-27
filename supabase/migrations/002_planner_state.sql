create table if not exists planner_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table planner_state enable row level security;

create policy "planner_state authenticated read" on planner_state
for select to authenticated
using (true);

create policy "planner_state authenticated write" on planner_state
for insert to authenticated
with check (true);

create policy "planner_state authenticated update" on planner_state
for update to authenticated
using (true)
with check (true);
