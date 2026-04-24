import { Course, Faculty, Quarter, WorkloadAssignment } from './types';

export const pixelsPerWU = 40;

export function workloadHeight(workloadUnits: number): number {
  return Math.max(workloadUnits, 1) * pixelsPerWU;
}

export function quarterTotal(assignments: WorkloadAssignment[], facultyId: string, quarter: Quarter) {
  return assignments.filter((a) => a.faculty_id === facultyId && a.quarter === quarter).reduce((sum, a) => sum + a.workload_units, 0);
}

export function annualTotal(assignments: WorkloadAssignment[], facultyId: string) {
  return assignments.filter((a) => a.faculty_id === facultyId).reduce((sum, a) => sum + a.workload_units, 0);
}

export function workloadStatus(total: number, target: number): 'green' | 'yellow' | 'red' {
  const delta = Math.abs(total - target);
  if (delta <= 1) return 'green';
  if (delta <= 3) return 'yellow';
  return 'red';
}

export function courseDisplay(course: Course) {
  return `${course.prefix} ${course.number} ${course.title}`;
}

export function targetForQuarter(faculty: Faculty, quarter: Quarter) {
  return {
    Fall: faculty.fall_target,
    Winter: faculty.winter_target,
    Spring: faculty.spring_target,
    Summer: faculty.summer_target
  }[quarter];
}
