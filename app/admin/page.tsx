'use client';

import { useState } from 'react';
import { useAppData } from '@/components/AppDataProvider';
import { Program, Quarter, WorkloadAssignment } from '@/lib/types';

const quarterOptions: Quarter[] = ['Fall', 'Winter', 'Spring', 'Summer'];

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`;
}

export default function AdminPage() {
  const { faculty, courses, activities, assignments, academicYears, selectedAcademicYear, setSelectedAcademicYear, setFaculty, setCourses, setActivities, setAssignments, blockColors, setBlockColors, resetToSeed } = useAppData();
  const role = process.env.NEXT_PUBLIC_APP_ROLE ?? 'admin';

  const [newFaculty, setNewFaculty] = useState<{ prefix: string; name: string; program: Program; rank_or_role: string; annual_workload_target: number; fall_target: number; winter_target: number; spring_target: number; summer_target: number }>({ prefix: 'Dr.', name: '', program: 'Mechanical Engineering', rank_or_role: 'Faculty', annual_workload_target: 30, fall_target: 10, winter_target: 10, spring_target: 10, summer_target: 0 });
  const [newCourse, setNewCourse] = useState<{ prefix: string; number: string; title: string; program: Program; credit_hours: number; default_workload_units: number; annual_sections_required: number; is_required: boolean }>({ prefix: 'MEEN', number: '', title: '', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 3, annual_sections_required: 1, is_required: true });
  const [newAssignment, setNewAssignment] = useState({ faculty_id: faculty[0]?.id ?? '', quarter: 'Fall' as Quarter, item_type: 'course' as 'course' | 'activity', course_id: courses[0]?.id ?? '', activity_id: activities[0]?.id ?? '', workload_units: 3, status: 'planned' as WorkloadAssignment['status'] });
  const [newActivity, setNewActivity] = useState({ title: '', category: 'other' as const, default_workload_units: 1 });

  if (role !== 'admin') {
    return <div className="rounded-lg border bg-white p-4">Viewer mode: admin panel is read-only.</div>;
  }

  const createFaculty = () => {
    if (!newFaculty.name.trim()) return;
    setFaculty((prev) => [...prev, { id: makeId(), notes: '', active: true, ...newFaculty }]);
    setNewFaculty((prev) => ({ ...prev, name: '' }));
  };

  const createCourse = () => {
    if (!newCourse.number.trim() || !newCourse.title.trim()) return;
    setCourses((prev) => [...prev, {
      id: makeId(),
      notes: '',
      active: true,
      normally_offered_fall: true,
      normally_offered_winter: true,
      normally_offered_spring: true,
      normally_offered_summer: false,
      ...newCourse
    }]);
    setNewCourse((prev) => ({ ...prev, number: '', title: '' }));
  };

  const createAssignment = () => {
    const course = courses.find((c) => c.id === newAssignment.course_id);
    const activity = activities.find((a) => a.id === newAssignment.activity_id);
    const isCourse = newAssignment.item_type === 'course';
    if (isCourse && !course) return;
    if (!isCourse && !activity) return;

    const section = isCourse ? assignments.filter((a) => a.academic_year === selectedAcademicYear && a.course_id === course?.id).length + 1 : null;
    setAssignments((prev) => [
      ...prev,
      {
        id: makeId(),
        faculty_id: newAssignment.faculty_id,
        scenario_id: 'sc-base',
        academic_year: selectedAcademicYear,
        quarter: newAssignment.quarter,
        item_type: newAssignment.item_type,
        course_id: isCourse ? course!.id : null,
        activity_id: isCourse ? null : activity!.id,
        workload_units: newAssignment.workload_units,
        workload_units_override: false,
        credit_hours_snapshot: isCourse ? course!.credit_hours : null,
        section,
        label: isCourse ? `${course!.prefix} ${course!.number}\n${course!.title}${section ? ` · Sec ${section}` : ''}` : activity!.title,
        notes: '',
        status: newAssignment.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <div className="flex items-center gap-2">
            <select className="rounded border p-2 text-sm" value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)}>
              {academicYears.map((y) => <option key={y.id} value={y.label}>{y.label}</option>)}
            </select>
            <button onClick={resetToSeed} className="rounded border border-red-300 px-3 py-2 text-sm text-red-700">Reset to Seed Defaults</button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 text-lg font-semibold">Matrix Color Coding</h3>
        <p className="mb-3 text-sm text-slate-600">Customize assignment block colors used on the workload matrix.</p>
        <div className="grid gap-3 md:grid-cols-3">
          {([
            ['course_planned', 'Course · Planned'],
            ['course_confirmed', 'Course · Confirmed'],
            ['activity_planned', 'Activity · Planned'],
            ['activity_confirmed', 'Activity · Confirmed'],
            ['problem', 'Problem']
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-2 rounded border p-2 text-sm">
              <span>{label}</span>
              <input
                type="color"
                value={blockColors[key]}
                onChange={(e) => setBlockColors((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 text-lg font-semibold">Faculty CRUD</h3>
        <div className="mb-3 grid gap-2 md:grid-cols-5">
          <select className="rounded border p-2 text-sm" value={newFaculty.prefix} onChange={(e) => setNewFaculty((p) => ({ ...p, prefix: e.target.value }))}>
            {['Dr.', 'Ms.', 'Mrs.', 'Mr.', 'Prof.'].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input className="rounded border p-2 text-sm" placeholder="Name" value={newFaculty.name} onChange={(e) => setNewFaculty((p) => ({ ...p, name: e.target.value }))} />
          <select className="rounded border p-2 text-sm" value={newFaculty.program} onChange={(e) => setNewFaculty((p) => ({ ...p, program: e.target.value as Program }))}>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="ICET">ICET</option>
            <option value="Other">Other</option>
          </select>
          <input className="rounded border p-2 text-sm" placeholder="Role" value={newFaculty.rank_or_role} onChange={(e) => setNewFaculty((p) => ({ ...p, rank_or_role: e.target.value }))} />
          <button onClick={createFaculty} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Add Faculty (30/10/10/10/0)</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className="border p-2 text-left">Name</th><th className="border p-2">Annual</th><th className="border p-2">Fall</th><th className="border p-2">Winter</th><th className="border p-2">Spring</th><th className="border p-2">Summer</th><th className="border p-2">Delete</th></tr></thead>
            <tbody>
              {faculty.map((f) => (
                <tr key={f.id}>
                  <td className="border p-2">
                    <div className="flex gap-1">
                      <select className="rounded border p-1 text-xs" value={f.prefix ?? 'Dr.'} onChange={(e) => setFaculty((prev) => prev.map((row) => row.id === f.id ? { ...row, prefix: e.target.value } : row))}>
                        {['Dr.', 'Ms.', 'Mrs.', 'Mr.', 'Prof.'].map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input className="w-full rounded border p-1 text-xs" value={f.name} onChange={(e) => setFaculty((prev) => prev.map((row) => row.id === f.id ? { ...row, name: e.target.value } : row))} />
                    </div>
                  </td>
                  {(['annual_workload_target', 'fall_target', 'winter_target', 'spring_target', 'summer_target'] as const).map((field) => (
                    <td key={field} className="border p-2"><input type="number" className="w-20 rounded border p-1" value={f[field]} onChange={(e) => setFaculty((prev) => prev.map((row) => row.id === f.id ? { ...row, [field]: Number(e.target.value) } : row))} /></td>
                  ))}
                  <td className="border p-2 text-center"><button className="text-red-600" onClick={() => { setFaculty((prev) => prev.filter((x) => x.id !== f.id)); setAssignments((prev) => prev.filter((a) => a.faculty_id !== f.id)); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 text-lg font-semibold">Course CRUD</h3>
        <div className="mb-3 grid gap-2 md:grid-cols-6">
          <input className="rounded border p-2 text-sm" placeholder="Prefix" value={newCourse.prefix} onChange={(e) => setNewCourse((p) => ({ ...p, prefix: e.target.value }))} />
          <input className="rounded border p-2 text-sm" placeholder="Number" value={newCourse.number} onChange={(e) => setNewCourse((p) => ({ ...p, number: e.target.value }))} />
          <input className="rounded border p-2 text-sm" placeholder="Title" value={newCourse.title} onChange={(e) => setNewCourse((p) => ({ ...p, title: e.target.value }))} />
          <input type="number" className="rounded border p-2 text-sm" placeholder="WU" value={newCourse.default_workload_units} onChange={(e) => setNewCourse((p) => ({ ...p, default_workload_units: Number(e.target.value) }))} />
          <input type="number" min={1} className="rounded border p-2 text-sm" placeholder="Sections" value={newCourse.annual_sections_required} onChange={(e) => setNewCourse((p) => ({ ...p, annual_sections_required: Number(e.target.value) }))} />
          <button onClick={createCourse} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Add Course</button>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {courses.map((c) => (
            <div key={c.id} className="rounded border p-2 text-sm">
              <div className="flex gap-1">
                <input className="w-16 rounded border p-1 text-xs" value={c.prefix} onChange={(e) => setCourses((prev) => prev.map((row) => row.id === c.id ? { ...row, prefix: e.target.value } : row))} />
                <input className="w-16 rounded border p-1 text-xs" value={c.number} onChange={(e) => setCourses((prev) => prev.map((row) => row.id === c.id ? { ...row, number: e.target.value } : row))} />
                <input className="w-full rounded border p-1 text-xs" value={c.title} onChange={(e) => setCourses((prev) => prev.map((row) => row.id === c.id ? { ...row, title: e.target.value } : row))} />
              </div>
              <div className="mt-2 flex items-center gap-3">
                <label className="text-xs">Default WU<input type="number" className="ml-2 w-16 rounded border p-1" value={c.default_workload_units} onChange={(e) => {
                  const nextWu = Number(e.target.value);
                  setCourses((prev) => prev.map((row) => row.id === c.id ? { ...row, default_workload_units: nextWu } : row));
                  setAssignments((prev) => prev.map((a) => (a.item_type === 'course' && a.course_id === c.id && !a.workload_units_override ? { ...a, workload_units: nextWu } : a)));
                }} /></label>
                <label className="text-xs">Req Sections<input type="number" min={1} className="ml-2 w-16 rounded border p-1" value={c.annual_sections_required ?? 1} onChange={(e) => setCourses((prev) => prev.map((row) => row.id === c.id ? { ...row, annual_sections_required: Number(e.target.value) } : row))} /></label>
                <button className="text-red-600 text-xs" onClick={() => { setCourses((prev) => prev.filter((x) => x.id !== c.id)); setAssignments((prev) => prev.filter((a) => a.course_id !== c.id)); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 text-lg font-semibold">Assignment CRUD</h3>
        <div className="mb-3 grid gap-2 md:grid-cols-7">
          <select className="rounded border p-2 text-sm" value={newAssignment.faculty_id} onChange={(e) => setNewAssignment((p) => ({ ...p, faculty_id: e.target.value }))}>{faculty.map((f) => <option key={f.id} value={f.id}>{`${f.prefix ?? ''} ${f.name}`.trim()}</option>)}</select>
          <select className="rounded border p-2 text-sm" value={newAssignment.quarter} onChange={(e) => setNewAssignment((p) => ({ ...p, quarter: e.target.value as Quarter }))}>{quarterOptions.map((q) => <option key={q}>{q}</option>)}</select>
          <select className="rounded border p-2 text-sm" value={newAssignment.item_type} onChange={(e) => setNewAssignment((p) => ({ ...p, item_type: e.target.value as 'course' | 'activity' }))}><option value="course">course</option><option value="activity">activity</option></select>
          {newAssignment.item_type === 'course' ? (
            <select className="rounded border p-2 text-sm" value={newAssignment.course_id} onChange={(e) => setNewAssignment((p) => ({ ...p, course_id: e.target.value }))}>{courses.map((c) => <option key={c.id} value={c.id}>{c.prefix} {c.number}</option>)}</select>
          ) : (
            <select className="rounded border p-2 text-sm" value={newAssignment.activity_id} onChange={(e) => setNewAssignment((p) => ({ ...p, activity_id: e.target.value }))}>{activities.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}</select>
          )}
          <input type="number" className="rounded border p-2 text-sm" value={newAssignment.workload_units} onChange={(e) => setNewAssignment((p) => ({ ...p, workload_units: Number(e.target.value) }))} />
          <select className="rounded border p-2 text-sm" value={newAssignment.status} onChange={(e) => setNewAssignment((p) => ({ ...p, status: e.target.value as WorkloadAssignment['status'] }))}><option value="planned">planned</option><option value="confirmed">confirmed</option><option value="problem">problem</option></select>
          <button onClick={createAssignment} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Add Assignment</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className="border p-2 text-left">Label</th><th className="border p-2">Faculty</th><th className="border p-2">Quarter</th><th className="border p-2">WU</th><th className="border p-2">Status</th><th className="border p-2">Delete</th></tr></thead>
            <tbody>
              {assignments.filter((a) => a.academic_year === selectedAcademicYear).map((a) => (
                <tr key={a.id}>
                  <td className="border p-2">{a.label}</td>
                  <td className="border p-2"><select className="rounded border p-1" value={a.faculty_id} onChange={(e) => setAssignments((prev) => prev.map((row) => row.id === a.id ? { ...row, faculty_id: e.target.value } : row))}>{faculty.map((f) => <option key={f.id} value={f.id}>{`${f.prefix ?? ''} ${f.name}`.trim()}</option>)}</select></td>
                  <td className="border p-2"><select className="rounded border p-1" value={a.quarter} onChange={(e) => setAssignments((prev) => prev.map((row) => row.id === a.id ? { ...row, quarter: e.target.value as Quarter } : row))}>{quarterOptions.map((q) => <option key={q}>{q}</option>)}</select></td>
                  <td className="border p-2"><input type="number" className="w-20 rounded border p-1" value={a.workload_units} onChange={(e) => setAssignments((prev) => prev.map((row) => row.id === a.id ? { ...row, workload_units: Number(e.target.value), workload_units_override: true } : row))} /></td>
                  <td className="border p-2"><select className="rounded border p-1" value={a.status} onChange={(e) => setAssignments((prev) => prev.map((row) => row.id === a.id ? { ...row, status: e.target.value as WorkloadAssignment['status'] } : row))}><option value="planned">planned</option><option value="confirmed">confirmed</option><option value="problem">problem</option></select></td>
                  <td className="border p-2 text-center"><button className="text-red-600" onClick={() => setAssignments((prev) => prev.filter((row) => row.id !== a.id))}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 text-lg font-semibold">Activities</h3>
        <div className="mb-3 grid gap-2 md:grid-cols-4">
          <input className="rounded border p-2 text-sm" placeholder="Activity title" value={newActivity.title} onChange={(e) => setNewActivity((p) => ({ ...p, title: e.target.value }))} />
          <select className="rounded border p-2 text-sm" value={newActivity.category} onChange={(e) => setNewActivity((p) => ({ ...p, category: e.target.value as typeof newActivity.category }))}>
            {['teaching', 'research', 'advising', 'program chair', 'service', 'administration', 'lab management', 'release time', 'other'].map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <input type="number" className="rounded border p-2 text-sm" value={newActivity.default_workload_units} onChange={(e) => setNewActivity((p) => ({ ...p, default_workload_units: Number(e.target.value) }))} />
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => { if (!newActivity.title.trim()) return; setActivities((prev) => [...prev, { id: makeId(), notes: '', active: true, ...newActivity }]); setNewActivity((prev) => ({ ...prev, title: '' })); }}>Add Activity</button>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {activities.map((a) => (
            <div key={a.id} className="rounded border p-2 text-sm">
              <input className="w-full rounded border p-1 font-medium" value={a.title} onChange={(e) => setActivities((prev) => prev.map((row) => row.id === a.id ? { ...row, title: e.target.value } : row))} />
              <label className="text-xs">Default WU
                <input
                  type="number"
                  className="ml-2 w-16 rounded border p-1"
                  value={a.default_workload_units}
                  onChange={(e) => {
                    const nextWu = Number(e.target.value);
                    setActivities((prev) => prev.map((row) => row.id === a.id ? { ...row, default_workload_units: nextWu } : row));
                    setAssignments((prev) => prev.map((assignment) => (assignment.item_type === 'activity' && assignment.activity_id === a.id && !assignment.workload_units_override ? { ...assignment, workload_units: nextWu } : assignment)));
                  }}
                />
              </label>
              <button className="mt-2 text-xs text-red-700" onClick={() => { setActivities((prev) => prev.filter((row) => row.id !== a.id)); setAssignments((prev) => prev.filter((assignment) => assignment.activity_id !== a.id)); }}>Delete Activity</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
