'use client';

import { useState } from 'react';
import { importCoursesCsv, importFacultyCsv } from '@/lib/csv';

export default function SettingsPage() {
  const [facultyRows, setFacultyRows] = useState(0);
  const [courseRows, setCourseRows] = useState(0);
  const role = process.env.NEXT_PUBLIC_APP_ROLE ?? 'admin';

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Authentication + Access</h2>
        <p className="text-sm text-slate-700">Current client role: <strong>{role}</strong> (admin can edit; viewer is read-only).</p>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">CSV Import</h2>
        <label className="mb-3 block text-sm">
          Import Faculty CSV
          <input type="file" accept=".csv" className="mt-1 block" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const rows = importFacultyCsv(await file.text());
            setFacultyRows(rows.length);
          }} />
        </label>
        <label className="block text-sm">
          Import Courses CSV
          <input type="file" accept=".csv" className="mt-1 block" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const rows = importCoursesCsv(await file.text());
            setCourseRows(rows.length);
          }} />
        </label>
        <p className="mt-3 text-sm text-slate-600">Preview imported rows — Faculty: {facultyRows}, Courses: {courseRows}</p>
      </section>
    </div>
  );
}
