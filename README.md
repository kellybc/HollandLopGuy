# Faculty Load Matrix

Faculty Load Matrix is a highly visual workload board for planning an academic year on a quarter system (Fall, Winter, Spring, Summer). Rows are faculty, columns are quarters, and each assignment is a draggable workload block sized by **workload units (WU)**.

## Stack
- Next.js + React + TypeScript
- Tailwind CSS
- Supabase (database + auth)
- Vercel deployment target
- GitHub source control

## Core behavior
- Drag courses and activities from an unassigned sidebar into faculty/quarter cells.
- Required courses can define multiple annual sections; each open section appears as its own draggable card.
- Drag existing blocks between cells.
- Edit block workload units, status, and notes in a modal.
- Visual block sizing rule: **1 WU = 40 px height**.
- Credit hours are shown but do not drive visual size; workload units do.

## Data model implemented
- Faculty
- Courses
- Activities
- Workload Assignments
- Faculty Course Qualifications
- Academic Years
- Scenarios

## Key UI routes
- `/` Workload Matrix
- `/course-coverage` Course Coverage view
- `/faculty` Faculty directory
- `/faculty/[id]` Faculty detail
- `/courses`, `/activities`, `/scenarios`, `/settings` scaffolding routes
- `/admin` Admin panel for editing faculty targets, course WU defaults, and activity WU defaults (stored in browser localStorage)
- `/admin` also edits required section counts per course for multi-section planning

## Validation warnings included
- Required course not assigned
- Faculty annual workload below/above target
- Faculty quarterly workload above target
- Assigned course marked avoid
- Assigned course with no qualification record
- Course assigned outside normal offering quarter
- Activity/course with zero workload units

## CSV import/export
### Export
- Faculty workload summary
- Course coverage summary
- Assignments

### Import (starter utilities)
- Faculty CSV import parser
- Courses CSV import parser

## Supabase setup
1. Create a Supabase project.
2. Add env vars to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_ROLE=admin
   ```
3. Run SQL migration in `supabase/migrations/001_init.sql`.
4. Run `supabase/seed.sql`.
5. Configure JWT/user metadata to include `app_role` (`admin` or `viewer`) for RLS policy checks.

## Local development
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Deployment (Vercel)
1. Push repo to GitHub.
2. Import project in Vercel.
3. Set environment variables in Vercel project settings.
4. Deploy.

## Notes
- The current implementation uses local seed data in `lib/seed-data.ts` for rapid prototyping.
- Replace seed arrays with Supabase queries/mutations for production persistence.
