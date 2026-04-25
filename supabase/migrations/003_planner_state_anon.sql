create policy "planner_state anon read" on planner_state
for select to anon
using (true);

create policy "planner_state anon write" on planner_state
for insert to anon
with check (true);

create policy "planner_state anon update" on planner_state
for update to anon
using (true)
with check (true);
