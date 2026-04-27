-- Seed demo records for Faculty Load Matrix.
insert into academic_years (id, label, start_year, active)
values ('11111111-1111-1111-1111-111111111111', '2026-2027', 2026, true)
on conflict (id) do nothing;

insert into scenarios (id, academic_year_id, name, description, is_active) values
('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Base Plan', 'Primary staffing plan', true),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Alternate Plan', 'Contingency scenario', false)
on conflict (id) do nothing;

-- See app/lib/seed-data.ts for full realistic faculty/course/activity/assignment examples mirrored in UI prototype.
