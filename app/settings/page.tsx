'use client';

import { useState } from 'react';
import { importCoursesCsv, importFacultyCsv } from '@/lib/csv';
import { useAppData } from '@/components/AppDataProvider';

export default function SettingsPage() {
  const [facultyRows, setFacultyRows] = useState(0);
  const [courseRows, setCourseRows] = useState(0);
  const [message, setMessage] = useState('');
  const role = process.env.NEXT_PUBLIC_APP_ROLE ?? 'admin';
  const { setFaculty, setCourses } = useAppData();

  const parseAndApply = async (file: File, type: 'faculty' | 'courses') => {
    if (!file) return;
    const ext = file.name.toLowerCase();
    if (ext.endsWith('.xlsx') || ext.endsWith('.xls')) {
      setMessage('Excel files are detected. Please save/export as CSV for import (feature-ready parser for native .xlsx coming next).');
      return;
    }

    const text = await file.text();
    if (type === 'faculty') {
      const rows = importFacultyCsv(text);
      setFaculty(rows);
      setFacultyRows(rows.length);
      setMessage(`Imported ${rows.length} faculty rows.`);
    } else {
      const rows = importCoursesCsv(text);
      setCourses(rows);
      setCourseRows(rows.length);
      setMessage(`Imported ${rows.length} course rows.`);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Authentication + Access</h2>
        <p className="text-sm text-slate-700">Current client role: <strong>{role}</strong> (admin can edit; viewer is read-only).</p>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Import Faculty / Courses</h2>
        <p className="mb-3 text-sm text-slate-600">Upload CSV files directly. You can upload Excel files (.xlsx/.xls), but please export them to CSV first for parsing.</p>
        <label className="mb-3 block text-sm">
          Import Faculty (.csv, .xlsx, .xls)
          <input type="file" accept=".csv,.xlsx,.xls" className="mt-1 block" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            await parseAndApply(file, 'faculty');
          }} />
        </label>
        <label className="block text-sm">
          Import Courses (.csv, .xlsx, .xls)
          <input type="file" accept=".csv,.xlsx,.xls" className="mt-1 block" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            await parseAndApply(file, 'courses');
          }} />
        </label>
        <p className="mt-3 text-sm text-slate-600">Imported rows — Faculty: {facultyRows}, Courses: {courseRows}</p>
        {message ? <p className="mt-2 rounded bg-indigo-50 p-2 text-sm text-indigo-900">{message}</p> : null}
      </section>
    </div>
  );
}
