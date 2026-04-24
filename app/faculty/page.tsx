import Link from 'next/link';
import { faculty, initialAssignments } from '@/lib/seed-data';
import { annualTotal } from '@/lib/workload';

export default function FacultyPage() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {faculty.map((f) => (
        <Link href={`/faculty/${f.id}`} key={f.id} className="rounded-lg border bg-white p-4 shadow-sm hover:bg-slate-50">
          <h2 className="font-semibold">{f.name}</h2>
          <p className="text-sm text-slate-600">{f.rank_or_role}</p>
          <p className="mt-2 text-sm">Annual: {annualTotal(initialAssignments, f.id)} / {f.annual_workload_target} WU</p>
        </Link>
      ))}
    </div>
  );
}
