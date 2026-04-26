-- Align schema for production relational sync from the browser client.
-- 1) Preserve existing non-UUID prototype ids by switching key columns to text.
-- 2) Add missing faculty.prefix column used by the app model.
-- 3) Add explicit anon/authenticated read/write policies for planner tables.

alter table if exists scenarios drop constraint if exists scenarios_academic_year_id_fkey;
alter table if exists workload_assignments drop constraint if exists workload_assignments_faculty_id_fkey;
alter table if exists workload_assignments drop constraint if exists workload_assignments_scenario_id_fkey;
alter table if exists workload_assignments drop constraint if exists workload_assignments_course_id_fkey;
alter table if exists workload_assignments drop constraint if exists workload_assignments_activity_id_fkey;
alter table if exists faculty_course_qualifications drop constraint if exists faculty_course_qualifications_faculty_id_fkey;
alter table if exists faculty_course_qualifications drop constraint if exists faculty_course_qualifications_course_id_fkey;

alter table if exists scenarios
  alter column id type text using id::text,
  alter column academic_year_id type text using academic_year_id::text;

alter table if exists academic_years
  alter column id type text using id::text;

alter table if exists faculty
  alter column id type text using id::text;

alter table if exists courses
  alter column id type text using id::text;

alter table if exists activities
  alter column id type text using id::text;

alter table if exists workload_assignments
  alter column id type text using id::text,
  alter column faculty_id type text using faculty_id::text,
  alter column scenario_id type text using scenario_id::text,
  alter column course_id type text using course_id::text,
  alter column activity_id type text using activity_id::text;

alter table if exists faculty_course_qualifications
  alter column id type text using id::text,
  alter column faculty_id type text using faculty_id::text,
  alter column course_id type text using course_id::text;

alter table if exists scenarios
  add constraint scenarios_academic_year_id_fkey foreign key (academic_year_id) references academic_years(id) on delete cascade;

alter table if exists workload_assignments
  add constraint workload_assignments_faculty_id_fkey foreign key (faculty_id) references faculty(id) on delete cascade,
  add constraint workload_assignments_scenario_id_fkey foreign key (scenario_id) references scenarios(id) on delete cascade,
  add constraint workload_assignments_course_id_fkey foreign key (course_id) references courses(id),
  add constraint workload_assignments_activity_id_fkey foreign key (activity_id) references activities(id);

alter table if exists faculty_course_qualifications
  add constraint faculty_course_qualifications_faculty_id_fkey foreign key (faculty_id) references faculty(id) on delete cascade,
  add constraint faculty_course_qualifications_course_id_fkey foreign key (course_id) references courses(id) on delete cascade;

alter table if exists faculty
  add column if not exists prefix text not null default 'Dr.';

drop policy if exists "academic_years anon read" on academic_years;
drop policy if exists "academic_years anon write" on academic_years;
drop policy if exists "academic_years auth read" on academic_years;
drop policy if exists "academic_years auth write" on academic_years;
create policy "academic_years anon read" on academic_years for select to anon using (true);
create policy "academic_years anon write" on academic_years for all to anon using (true) with check (true);
create policy "academic_years auth read" on academic_years for select to authenticated using (true);
create policy "academic_years auth write" on academic_years for all to authenticated using (true) with check (true);

drop policy if exists "scenarios anon read" on scenarios;
drop policy if exists "scenarios anon write" on scenarios;
drop policy if exists "scenarios auth read" on scenarios;
drop policy if exists "scenarios auth write" on scenarios;
create policy "scenarios anon read" on scenarios for select to anon using (true);
create policy "scenarios anon write" on scenarios for all to anon using (true) with check (true);
create policy "scenarios auth read" on scenarios for select to authenticated using (true);
create policy "scenarios auth write" on scenarios for all to authenticated using (true) with check (true);

drop policy if exists "faculty anon read" on faculty;
drop policy if exists "faculty anon write" on faculty;
drop policy if exists "faculty auth read" on faculty;
drop policy if exists "faculty auth write" on faculty;
create policy "faculty anon read" on faculty for select to anon using (true);
create policy "faculty anon write" on faculty for all to anon using (true) with check (true);
create policy "faculty auth read" on faculty for select to authenticated using (true);
create policy "faculty auth write" on faculty for all to authenticated using (true) with check (true);

drop policy if exists "courses anon read" on courses;
drop policy if exists "courses anon write" on courses;
drop policy if exists "courses auth read" on courses;
drop policy if exists "courses auth write" on courses;
create policy "courses anon read" on courses for select to anon using (true);
create policy "courses anon write" on courses for all to anon using (true) with check (true);
create policy "courses auth read" on courses for select to authenticated using (true);
create policy "courses auth write" on courses for all to authenticated using (true) with check (true);

drop policy if exists "activities anon read" on activities;
drop policy if exists "activities anon write" on activities;
drop policy if exists "activities auth read" on activities;
drop policy if exists "activities auth write" on activities;
create policy "activities anon read" on activities for select to anon using (true);
create policy "activities anon write" on activities for all to anon using (true) with check (true);
create policy "activities auth read" on activities for select to authenticated using (true);
create policy "activities auth write" on activities for all to authenticated using (true) with check (true);

drop policy if exists "faculty_course_qualifications anon read" on faculty_course_qualifications;
drop policy if exists "faculty_course_qualifications anon write" on faculty_course_qualifications;
drop policy if exists "faculty_course_qualifications auth read" on faculty_course_qualifications;
drop policy if exists "faculty_course_qualifications auth write" on faculty_course_qualifications;
create policy "faculty_course_qualifications anon read" on faculty_course_qualifications for select to anon using (true);
create policy "faculty_course_qualifications anon write" on faculty_course_qualifications for all to anon using (true) with check (true);
create policy "faculty_course_qualifications auth read" on faculty_course_qualifications for select to authenticated using (true);
create policy "faculty_course_qualifications auth write" on faculty_course_qualifications for all to authenticated using (true) with check (true);

drop policy if exists "workload_assignments anon read" on workload_assignments;
drop policy if exists "workload_assignments anon write" on workload_assignments;
drop policy if exists "workload_assignments auth read" on workload_assignments;
drop policy if exists "workload_assignments auth write" on workload_assignments;
create policy "workload_assignments anon read" on workload_assignments for select to anon using (true);
create policy "workload_assignments anon write" on workload_assignments for all to anon using (true) with check (true);
create policy "workload_assignments auth read" on workload_assignments for select to authenticated using (true);
create policy "workload_assignments auth write" on workload_assignments for all to authenticated using (true) with check (true);
