'use client';

import { useAppData } from '@/components/AppDataProvider';

export default function ScenariosPage() {
  const { scenarios } = useAppData();
  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Scenario Planning</h2>
      <ul className="space-y-2">
        {scenarios.map((s) => (
          <li key={s.id} className="rounded border p-3">
            <p className="font-medium">{s.name} {s.is_active ? <span className="ml-2 rounded bg-green-100 px-2 py-1 text-xs text-green-800">Active</span> : null}</p>
            <p className="text-sm text-slate-600">{s.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
