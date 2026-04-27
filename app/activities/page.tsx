'use client';

import { useAppData } from '@/components/AppDataProvider';

export default function ActivitiesPage() {
  const { activities } = useAppData();
  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Activities</h2>
      <ul className="space-y-2">
        {activities.map((activity) => (
          <li key={activity.id} className="rounded border p-2 text-sm">
            <p className="font-medium">{activity.title}</p>
            <p>{activity.category} · {activity.default_workload_units} WU</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
