import { Course, Faculty, WorkloadAssignment } from './types';

function toCsvRow(cells: Array<string | number | boolean | null>) {
  return cells
    .map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`)
    .join(',');
}

export function exportFacultySummary(faculty: Faculty[], assignments: WorkloadAssignment[]) {
  const rows = [toCsvRow(['Faculty', 'Annual Target', 'Assigned WU'])];
  faculty.forEach((f) => {
    const total = assignments.filter((a) => a.faculty_id === f.id).reduce((sum, a) => sum + a.workload_units, 0);
    rows.push(toCsvRow([f.name, f.annual_workload_target, total]));
  });
  return rows.join('\n');
}

export function exportCourseCoverage(courses: Course[], assignments: WorkloadAssignment[]) {
  const rows = [toCsvRow(['Course', 'Fall', 'Winter', 'Spring', 'Summer'])];
  courses.forEach((course) => {
    const byQuarter = ['Fall', 'Winter', 'Spring', 'Summer'].map((q) => assignments.find((a) => a.course_id === course.id && a.quarter === q)?.faculty_id ?? 'Unassigned');
    rows.push(toCsvRow([`${course.prefix} ${course.number}`, ...byQuarter]));
  });
  return rows.join('\n');
}

export function exportAssignments(assignments: WorkloadAssignment[]) {
  const rows = [toCsvRow(['id', 'faculty_id', 'scenario_id', 'quarter', 'item_type', 'course_id', 'activity_id', 'workload_units', 'status'])];
  assignments.forEach((a) => rows.push(toCsvRow([a.id, a.faculty_id, a.scenario_id, a.quarter, a.item_type, a.course_id, a.activity_id, a.workload_units, a.status])));
  return rows.join('\n');
}

export function importFacultyCsv(raw: string) {
  return raw.split('\n').slice(1).filter(Boolean);
}

export function importCoursesCsv(raw: string) {
  return raw.split('\n').slice(1).filter(Boolean);
}
