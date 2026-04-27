'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
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
    <button
      ref={setNodeRef}
      type="button"
      style={{ touchAction: 'none' }}
      {...listeners}
      {...attributes}
      className="mb-2 w-full select-none rounded border bg-white p-2 text-left text-xs shadow-sm cursor-grab active:cursor-grabbing"
    >
      <p className="font-semibold">{label}</p>
      <p className="text-slate-600">{subtitle}</p>
    </button>
  );
}

export function UnassignedSidebar({ courses, activities, assignments, canEdit }: Props) {
  const { setNodeRef: setUnassignedRef, isOver: isOverUnassigned } = useDroppable({ id: 'unassigned-drop', disabled: !canEdit });
  const assignedCount = assignments.reduce<Record<string, number>>((acc, a) => {
    if (a.course_id) acc[a.course_id] = (acc[a.course_id] ?? 0) + 1;
    return acc;
  }, {});

  const buildRequiredCourseTemplate = (course: Course) => {
    const required = course.annual_sections_required ?? 1;
    const assigned = assignedCount[course.id] ?? 0;
    const open = Math.max(required - assigned, 0);
    if (open === 0) return null;
    return {
      id: `template-course-${course.id}`,
      label: `${course.prefix} ${course.number} ${course.title}`,
      subtitle: `${course.credit_hours} cr / ${course.default_workload_units} WU · ${open} left to assign (${assigned}/${required} assigned)`
    };
  };

  const required = courses.filter((c) => c.is_required).map(buildRequiredCourseTemplate).filter(Boolean) as Array<{ id: string; label: string; subtitle: string }>;
  const elective = courses.filter((c) => !c.is_required && (assignedCount[c.id] ?? 0) === 0);

  return (
    <aside className="sticky top-28 max-h-[calc(100vh-8rem)] w-80 space-y-3 overflow-y-auto rounded-lg border bg-slate-100 p-3">
      <h3 className="text-sm font-semibold">Unassigned Work</h3>
      <div
        ref={setUnassignedRef}
        className={`rounded border p-2 text-xs ${isOverUnassigned ? 'border-indigo-500 bg-indigo-100 text-indigo-900' : 'border-indigo-200 bg-indigo-50 text-indigo-800'}`}
      >
        Drag any card below into a faculty quarter cell to assign it. Drop an assigned matrix block here to unassign it.
      </div>
      <section>
        <p className="mb-2 text-xs font-semibold text-red-700">Required Courses</p>
        {required.map((c) => <DraggableTemplate key={c.id} id={c.id} label={c.label} subtitle={c.subtitle} canEdit={canEdit} />)}
      </section>
      <section>
        <p className="mb-2 text-xs font-semibold text-amber-700">Elective Courses</p>
        {elective.slice(0, 8).map((c) => <DraggableTemplate key={c.id} id={`template-course-${c.id}`} label={`${c.prefix} ${c.number} ${c.title}`} subtitle={`${c.credit_hours} cr / ${c.default_workload_units} WU`} canEdit={canEdit} />)}
      </section>
      <section>
        <p className="mb-2 text-xs font-semibold text-indigo-700">Activities</p>
        {activities.map((a) => <DraggableTemplate key={a.id} id={`template-activity-${a.id}`} label={a.title} subtitle={`${a.default_workload_units} WU`} canEdit={canEdit} />)}
      </section>
    </aside>
  );
}
