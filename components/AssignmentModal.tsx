'use client';

import { useState } from 'react';
import { WorkloadAssignment } from '@/lib/types';

type Props = {
  assignment: WorkloadAssignment | null;
  onClose: () => void;
  onSave: (assignment: WorkloadAssignment) => void;
  onDelete?: (assignmentId: string) => void;
  readOnly?: boolean;
};

export function AssignmentModal({ assignment, onClose, onSave, onDelete, readOnly }: Props) {
  const [draft, setDraft] = useState<WorkloadAssignment | null>(assignment);
  if (!assignment || !draft) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-lg bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Edit Assignment</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">Workload Units
            <input disabled={readOnly} type="number" value={draft.workload_units} onChange={(e) => setDraft({ ...draft, workload_units: Number(e.target.value) })} className="mt-1 w-full rounded border p-2" />
          </label>
          <label className="text-sm">Credit Hours
            <input disabled={readOnly} type="number" value={draft.credit_hours_snapshot ?? 0} onChange={(e) => setDraft({ ...draft, credit_hours_snapshot: Number(e.target.value) })} className="mt-1 w-full rounded border p-2" />
          </label>
          <label className="text-sm">Status
            <select disabled={readOnly} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as WorkloadAssignment['status'] })} className="mt-1 w-full rounded border p-2">
              <option value="planned">planned</option>
              <option value="confirmed">confirmed</option>
              <option value="problem">problem</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input disabled={readOnly} type="checkbox" checked={draft.workload_units_override} onChange={(e) => setDraft({ ...draft, workload_units_override: e.target.checked })} />
            Override workload units
          </label>
          <label className="text-sm md:col-span-2">Notes
            <textarea disabled={readOnly} value={draft.notes ?? ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className="mt-1 w-full rounded border p-2" rows={3} />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {!readOnly && onDelete ? <button onClick={() => onDelete(draft.id)} className="rounded border border-red-300 px-3 py-2 text-red-700">Delete</button> : null}
          <button onClick={onClose} className="rounded border px-3 py-2">Close</button>
          {!readOnly && <button onClick={() => onSave(draft)} className="rounded bg-slate-900 px-3 py-2 text-white">Save</button>}
        </div>
      </div>
    </div>
  );
}
