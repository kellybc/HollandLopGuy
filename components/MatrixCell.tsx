'use client';

import { useDroppable } from '@dnd-kit/core';
import { Quarter, WorkloadAssignment } from '@/lib/types';
import { WorkloadBlock } from './WorkloadBlock';

type Props = {
  facultyId: string;
  quarter: Quarter;
  assignments: WorkloadAssignment[];
  canEdit: boolean;
  onSelect: (assignment: WorkloadAssignment) => void;
};

export function MatrixCell({ facultyId, quarter, assignments, canEdit, onSelect }: Props) {
  const droppableId = `${facultyId}::${quarter}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId, disabled: !canEdit });
  return (
    <div ref={setNodeRef} className={`min-h-56 rounded-lg border p-2 ${isOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-100'}`}>
      {assignments.map((a) => (
        <WorkloadBlock key={a.id} assignment={a} canEdit={canEdit} onClick={onSelect} />
      ))}
    </div>
  );
}
