import { Course, Faculty, Program, WorkloadAssignment } from './types';

function toCsvRow(cells: Array<string | number | boolean | null>) {
  return cells
    .map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`)
    .join(',');
}

function parseCsv(raw: string): string[][] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n').filter((line) => line.trim().length > 0);
  return lines.map((line) => {
    const out: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        out.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    out.push(current.trim());
    return out;
  });
}

function toProgram(value: string): Program {
  if (value === 'Mechanical Engineering' || value === 'ICET') return value;
  return 'Other';
}

export function exportFacultySummary(faculty: Faculty[], assignments: WorkloadAssignment[]) {
  const rows = [toCsvRow(['Faculty', 'Annual Target', 'Assigned WU'])];
  faculty.forEach((f) => {
    const total = assignments.filter((a) => a.faculty_id === f.id).reduce((sum, a) => sum + a.workload_units, 0);
    rows.push(toCsvRow([`${f.prefix ?? ''} ${f.name}`.trim(), f.annual_workload_target, total]));
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

export function importFacultyCsv(raw: string): Faculty[] {
  const rows = parseCsv(raw);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.toLowerCase());

  const col = (name: string) => header.indexOf(name);
  const idxName = col('name');
  const idxPrefix = col('prefix');
  const idxProgram = col('program');
  const idxRole = col('rank_or_role');

  return rows.slice(1).map((row, i) => ({
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `faculty-${Date.now()}-${i}`,
    prefix: idxPrefix >= 0 ? row[idxPrefix] : 'Dr.',
    name: idxName >= 0 ? row[idxName] : `Faculty ${i + 1}`,
    program: idxProgram >= 0 ? toProgram(row[idxProgram]) : 'Other',
    rank_or_role: idxRole >= 0 ? row[idxRole] : 'Faculty',
    annual_workload_target: Number(row[col('annual_workload_target')]) || 30,
    fall_target: Number(row[col('fall_target')]) || 10,
    winter_target: Number(row[col('winter_target')]) || 10,
    spring_target: Number(row[col('spring_target')]) || 10,
    summer_target: Number(row[col('summer_target')]) || 0,
    notes: col('notes') >= 0 ? row[col('notes')] : '',
    active: true
  }));
}

export function importCoursesCsv(raw: string): Course[] {
  const rows = parseCsv(raw);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.toLowerCase());
  const col = (name: string) => header.indexOf(name);

  return rows.slice(1).map((row, i) => ({
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `course-${Date.now()}-${i}`,
    prefix: row[col('prefix')] || 'MEEN',
    number: row[col('number')] || String(100 + i),
    title: row[col('title')] || `Course ${i + 1}`,
    program: toProgram(row[col('program')] || 'Other'),
    credit_hours: Number(row[col('credit_hours')]) || 3,
    default_workload_units: Number(row[col('default_workload_units')]) || 3,
    annual_sections_required: Number(row[col('annual_sections_required')]) || 1,
    is_required: (row[col('is_required')] || '').toLowerCase() === 'true',
    normally_offered_fall: (row[col('normally_offered_fall')] || 'true').toLowerCase() === 'true',
    normally_offered_winter: (row[col('normally_offered_winter')] || 'true').toLowerCase() === 'true',
    normally_offered_spring: (row[col('normally_offered_spring')] || 'true').toLowerCase() === 'true',
    normally_offered_summer: (row[col('normally_offered_summer')] || 'false').toLowerCase() === 'true',
    notes: col('notes') >= 0 ? row[col('notes')] : '',
    active: true
  }));
}
