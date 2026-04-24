'use client';

import { useDraggable } from '@dnd-kit/core';
import { WorkloadAssignment } from '@/lib/types';
import { workloadHeight } from '@/lib/workload';

type Props = {
  assignment: WorkloadAssignment;
  canEdit: boolean;
  onClick: (assignment: WorkloadAssignment) => void;
};

export function WorkloadBlock({ assignment, canEdit, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: assignment.id, disabled: !canEdit });
  return (
    <button
      ref={setNodeRef}
      style={{
        height: workloadHeight(assignment.workload_units),
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
      }}
      className="mb-2 w-full rounded-md border border-slate-300 bg-white p-2 text-left shadow-sm"
      onClick={() => onClick(assignment)}
      {...listeners}
      {...attributes}
    >
      <p className="text-xs font-semibold">{assignment.label}</p>
      <p className="text-xs text-slate-600">
        {assignment.credit_hours_snapshot ?? '-'} cr / {assignment.workload_units} WU {assignment.workload_units_override ? 'OVERRIDE' : ''}
      </p>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{assignment.status}</p>
    </button>
  );
}
