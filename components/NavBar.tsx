'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { ThemeToggle } from './ThemeToggle';

const links = [
  ['/', 'Workload Matrix'],
  ['/course-coverage', 'Course Coverage'],
  ['/faculty', 'Faculty'],
  ['/courses', 'Courses'],
  ['/activities', 'Activities'],
  ['/scenarios', 'Scenarios'],
  ['/admin', 'Admin'],
  ['/settings', 'Settings']
] as const;

export function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="border-b bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-2">
      <ul className="flex flex-wrap gap-2">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link
              href={href}
              className={clsx(
                'rounded-md px-3 py-2 text-sm font-medium',
                pathname === href ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <ThemeToggle />
      </div>
    </nav>
  );
}
