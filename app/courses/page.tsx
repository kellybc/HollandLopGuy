'use client';

import { useAppData } from '@/components/AppDataProvider';

export default function CoursesPage() {
  const { courses } = useAppData();
  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Courses</h2>
      <div className="grid gap-2 md:grid-cols-2">
        {courses.map((course) => (
          <div key={course.id} className="rounded border p-2 text-sm">
            <p className="font-medium">{course.prefix} {course.number} - {course.title}</p>
            <p>{course.credit_hours} cr / {course.default_workload_units} WU {course.is_required ? '· Required' : '· Elective'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
