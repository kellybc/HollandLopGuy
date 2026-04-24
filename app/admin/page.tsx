'use client';

import { useAppData } from '@/components/AppDataProvider';

export default function AdminPage() {
  const { faculty, courses, activities, setFaculty, setCourses, setActivities, setAssignments, resetToSeed } = useAppData();
  const role = process.env.NEXT_PUBLIC_APP_ROLE ?? 'admin';

  if (role !== 'admin') {
    return <div className="rounded-lg border bg-white p-4">Viewer mode: admin panel is read-only.</div>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin Panel: Faculty Targets</h2>
          <button onClick={resetToSeed} className="rounded border border-red-300 px-3 py-2 text-sm text-red-700">Reset to Seed Defaults</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left">Faculty</th>
                <th className="border p-2">Annual</th>
                <th className="border p-2">Fall</th>
                <th className="border p-2">Winter</th>
                <th className="border p-2">Spring</th>
                <th className="border p-2">Summer</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((f) => (
                <tr key={f.id}>
                  <td className="border p-2">{f.name}</td>
                  {(['annual_workload_target', 'fall_target', 'winter_target', 'spring_target', 'summer_target'] as const).map((field) => (
                    <td key={field} className="border p-2">
                      <input
                        type="number"
                        className="w-24 rounded border p-1"
                        value={f[field]}
                        onChange={(e) =>
                          setFaculty((prev) =>
                            prev.map((row) =>
                              row.id === f.id ? { ...row, [field]: Number(e.target.value) } : row
                            )
                          )
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 text-lg font-semibold">Courses</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {courses.map((c) => (
            <div key={c.id} className="rounded border p-2 text-sm">
              <p className="font-medium">{c.prefix} {c.number} {c.title}</p>
              <div className="mt-2 flex items-center gap-3">
                <label className="text-xs">Default WU
                  <input
                    type="number"
                    className="ml-2 w-16 rounded border p-1"
                    value={c.default_workload_units}
                    onChange={(e) => {
                      const nextWu = Number(e.target.value);
                      setCourses((prev) => prev.map((row) => row.id === c.id ? { ...row, default_workload_units: nextWu } : row));
                      setAssignments((prev) => prev.map((a) => (a.item_type === 'course' && a.course_id === c.id && !a.workload_units_override ? { ...a, workload_units: nextWu } : a)));
                    }}
                  />
                </label>
                <label className="text-xs">Required Sections
                  <input type="number" min={1} className="ml-2 w-16 rounded border p-1" value={c.annual_sections_required ?? 1} onChange={(e) => setCourses((prev) => prev.map((row) => row.id === c.id ? { ...row, annual_sections_required: Number(e.target.value) } : row))} />
                </label>
                <label className="text-xs">
                  <input type="checkbox" checked={c.is_required} onChange={(e) => setCourses((prev) => prev.map((row) => row.id === c.id ? { ...row, is_required: e.target.checked } : row))} /> Required
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 text-lg font-semibold">Activities</h3>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {activities.map((a) => (
            <div key={a.id} className="rounded border p-2 text-sm">
              <p className="font-medium">{a.title}</p>
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
