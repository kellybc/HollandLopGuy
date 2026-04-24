create table if not exists academic_years (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  start_year int not null,
  active boolean not null default false
);

create table if not exists scenarios (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references academic_years(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default false
);

create table if not exists faculty (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  program text not null,
  rank_or_role text not null,
  annual_workload_target numeric not null,
  fall_target numeric not null,
  winter_target numeric not null,
  spring_target numeric not null,
  summer_target numeric not null,
  notes text,
  active boolean not null default true
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  prefix text not null,
  number text not null,
  title text not null,
  program text not null,
  credit_hours numeric not null,
  default_workload_units numeric not null,
  is_required boolean not null default false,
  normally_offered_fall boolean not null default false,
  normally_offered_winter boolean not null default false,
  normally_offered_spring boolean not null default false,
  normally_offered_summer boolean not null default false,
  notes text,
  active boolean not null default true
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  default_workload_units numeric not null,
  notes text,
  active boolean not null default true
);

create table if not exists workload_assignments (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references faculty(id) on delete cascade,
  scenario_id uuid not null references scenarios(id) on delete cascade,
  academic_year text not null,
  quarter text not null check (quarter in ('Fall','Winter','Spring','Summer')),
  item_type text not null check (item_type in ('course','activity')),
  course_id uuid references courses(id),
  activity_id uuid references activities(id),
  workload_units numeric not null,
  workload_units_override boolean not null default false,
  credit_hours_snapshot numeric,
  label text not null,
  notes text,
  status text not null check (status in ('planned','confirmed','problem')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workload_item_xor check ((course_id is null) <> (activity_id is null))
);

create table if not exists faculty_course_qualifications (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references faculty(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  qualification_level text not null check (qualification_level in ('preferred','qualified','possible','avoid')),
  notes text
);

alter table faculty enable row level security;
alter table courses enable row level security;
alter table activities enable row level security;
alter table workload_assignments enable row level security;
alter table faculty_course_qualifications enable row level security;
alter table scenarios enable row level security;
alter table academic_years enable row level security;

-- Supabase does not allow CREATE ROLE in project SQL migrations.
-- Use a custom JWT claim like `app_role` (admin/viewer) from Auth hooks or metadata.

create policy "viewer read faculty" on faculty for select using (auth.role() in ('authenticated'));
create policy "admin edit faculty" on faculty for all using (auth.jwt() ->> 'app_role' = 'admin') with check (auth.jwt() ->> 'app_role' = 'admin');
