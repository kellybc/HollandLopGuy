'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('flm-theme-dark') === 'true';
    setDark(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('flm-theme-dark', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <button type="button" onClick={toggle} className="rounded border px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700">
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
