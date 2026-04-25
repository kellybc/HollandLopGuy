'use client';

import { useParams } from 'next/navigation';
import { useAppData } from '@/components/AppDataProvider';
import { quarters } from '@/lib/seed-data';
import { annualTotal, quarterTotal } from '@/lib/workload';

export default function FacultyDetail() {
  const params = useParams<{ id: string }>();
  const { faculty, assignments, qualifications, selectedAcademicYear } = useAppData();
  const id = params.id;

  const person = faculty.find((f) => f.id === id);
  if (!person) return <div>Faculty not found.</div>;

  const yearAssignments = assignments.filter((a) => a.academic_year === selectedAcademicYear);
  const personAssignments = yearAssignments.filter((a) => a.faculty_id === id);
  const quals = qualifications.filter((q) => q.faculty_id === id);

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">{`${person.prefix ?? ''} ${person.name}`.trim()}</h2>
        <p className="text-sm text-slate-600">{person.rank_or_role} · {person.program}</p>
        <p className="mt-2 text-sm">Annual workload: {annualTotal(yearAssignments, id)} / {person.annual_workload_target} WU</p>
      </section>
      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 font-semibold">Quarterly Summary</h3>
        <ul className="grid gap-2 md:grid-cols-4">
          {quarters.map((q) => <li key={q} className="rounded border p-2 text-sm">{q}: {quarterTotal(yearAssignments, id, q)} WU</li>)}
        </ul>
      </section>
      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 font-semibold">Assignments</h3>
        <ul className="list-disc pl-6 text-sm">{personAssignments.map((a) => <li key={a.id}>{a.quarter} · {a.label} · {a.workload_units} WU</li>)}</ul>
      </section>
      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 font-semibold">Qualifications</h3>
        <ul className="list-disc pl-6 text-sm">{quals.map((q) => <li key={q.id}>{q.course_id}: {q.qualification_level}</li>)}</ul>
      </section>
    </div>
  );
}
