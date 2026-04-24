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
  const assigned = new Set(assignments.map((a) => a.course_id).filter(Boolean));
  const required = courses.filter((c) => c.is_required && !assigned.has(c.id));
  const elective = courses.filter((c) => !c.is_required && !assigned.has(c.id));

  return (
    <aside className="w-80 space-y-3 rounded-lg border bg-slate-100 p-3">
      <h3 className="text-sm font-semibold">Unassigned Work</h3>
      <section>
        <p className="mb-2 text-xs font-semibold text-red-700">Required Courses</p>
        {required.map((c) => <DraggableTemplate key={c.id} id={`template-course-${c.id}`} label={`${c.prefix} ${c.number} ${c.title}`} subtitle={`${c.credit_hours} cr / ${c.default_workload_units} WU`} canEdit={canEdit} />)}
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
