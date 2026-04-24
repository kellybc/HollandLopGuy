'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  ['/', 'Workload Matrix'],
  ['/course-coverage', 'Course Coverage'],
  ['/faculty', 'Faculty'],
  ['/courses', 'Courses'],
  ['/activities', 'Activities'],
  ['/scenarios', 'Scenarios'],
  ['/settings', 'Settings']
] as const;

export function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="border-b bg-white px-6 py-3">
      <ul className="flex flex-wrap gap-2">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link
              href={href}
              className={clsx(
                'rounded-md px-3 py-2 text-sm font-medium',
                pathname === href ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
