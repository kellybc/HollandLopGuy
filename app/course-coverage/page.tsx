import { courses, faculty, initialAssignments, quarters } from '@/lib/seed-data';

export default function CourseCoveragePage() {
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
            const byQ = quarters.map((q) => initialAssignments.find((a) => a.course_id === course.id && a.quarter === q));
            const unassignedRequired = course.is_required && byQ.every((x) => !x);
            return (
              <tr key={course.id} className={unassignedRequired ? 'bg-red-50' : ''}>
                <td className="border p-2">{course.prefix} {course.number} {course.title}</td>
                {quarters.map((q, i) => {
                  const assignment = byQ[i];
                  if (!assignment) return <td key={q} className="border p-2 text-center text-slate-400">—</td>;
                  const person = faculty.find((f) => f.id === assignment.faculty_id);
                  const normal = { Fall: course.normally_offered_fall, Winter: course.normally_offered_winter, Spring: course.normally_offered_spring, Summer: course.normally_offered_summer }[q];
                  return <td key={q} className={`border p-2 text-center ${normal ? '' : 'bg-amber-100'}`}>{person?.name ?? 'Unknown'}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
