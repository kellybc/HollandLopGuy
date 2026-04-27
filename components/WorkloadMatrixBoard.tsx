'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { quarters } from '@/lib/seed-data';
import { WorkloadAssignment } from '@/lib/types';
import { annualTotal, quarterTotal, targetForQuarter, workloadStatus } from '@/lib/workload';
import { MatrixCell } from './MatrixCell';
import { AssignmentModal } from './AssignmentModal';
import { UnassignedSidebar } from './UnassignedSidebar';
import { findWarnings } from '@/lib/validation';
import { exportAssignments, exportCourseCoverage, exportFacultySummary } from '@/lib/csv';
import { useAppData } from './AppDataProvider';

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
  const { activities, courses, faculty, scenarios, academicYears, selectedAcademicYear, setSelectedAcademicYear, qualifications, assignments, setAssignments, setFaculty } = useAppData();
  const [selectedScenario, setSelectedScenario] = useState('sc-base');
  const [selected, setSelected] = useState<WorkloadAssignment | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [compactMode, setCompactMode] = useState(false);
  const role = (process.env.NEXT_PUBLIC_APP_ROLE ?? 'admin') as 'admin' | 'viewer';
  const canEdit = role === 'admin';

  const scenarioAssignments = assignments.filter((a) => a.scenario_id === selectedScenario && a.academic_year === selectedAcademicYear);
  const warnings = useMemo(() => findWarnings({ assignments: scenarioAssignments, faculty, courses, activities, qualifications }), [scenarioAssignments]);

  useEffect(() => {
    if (scenarios.length === 0) return;
    if (!scenarios.some((scenario) => scenario.id === selectedScenario)) {
      setSelectedScenario(scenarios[0].id);
    }
  }, [scenarios, selectedScenario]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || !canEdit) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (overId === 'unassigned-drop') {
      if (!activeId.startsWith('template-')) {
        setAssignments((prev) => prev.filter((assignment) => assignment.id !== activeId));
      }
      return;
    }

    const [facultyId, quarter] = overId.split('::');
    if (!facultyId || !quarter) return;

    if (activeId.startsWith('template-course-')) {
      const courseId = activeId.replace('template-course-', '');
      const course = courses.find((c) => c.id === courseId);
      if (!course) return;
      const existingSections = assignments.filter((a) => a.scenario_id === selectedScenario && a.academic_year === selectedAcademicYear && a.course_id === courseId).length;
      const section = existingSections + 1;
      const next: WorkloadAssignment = {
        id: crypto.randomUUID(),
        faculty_id: facultyId,
        scenario_id: selectedScenario,
        academic_year: selectedAcademicYear,
        quarter: quarter as WorkloadAssignment['quarter'],
        item_type: 'course',
        course_id: course.id,
        activity_id: null,
        workload_units: course.default_workload_units,
        workload_units_override: false,
        credit_hours_snapshot: course.credit_hours,
        section,
        label: `${course.prefix} ${course.number}\n${course.title} · Sec ${section}`,
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
        academic_year: selectedAcademicYear,
        quarter: quarter as WorkloadAssignment['quarter'],
        item_type: 'activity',
        course_id: null,
        activity_id: activity.id,
        workload_units: activity.default_workload_units,
        workload_units_override: false,
        credit_hours_snapshot: null,
        section: null,
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

  const dragPreview = (() => {
    if (!activeDragId) return null;
    if (activeDragId.startsWith('template-course-')) {
      const courseId = activeDragId.replace('template-course-', '');
      const course = courses.find((c) => c.id === courseId);
      return course ? `${course.prefix} ${course.number} ${course.title}` : 'Course';
    }
    if (activeDragId.startsWith('template-activity-')) {
      const activityId = activeDragId.replace('template-activity-', '');
      return activities.find((a) => a.id === activityId)?.title ?? 'Activity';
    }
    return assignments.find((a) => a.id === activeDragId)?.label ?? null;
  })();

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveDragId(null)}>
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Academic Year Planning Board</h2>
              <p className="text-sm text-slate-600">Graphical blocks scale by workload units (1 WU = 40px). Click any placed block to edit or remove it.</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="rounded border p-2 text-sm" value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}>
                {scenarios.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}
              </select>
              <select className="rounded border p-2 text-sm" value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)}>
                {academicYears.map((y) => <option value={y.label} key={y.id}>{y.label}</option>)}
              </select>
              <button className="rounded border px-2 py-1 text-xs" onClick={() => saveCsv('faculty-summary.csv', exportFacultySummary(faculty, scenarioAssignments))}>Export Faculty CSV</button>
              <button className="rounded border px-2 py-1 text-xs" onClick={() => saveCsv('course-coverage.csv', exportCourseCoverage(courses, scenarioAssignments))}>Export Coverage CSV</button>
              <button className="rounded border px-2 py-1 text-xs" onClick={() => saveCsv('assignments.csv', exportAssignments(scenarioAssignments))}>Export Assignments</button>
              <button className="rounded border px-2 py-1 text-xs" onClick={() => setCompactMode((prev) => !prev)}>{compactMode ? 'Expanded View' : 'Compact View'}</button>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="grid matrix-grid gap-2 overflow-auto">
            <div className="rounded-lg border bg-slate-200 p-2 text-sm font-semibold">Faculty</div>
            {quarters.map((q) => <div key={q} className="rounded-lg border bg-slate-200 p-2 text-sm font-semibold">{q}</div>)}

            {faculty.map((f) => (
              <Fragment key={f.id}>
                <div key={`${f.id}-info`} className="rounded-lg border bg-white p-3">
                  <p className="font-semibold">{`${f.prefix ?? ''} ${f.name}`.trim()}</p>
                  {!compactMode ? (
                    <textarea
                      className="mt-2 w-full rounded border p-1 text-[11px] text-slate-600"
                      placeholder="Faculty notes"
                      value={f.notes ?? ''}
                      onChange={(e) => setFaculty((prev) => prev.map((x) => (x.id === f.id ? { ...x, notes: e.target.value } : x)))}
                      readOnly={!canEdit}
                    />
                  ) : null}
                  <p className="text-xs text-slate-600">Annual {annualTotal(scenarioAssignments, f.id)}/{f.annual_workload_target} WU</p>
                </div>
                {quarters.map((q) => {
                  const items = scenarioAssignments.filter((a) => a.faculty_id === f.id && a.quarter === q);
                  const total = quarterTotal(scenarioAssignments, f.id, q);
                  const target = targetForQuarter(f, q);
                  const status = workloadStatus(total, target);
                  const overloaded = total > target;
                  return (
                    <div key={`${f.id}-${q}`} className="space-y-1">
                      <div className={`rounded px-2 py-1 text-xs font-medium ${status === 'green' ? 'bg-green-100 text-green-800' : status === 'yellow' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'} ${overloaded ? 'overloaded-glow' : ''}`}>
                        {total} / {target} WU
                      </div>
                      {compactMode ? (
                        <div className="rounded border bg-slate-50 p-2 text-xs text-slate-600">
                          {items.length} assignments
                        </div>
                      ) : (
                        <MatrixCell
                          facultyId={f.id}
                          quarter={q}
                          assignments={items}
                          canEdit={canEdit}
                          onSelect={setSelected}
                          onUnassign={(assignmentId) => setAssignments((prev) => prev.filter((assignment) => assignment.id !== assignmentId))}
                        />
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
          </div>

          <div className="mt-4 rounded-lg border bg-white p-3">
            <h3 className="mb-2 text-sm font-semibold">Validation Warnings</h3>
            <ul className="list-disc space-y-1 pl-6 text-sm text-slate-700">
              {warnings.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>

          <AssignmentModal assignment={selected} onClose={() => setSelected(null)} onSave={(draft) => { setAssignments((prev) => prev.map((a) => (a.id === draft.id ? { ...draft, updated_at: new Date().toISOString() } : a))); setSelected(null); }} onDelete={(assignmentId) => { setAssignments((prev) => prev.filter((a) => a.id !== assignmentId)); setSelected(null); }} readOnly={!canEdit} />
        </div>

        <UnassignedSidebar courses={courses} activities={activities} assignments={scenarioAssignments} canEdit={canEdit} />
      </div>
      <DragOverlay>
        {dragPreview ? (
          <div className="max-w-72 rounded-md border border-indigo-300 bg-white p-2 text-xs font-semibold shadow-lg">
            {dragPreview}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
