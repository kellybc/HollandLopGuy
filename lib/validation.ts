import { Activity, Course, Faculty, FacultyCourseQualification, Quarter, WorkloadAssignment } from './types';
import { annualTotal, quarterTotal, targetForQuarter } from './workload';

export function findWarnings(params: {
  assignments: WorkloadAssignment[];
  faculty: Faculty[];
  courses: Course[];
  activities: Activity[];
  qualifications: FacultyCourseQualification[];
}) {
  const { assignments, faculty, courses, qualifications } = params;
  const warnings: string[] = [];

  const assignedCount = assignments.reduce<Record<string, number>>((acc, a) => {
    if (a.course_id) acc[a.course_id] = (acc[a.course_id] ?? 0) + 1;
    return acc;
  }, {});
  courses
    .filter((c) => c.is_required)
    .forEach((c) => {
      const requiredSections = c.annual_sections_required ?? 1;
      const assignedSections = assignedCount[c.id] ?? 0;
      if (assignedSections < requiredSections) {
        warnings.push(`Required course sections unassigned: ${c.prefix} ${c.number} (${assignedSections}/${requiredSections})`);
      }
    });

  faculty.forEach((f) => {
    const annual = annualTotal(assignments, f.id);
    if (annual < f.annual_workload_target) warnings.push(`${f.name} annual workload below target (${annual}/${f.annual_workload_target})`);
    if (annual > f.annual_workload_target) warnings.push(`${f.name} annual workload above target (${annual}/${f.annual_workload_target})`);

    (['Fall', 'Winter', 'Spring', 'Summer'] as Quarter[]).forEach((q) => {
      const total = quarterTotal(assignments, f.id, q);
      if (total > targetForQuarter(f, q)) warnings.push(`${f.name} ${q} workload above target (${total}/${targetForQuarter(f, q)})`);
    });
  });

  assignments.forEach((a) => {
    if (a.workload_units <= 0) warnings.push(`${a.label} has zero workload units`);
    if (a.item_type === 'course' && a.course_id) {
      const course = courses.find((c) => c.id === a.course_id);
      const qual = qualifications.find((q) => q.course_id === a.course_id && q.faculty_id === a.faculty_id);
      if (!qual) warnings.push(`${a.label} has no qualification record for assigned faculty`);
      if (qual?.qualification_level === 'avoid') warnings.push(`${a.label} assigned to faculty marked avoid`);

      if (course) {
        const normal = {
          Fall: course.normally_offered_fall,
          Winter: course.normally_offered_winter,
          Spring: course.normally_offered_spring,
          Summer: course.normally_offered_summer
        }[a.quarter];
        if (!normal) warnings.push(`${a.label} assigned in non-standard quarter (${a.quarter})`);
      }
    }
  });

  return warnings;
}
