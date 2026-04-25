'use client';

import { useState } from 'react';
import { importCoursesCsv, importFacultyCsv } from '@/lib/csv';
import { useAppData } from '@/components/AppDataProvider';

export default function SettingsPage() {
  const [facultyRows, setFacultyRows] = useState(0);
  const [courseRows, setCourseRows] = useState(0);
  const [message, setMessage] = useState('');
  const role = process.env.NEXT_PUBLIC_APP_ROLE ?? 'admin';
  const { setFaculty, setCourses, syncState, syncMessage } = useAppData();

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
        <p className={`mt-2 rounded p-2 text-sm ${syncState === 'error' ? 'bg-red-100 text-red-800' : syncState === 'saved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
          Sync status: <strong>{syncState}</strong> — {syncMessage}
        </p>
        {(syncState === 'disabled' || syncState === 'error') ? (
          <div className="mt-3 rounded border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold">Supabase not connected? Do this:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Create a Supabase project and copy Project URL + anon key.</li>
              <li>Add these values to <code className="rounded bg-slate-200 px-1 py-0.5">.env.local</code> and restart the dev server.</li>
              <li>Run migrations in order: <code className="rounded bg-slate-200 px-1 py-0.5">001_init.sql</code>, <code className="rounded bg-slate-200 px-1 py-0.5">002_planner_state.sql</code>, <code className="rounded bg-slate-200 px-1 py-0.5">003_planner_state_anon.sql</code>.</li>
            </ol>
            <code className="mt-2 block whitespace-pre-wrap rounded bg-slate-100 p-2 text-xs">
              NEXT_PUBLIC_SUPABASE_URL=your-project-url{'\n'}
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key{'\n'}
              NEXT_PUBLIC_APP_ROLE=admin
            </code>
          </div>
        ) : null}
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

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">CSV Format Reference</h2>
        <p className="mb-2 text-sm text-slate-600">Use the following headers in row 1 (comma-separated):</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-semibold">Faculty CSV headers</p>
            <code className="block overflow-x-auto whitespace-pre-wrap break-all rounded bg-slate-100 p-2 text-xs">prefix,name,program,rank_or_role,annual_workload_target,fall_target,winter_target,spring_target,summer_target,notes</code>
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold">Courses CSV headers</p>
            <code className="block overflow-x-auto whitespace-pre-wrap break-all rounded bg-slate-100 p-2 text-xs">prefix,number,title,program,credit_hours,default_workload_units,annual_sections_required,is_required,normally_offered_fall,normally_offered_winter,normally_offered_spring,normally_offered_summer,notes</code>
          </div>
        </div>
      </section>
    </div>
  );
}
