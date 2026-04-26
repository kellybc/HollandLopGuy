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
  const tone = assignment.item_type === 'course'
    ? assignment.status === 'confirmed'
      ? 'border-blue-300 bg-blue-50'
      : assignment.status === 'problem'
        ? 'border-red-300 bg-red-50'
        : 'border-indigo-300 bg-indigo-50'
    : assignment.status === 'confirmed'
      ? 'border-emerald-300 bg-emerald-50'
      : assignment.status === 'problem'
        ? 'border-red-300 bg-red-50'
        : 'border-teal-300 bg-teal-50';
  return (
    <button
      ref={setNodeRef}
      style={{
        height: workloadHeight(assignment.workload_units),
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        touchAction: 'none'
      }}
      className={`mb-2 w-full cursor-grab rounded-md border p-2 text-left shadow-sm active:cursor-grabbing ${tone}`}
      onClick={() => onClick(assignment)}
      {...listeners}
      {...attributes}
    >
      <p className="text-xs font-semibold">{assignment.label}</p>
      <p className="text-xs text-slate-600">
        {assignment.credit_hours_snapshot ?? '-'} cr / {assignment.workload_units} WU {assignment.workload_units_override ? 'OVERRIDE' : ''}
      </p>
    </button>
  );
}
