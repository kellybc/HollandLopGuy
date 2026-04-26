'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { academicYears as seedAcademicYears, activities as seedActivities, courses as seedCourses, faculty as seedFaculty, initialAssignments, qualifications as seedQualifications, scenarios as seedScenarios } from '@/lib/seed-data';
import { AcademicYear, Activity, Course, Faculty, FacultyCourseQualification, Scenario, WorkloadAssignment } from '@/lib/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AppDataState = {
  faculty: Faculty[];
  courses: Course[];
  activities: Activity[];
  scenarios: Scenario[];
  academicYears: AcademicYear[];
  selectedAcademicYear: string;
  qualifications: FacultyCourseQualification[];
  assignments: WorkloadAssignment[];
  setFaculty: Dispatch<SetStateAction<Faculty[]>>;
  setCourses: Dispatch<SetStateAction<Course[]>>;
  setActivities: Dispatch<SetStateAction<Activity[]>>;
  setAssignments: Dispatch<SetStateAction<WorkloadAssignment[]>>;
  setSelectedAcademicYear: Dispatch<SetStateAction<string>>;
  syncState: 'disabled' | 'loading' | 'saving' | 'saved' | 'error';
  syncMessage: string;
  remoteUpdatedAt: string | null;
  forceSync: () => Promise<boolean>;
  checkRemoteState: () => Promise<boolean>;
  resetToSeed: () => void;
};

const STORAGE_KEY = 'flm-admin-data-v1';
const AppDataContext = createContext<AppDataState | null>(null);

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sqlInList(ids: string[]) {
  return `(${ids.map((id) => `'${id.replace(/'/g, "''")}'`).join(',')})`;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [faculty, setFaculty] = useState<Faculty[]>(seedFaculty);
  const [courses, setCourses] = useState<Course[]>(seedCourses);
  const [activities, setActivities] = useState<Activity[]>(seedActivities);
  const [scenarios, setScenarios] = useState<Scenario[]>(seedScenarios);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(seedAcademicYears);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(seedAcademicYears.find((a) => a.active)?.label ?? seedAcademicYears[0].label);
  const [qualifications, setQualifications] = useState<FacultyCourseQualification[]>(seedQualifications);
  const [assignments, setAssignments] = useState<WorkloadAssignment[]>(initialAssignments);
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<'disabled' | 'loading' | 'saving' | 'saved' | 'error'>(isSupabaseConfigured ? 'loading' : 'disabled');
  const [syncMessage, setSyncMessage] = useState(isSupabaseConfigured ? 'Connecting to Supabase…' : 'Supabase not configured; using local browser storage only.');
  const [remoteUpdatedAt, setRemoteUpdatedAt] = useState<string | null>(null);

  const writeToSupabase = useCallback(async () => {
    if (!(isSupabaseConfigured && supabase)) return false;
    const nowIso = new Date().toISOString();
    const payloads = {
      academic_years: academicYears.map((row) => ({ ...row, active: row.label === selectedAcademicYear })),
      scenarios,
      faculty: faculty.map((row) => ({ ...row, prefix: row.prefix ?? 'Dr.' })),
      courses,
      activities,
      faculty_course_qualifications: qualifications,
      workload_assignments: assignments.map((row) => ({ ...row, updated_at: nowIso }))
    } as const;

    const tables = Object.entries(payloads) as Array<[keyof typeof payloads, Record<string, unknown>[]]>;
    for (const [table, rows] of tables) {
      const { error: upsertError } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
      if (upsertError) {
        setSyncState('error');
        setSyncMessage(`Supabase write failed (${table}): ${upsertError.message}`);
        return false;
      }
    }

    for (const [table, rows] of tables) {
      const ids = rows.map((row) => String(row.id));
      const pruneQuery = supabase.from(table).delete();
      const { error: pruneError } = ids.length > 0
        ? await pruneQuery.not('id', 'in', sqlInList(ids))
        : await pruneQuery.not('id', 'is', null);
      if (pruneError) {
        setSyncState('error');
        setSyncMessage(`Supabase prune failed (${table}): ${pruneError.message}`);
        return false;
      }
    }

    setRemoteUpdatedAt(nowIso);
    setSyncState('saved');
    setSyncMessage('Supabase relational sync saved (all tables).');
    return true;
  }, [academicYears, scenarios, faculty, courses, activities, qualifications, assignments, selectedAcademicYear]);

  useEffect(() => {
    const load = async () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<AppDataState>;
          if (parsed.faculty) setFaculty(parsed.faculty);
          if (parsed.courses) setCourses(parsed.courses);
          if (parsed.activities) setActivities(parsed.activities);
          if (parsed.assignments) setAssignments(parsed.assignments);
          if (parsed.selectedAcademicYear) setSelectedAcademicYear(parsed.selectedAcademicYear);
        } catch {
          // no-op
        }
      }

      if (isSupabaseConfigured && supabase) {
        setSyncState('loading');
        setSyncMessage('Reading all planner tables from Supabase…');
        const [
          yearsResult,
          scenariosResult,
          facultyResult,
          coursesResult,
          activitiesResult,
          qualificationsResult,
          assignmentsResult
        ] = await Promise.all([
          supabase.from('academic_years').select('*').order('start_year', { ascending: true }),
          supabase.from('scenarios').select('*'),
          supabase.from('faculty').select('*'),
          supabase.from('courses').select('*'),
          supabase.from('activities').select('*'),
          supabase.from('faculty_course_qualifications').select('*'),
          supabase.from('workload_assignments').select('*')
        ]);

        const firstError = [
          yearsResult.error,
          scenariosResult.error,
          facultyResult.error,
          coursesResult.error,
          activitiesResult.error,
          qualificationsResult.error,
          assignmentsResult.error
        ].find(Boolean);
        if (firstError) {
          setSyncState('error');
          setSyncMessage(`Supabase read failed: ${firstError.message}`);
        } else {
          const remoteYears = (yearsResult.data ?? []) as AcademicYear[];
          const remoteScenarios = (scenariosResult.data ?? []) as Scenario[];
          const remoteFaculty = ((facultyResult.data ?? []) as Faculty[]).map((row) => ({
            ...row,
            prefix: row.prefix ?? 'Dr.',
            annual_workload_target: asNumber(row.annual_workload_target),
            fall_target: asNumber(row.fall_target),
            winter_target: asNumber(row.winter_target),
            spring_target: asNumber(row.spring_target),
            summer_target: asNumber(row.summer_target)
          }));
          const remoteCourses = ((coursesResult.data ?? []) as Course[]).map((row) => ({
            ...row,
            credit_hours: asNumber(row.credit_hours),
            default_workload_units: asNumber(row.default_workload_units),
            annual_sections_required: asNumber(row.annual_sections_required, 1)
          }));
          const remoteActivities = ((activitiesResult.data ?? []) as Activity[]).map((row) => ({
            ...row,
            default_workload_units: asNumber(row.default_workload_units)
          }));
          const remoteQualifications = (qualificationsResult.data ?? []) as FacultyCourseQualification[];
          const remoteAssignments = ((assignmentsResult.data ?? []) as WorkloadAssignment[]).map((row) => ({
            ...row,
            workload_units: asNumber(row.workload_units),
            credit_hours_snapshot: row.credit_hours_snapshot == null ? null : asNumber(row.credit_hours_snapshot)
          }));

          if (remoteYears.length) {
            setAcademicYears(remoteYears);
            const activeYearLabel = remoteYears.find((year) => year.active)?.label ?? remoteYears[0].label;
            setSelectedAcademicYear(activeYearLabel);
          }
          if (remoteScenarios.length) setScenarios(remoteScenarios);
          if (remoteFaculty.length) setFaculty(remoteFaculty);
          if (remoteCourses.length) setCourses(remoteCourses);
          if (remoteActivities.length) setActivities(remoteActivities);
          if (remoteQualifications.length) setQualifications(remoteQualifications);
          if (remoteAssignments.length) {
            setAssignments(remoteAssignments);
            const updatedAt = remoteAssignments
              .map((row) => row.updated_at)
              .filter(Boolean)
              .sort()
              .at(-1);
            setRemoteUpdatedAt(updatedAt ?? null);
          }
          setSyncState('saved');
          setSyncMessage('Supabase relational sync connected.');
        }
      }
      setHydrated(true);
    };
    void load();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ faculty, courses, activities, scenarios, academicYears, qualifications, assignments, selectedAcademicYear })
    );
  }, [faculty, courses, activities, scenarios, academicYears, qualifications, assignments, selectedAcademicYear, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!(isSupabaseConfigured && supabase)) return;
    const handle = setTimeout(() => {
      setSyncState('saving');
      setSyncMessage('Writing planner tables to Supabase…');
      void (async () => {
        await writeToSupabase();
      })();
    }, 500);
    return () => clearTimeout(handle);
  }, [hydrated, writeToSupabase]);

  const forceSync = useCallback(async () => {
    if (!(isSupabaseConfigured && supabase)) {
      setSyncState('disabled');
      setSyncMessage('Supabase not configured; cannot run manual sync.');
      return false;
    }
    setSyncState('saving');
    setSyncMessage('Manual sync in progress…');
    const ok = await writeToSupabase();
    return ok;
  }, [writeToSupabase]);

  const checkRemoteState = useCallback(async () => {
    if (!(isSupabaseConfigured && supabase)) {
      setSyncState('disabled');
      setSyncMessage('Supabase not configured; cannot verify remote state.');
      return false;
    }
    setSyncState('loading');
    setSyncMessage('Checking Supabase row counts across planner tables…');
    const checks = await Promise.all([
      supabase.from('academic_years').select('*', { count: 'exact', head: true }),
      supabase.from('scenarios').select('*', { count: 'exact', head: true }),
      supabase.from('faculty').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('activities').select('*', { count: 'exact', head: true }),
      supabase.from('faculty_course_qualifications').select('*', { count: 'exact', head: true }),
      supabase.from('workload_assignments').select('*', { count: 'exact', head: true })
    ]);
    const error = checks.map((result) => result.error).find(Boolean);
    if (error) {
      setSyncState('error');
      setSyncMessage(`Supabase verify failed: ${error.message}`);
      return false;
    }
    setSyncState('saved');
    const totalRows = checks.reduce((sum, result) => sum + (result.count ?? 0), 0);
    setSyncMessage(`Verified Supabase relational sync (${totalRows} total rows across planner tables).`);
    return true;
  }, []);

  const resetToSeed = () => {
    setFaculty(seedFaculty);
    setCourses(seedCourses);
    setActivities(seedActivities);
    setAssignments(initialAssignments);
    setSelectedAcademicYear(seedAcademicYears.find((a) => a.active)?.label ?? seedAcademicYears[0].label);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ faculty, courses, activities, scenarios, academicYears, selectedAcademicYear, qualifications, assignments, setFaculty, setCourses, setActivities, setAssignments, setSelectedAcademicYear, syncState, syncMessage, remoteUpdatedAt, forceSync, checkRemoteState, resetToSeed }),
    [faculty, courses, activities, scenarios, academicYears, selectedAcademicYear, qualifications, assignments, syncState, syncMessage, remoteUpdatedAt, forceSync, checkRemoteState]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
