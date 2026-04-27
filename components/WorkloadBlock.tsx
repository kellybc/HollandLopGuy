'use client';

import { useDraggable } from '@dnd-kit/core';
import { WorkloadAssignment } from '@/lib/types';
import { workloadHeight } from '@/lib/workload';
import { useAppData } from './AppDataProvider';

type Props = {
  assignment: WorkloadAssignment;
  canEdit: boolean;
  onClick: (assignment: WorkloadAssignment) => void;
  onUnassign: (assignmentId: string) => void;
};

export function WorkloadBlock({ assignment, canEdit, onClick, onUnassign }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: assignment.id, disabled: !canEdit });
  const { blockColors } = useAppData();
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const darkModeColors = {
    course_planned: '#312e81',
    course_confirmed: '#1e3a8a',
    activity_planned: '#134e4a',
    activity_confirmed: '#14532d',
    problem: '#7f1d1d'
  } as const;
  const tonePalette = isDarkMode ? darkModeColors : blockColors;
  const backgroundColor = assignment.status === 'problem'
    ? tonePalette.problem
    : assignment.item_type === 'course'
      ? assignment.status === 'confirmed'
        ? tonePalette.course_confirmed
        : tonePalette.course_planned
      : assignment.status === 'confirmed'
        ? tonePalette.activity_confirmed
        : tonePalette.activity_planned;
  return (
    <div
      ref={setNodeRef}
      style={{
        height: workloadHeight(assignment.workload_units),
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        touchAction: 'none',
        backgroundColor,
        borderColor: isDarkMode ? '#334155' : assignment.status === 'problem' ? '#b91c1c' : '#64748b'
      }}
      className="relative mb-2 w-full cursor-grab rounded-md border p-2 text-left shadow-sm active:cursor-grabbing"
      onClick={() => onClick(assignment)}
      {...listeners}
      {...attributes}
    >
      {canEdit ? (
        <button
          type="button"
          className="absolute right-1 top-1 rounded border border-slate-300 bg-white/90 px-1 text-[10px] leading-4 text-slate-700 hover:bg-white"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onUnassign(assignment.id);
          }}
          title="Remove from faculty and return to unassigned"
        >
          ↩
        </button>
      ) : null}
      <p className="text-xs font-semibold">{assignment.label}</p>
      <p className="text-xs text-slate-600">
        {assignment.credit_hours_snapshot ?? '-'} cr / {assignment.workload_units} WU {assignment.workload_units_override ? 'OVERRIDE' : ''}
      </p>
    </div>
  );
}
