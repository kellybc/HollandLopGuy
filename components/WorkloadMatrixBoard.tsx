'use client';

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Fragment, useMemo, useState } from 'react';
import { activities, courses, faculty, initialAssignments, qualifications, quarters, scenarios } from '@/lib/seed-data';
import { WorkloadAssignment } from '@/lib/types';
import { annualTotal, quarterTotal, targetForQuarter, workloadStatus } from '@/lib/workload';
import { MatrixCell } from './MatrixCell';
import { AssignmentModal } from './AssignmentModal';
import { UnassignedSidebar } from './UnassignedSidebar';
import { findWarnings } from '@/lib/validation';
import { exportAssignments, exportCourseCoverage, exportFacultySummary } from '@/lib/csv';

function saveCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function WorkloadMatrixBoard() {
  const [selectedScenario, setSelectedScenario] = useState('sc-base');
  const [assignments, setAssignments] = useState<WorkloadAssignment[]>(initialAssignments);
  const [selected, setSelected] = useState<WorkloadAssignment | null>(null);
  const role = (process.env.NEXT_PUBLIC_APP_ROLE ?? 'admin') as 'admin' | 'viewer';
  const canEdit = role === 'admin';

  const scenarioAssignments = assignments.filter((a) => a.scenario_id === selectedScenario);
  const warnings = useMemo(() => findWarnings({ assignments: scenarioAssignments, faculty, courses, activities, qualifications }), [scenarioAssignments]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !canEdit) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const [facultyId, quarter] = overId.split('::');
    if (!facultyId || !quarter) return;

    if (activeId.startsWith('template-course-')) {
      const courseId = activeId.replace('template-course-', '');
      const course = courses.find((c) => c.id === courseId);
      if (!course) return;
      const next: WorkloadAssignment = {
        id: crypto.randomUUID(),
        faculty_id: facultyId,
        scenario_id: selectedScenario,
        academic_year: '2026-2027',
        quarter: quarter as WorkloadAssignment['quarter'],
        item_type: 'course',
        course_id: course.id,
        activity_id: null,
        workload_units: course.default_workload_units,
        workload_units_override: false,
        credit_hours_snapshot: course.credit_hours,
        label: `${course.prefix} ${course.number}\n${course.title}`,
        status: 'planned',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setAssignments((prev) => [...prev, next]);
      return;
    }

    if (activeId.startsWith('template-activity-')) {
      const activityId = activeId.replace('template-activity-', '');
      const activity = activities.find((a) => a.id === activityId);
      if (!activity) return;
      const next: WorkloadAssignment = {
        id: crypto.randomUUID(),
        faculty_id: facultyId,
        scenario_id: selectedScenario,
        academic_year: '2026-2027',
        quarter: quarter as WorkloadAssignment['quarter'],
        item_type: 'activity',
        course_id: null,
        activity_id: activity.id,
        workload_units: activity.default_workload_units,
        workload_units_override: false,
        credit_hours_snapshot: null,
        label: activity.title,
        status: 'planned',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setAssignments((prev) => [...prev, next]);
      return;
    }

    setAssignments((prev) => prev.map((assignment) => (assignment.id === activeId ? { ...assignment, faculty_id: facultyId, quarter: quarter as WorkloadAssignment['quarter'] } : assignment)));
  };

  return (
    <div className="flex gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Academic Year Planning Board</h2>
            <p className="text-sm text-slate-600">Graphical blocks scale by workload units (1 WU = 40px).</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="rounded border p-2 text-sm" value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}>
              {scenarios.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}
            </select>
            <button className="rounded border px-2 py-1 text-xs" onClick={() => saveCsv('faculty-summary.csv', exportFacultySummary(faculty, scenarioAssignments))}>Export Faculty CSV</button>
            <button className="rounded border px-2 py-1 text-xs" onClick={() => saveCsv('course-coverage.csv', exportCourseCoverage(courses, scenarioAssignments))}>Export Coverage CSV</button>
            <button className="rounded border px-2 py-1 text-xs" onClick={() => saveCsv('assignments.csv', exportAssignments(scenarioAssignments))}>Export Assignments</button>
          </div>
        </div>

        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid matrix-grid gap-2 overflow-auto">
            <div className="rounded-lg border bg-slate-200 p-2 text-sm font-semibold">Faculty</div>
            {quarters.map((q) => <div key={q} className="rounded-lg border bg-slate-200 p-2 text-sm font-semibold">{q}</div>)}

            {faculty.map((f) => (
              <Fragment key={f.id}>
                <div key={`${f.id}-info`} className="rounded-lg border bg-white p-3">
                  <p className="font-semibold">{f.name}</p>
                  <p className="text-xs text-slate-600">Annual {annualTotal(scenarioAssignments, f.id)}/{f.annual_workload_target} WU</p>
                </div>
                {quarters.map((q) => {
                  const items = scenarioAssignments.filter((a) => a.faculty_id === f.id && a.quarter === q);
                  const total = quarterTotal(scenarioAssignments, f.id, q);
                  const status = workloadStatus(total, targetForQuarter(f, q));
                  return (
                    <div key={`${f.id}-${q}`} className="space-y-1">
                      <div className={`rounded px-2 py-1 text-xs font-medium ${status === 'green' ? 'bg-green-100 text-green-800' : status === 'yellow' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                        {total} / {targetForQuarter(f, q)} WU
                      </div>
                      <MatrixCell facultyId={f.id} quarter={q} assignments={items} canEdit={canEdit} onSelect={setSelected} />
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </DndContext>

        <div className="mt-4 rounded-lg border bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold">Validation Warnings</h3>
          <ul className="list-disc space-y-1 pl-6 text-sm text-slate-700">
            {warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>

        <AssignmentModal assignment={selected} onClose={() => setSelected(null)} onSave={(draft) => { setAssignments((prev) => prev.map((a) => (a.id === draft.id ? { ...draft, updated_at: new Date().toISOString() } : a))); setSelected(null); }} readOnly={!canEdit} />
      </div>

      <UnassignedSidebar courses={courses} activities={activities} assignments={scenarioAssignments} canEdit={canEdit} />
    </div>
  );
}
