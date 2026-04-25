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
- Matrix cells display a \"Drop course/activity here\" hint when empty.
- Unassigned panel scrolls independently from the matrix and shows a floating drag preview while dragging.
- Drag existing blocks between cells.
- Edit block workload units, status, and notes in a modal; block modal also supports deleting assignments directly from matrix screen.
- Dark mode toggle is available in the top navigation.
- Matrix and Admin support switching academic years.
- Matrix has a Compact View toggle to collapse rows for denser scheduling review.
- Overloaded faculty-quarter cells use a pulsing red glow.
- Visual block sizing rule: **1 WU = 40 px height**.
- Credit hours are shown but do not drive visual size; workload units do.
- If Supabase env vars are configured, planner edits sync to `planner_state` so changes persist across devices.

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
- Admin includes CRUD operations for faculty, courses, activities, and assignments.
- New faculty defaults are 30 annual WU with 10/10/10/0 quarter defaults and include a prefix selector.
- Admin updates to default WU now propagate to existing non-overridden assignments.
- Existing faculty/course/activity/assignment rows are editable inline in Admin.

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
- Faculty import (`.csv`; `.xlsx/.xls` accepted but must be exported to CSV before parsing)
- Courses import (`.csv`; `.xlsx/.xls` accepted but must be exported to CSV before parsing)
- Settings page includes required header templates for both CSV formats.

## Supabase setup
1. Create a Supabase project.
2. Add env vars to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_ROLE=admin
   ```
3. Run SQL migrations in order: `001_init.sql`, `002_planner_state.sql`, `003_planner_state_anon.sql`.
4. Run `supabase/seed.sql`.
5. Configure JWT/user metadata to include `app_role` (`admin` or `viewer`) for RLS policy checks.

### Troubleshooting: "Supabase not connected"
- In Settings, if sync status is `disabled`, your browser app likely cannot read required env vars.
- Verify `.env.local` exists at the project root and includes:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_APP_ROLE=admin` (or `viewer`)
- Restart `npm run dev` after editing `.env.local`.
- Confirm migration `003_planner_state_anon.sql` is applied if you are using anon access in prototype mode.

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
