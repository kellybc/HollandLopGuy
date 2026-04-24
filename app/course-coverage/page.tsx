'use client';

import { useAppData } from '@/components/AppDataProvider';
import { quarters } from '@/lib/seed-data';

export default function CourseCoveragePage() {
  const { courses, faculty, assignments } = useAppData();

  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Course Coverage View</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2 text-left">Course</th>
            {quarters.map((q) => <th key={q} className="border p-2">{q}</th>)}
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const byQ = quarters.map((q) => assignments.filter((a) => a.course_id === course.id && a.quarter === q));
            const requiredSections = course.annual_sections_required ?? 1;
            const assignedSections = byQ.reduce((sum, entries) => sum + entries.length, 0);
            const unassignedRequired = course.is_required && assignedSections < requiredSections;
            return (
              <tr key={course.id} className={unassignedRequired ? 'bg-red-50' : ''}>
                <td className="border p-2">{course.prefix} {course.number} {course.title} {course.is_required ? <span className="text-xs text-slate-500">({assignedSections}/{requiredSections} sections)</span> : null}</td>
                {quarters.map((q, i) => {
                  const quarterAssignments = byQ[i];
                  if (!quarterAssignments.length) return <td key={q} className="border p-2 text-center text-slate-400">—</td>;
                  const normal = { Fall: course.normally_offered_fall, Winter: course.normally_offered_winter, Spring: course.normally_offered_spring, Summer: course.normally_offered_summer }[q];
                  return <td key={q} className={`border p-2 text-center ${normal ? '' : 'bg-amber-100'}`}>{quarterAssignments.map((assignment) => { const fac = faculty.find((f) => f.id === assignment.faculty_id); return fac ? `${fac.prefix ?? ''} ${fac.name}`.trim() : 'Unknown'; }).join(', ')}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
