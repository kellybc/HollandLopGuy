'use client';

import { useDraggable } from '@dnd-kit/core';
import { Activity, Course, WorkloadAssignment } from '@/lib/types';

type Props = {
  courses: Course[];
  activities: Activity[];
  assignments: WorkloadAssignment[];
  canEdit: boolean;
};

function DraggableTemplate({ id, label, subtitle, canEdit }: { id: string; label: string; subtitle: string; canEdit: boolean }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id, disabled: !canEdit });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="mb-2 rounded border bg-white p-2 text-xs shadow-sm">
      <p className="font-semibold">{label}</p>
      <p className="text-slate-600">{subtitle}</p>
    </div>
  );
}

export function UnassignedSidebar({ courses, activities, assignments, canEdit }: Props) {
  const assignedCount = assignments.reduce<Record<string, number>>((acc, a) => {
    if (a.course_id) acc[a.course_id] = (acc[a.course_id] ?? 0) + 1;
    return acc;
  }, {});

  const buildCourseSlots = (course: Course) => {
    const required = course.annual_sections_required ?? 1;
    const assigned = assignedCount[course.id] ?? 0;
    const open = Math.max(required - assigned, 0);
    return Array.from({ length: open }, (_, index) => ({
      id: `template-course-${course.id}-${index + 1}`,
      label: `${course.prefix} ${course.number} ${course.title} · Sec ${assigned + index + 1}`,
      subtitle: `${course.credit_hours} cr / ${course.default_workload_units} WU · ${assigned}/${required} assigned`
    }));
  };

  const required = courses.filter((c) => c.is_required).flatMap(buildCourseSlots);
  const elective = courses.filter((c) => !c.is_required && (assignedCount[c.id] ?? 0) === 0);

  return (
    <aside className="w-80 space-y-3 rounded-lg border bg-slate-100 p-3">
      <h3 className="text-sm font-semibold">Unassigned Work</h3>
      <section>
        <p className="mb-2 text-xs font-semibold text-red-700">Required Courses</p>
        {required.map((c) => <DraggableTemplate key={c.id} id={c.id} label={c.label} subtitle={c.subtitle} canEdit={canEdit} />)}
      </section>
      <section>
        <p className="mb-2 text-xs font-semibold text-amber-700">Elective Courses</p>
        {elective.slice(0, 8).map((c) => <DraggableTemplate key={c.id} id={`template-course-${c.id}-1`} label={`${c.prefix} ${c.number} ${c.title}`} subtitle={`${c.credit_hours} cr / ${c.default_workload_units} WU`} canEdit={canEdit} />)}
      </section>
      <section>
        <p className="mb-2 text-xs font-semibold text-indigo-700">Activities</p>
        {activities.map((a) => <DraggableTemplate key={a.id} id={`template-activity-${a.id}`} label={a.title} subtitle={`${a.default_workload_units} WU`} canEdit={canEdit} />)}
      </section>
    </aside>
  );
}
