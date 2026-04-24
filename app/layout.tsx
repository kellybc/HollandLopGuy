import './globals.css';
import type { Metadata } from 'next';
import { NavBar } from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Faculty Load Matrix',
  description: 'Academic-year faculty workload and course scheduling board'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-30 shadow-sm">
          <div className="bg-slate-900 px-6 py-4 text-white">
            <h1 className="text-xl font-semibold">Faculty Load Matrix</h1>
          </div>
          <NavBar />
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
