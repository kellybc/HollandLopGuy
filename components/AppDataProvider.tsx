'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { AcademicYear, Activity, BlockColorConfig, Course, Faculty, FacultyCourseQualification, Scenario, WorkloadAssignment } from '@/lib/types';
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
  blockColors: BlockColorConfig;
  setBlockColors: Dispatch<SetStateAction<BlockColorConfig>>;
  forceSync: () => Promise<boolean>;
  checkRemoteState: () => Promise<boolean>;
  resetToSeed: () => void;
};

const LEGACY_STATE_ID = 'global';
const AppDataContext = createContext<AppDataState | null>(null);

const defaultBlockColors: BlockColorConfig = {
  course_planned: '#e0e7ff',
  course_confirmed: '#dbeafe',
  activity_planned: '#ccfbf1',
  activity_confirmed: '#d1fae5',
  problem: '#fee2e2'
};

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function upsertWithCompatibility(table: string, rows: Record<string, unknown>[]) {
  if (!supabase) return { error: { message: 'Supabase client is not configured.' } };
  const primaryAttempt = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (!primaryAttempt.error) return primaryAttempt;

  if (table === 'courses' && primaryAttempt.error.message.includes('annual_sections_required')) {
    const compatibleRows = rows.map(({ annual_sections_required: _ignored, ...rest }) => rest);
    return supabase.from(table).upsert(compatibleRows, { onConflict: 'id' });
  }

  if (table === 'faculty' && primaryAttempt.error.message.includes('prefix')) {
    const compatibleRows = rows.map(({ prefix: _ignored, ...rest }) => rest);
    return supabase.from(table).upsert(compatibleRows, { onConflict: 'id' });
  }

  if (table === 'workload_assignments' && primaryAttempt.error.message.includes('section')) {
    const compatibleRows = rows.map(({ section: _ignored, ...rest }) => rest);
    return supabase.from(table).upsert(compatibleRows, { onConflict: 'id' });
  }

  return primaryAttempt;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [qualifications, setQualifications] = useState<FacultyCourseQualification[]>([]);
  const [assignments, setAssignments] = useState<WorkloadAssignment[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<'disabled' | 'loading' | 'saving' | 'saved' | 'error'>(isSupabaseConfigured ? 'loading' : 'disabled');
  const [syncMessage, setSyncMessage] = useState(isSupabaseConfigured ? 'Connecting to Supabase…' : 'Supabase not configured; remote-only mode requires Supabase.');
  const [remoteUpdatedAt, setRemoteUpdatedAt] = useState<string | null>(null);
  const [blockColors, setBlockColors] = useState<BlockColorConfig>(defaultBlockColors);

  const writeLegacyPlannerState = useCallback(async () => {
    if (!(isSupabaseConfigured && supabase)) return false;
    const { data, error } = await supabase
      .from('planner_state')
      .upsert({
        id: LEGACY_STATE_ID,
        payload: { faculty, courses, activities, assignments, selectedAcademicYear },
        updated_at: new Date().toISOString()
      })
      .select('updated_at')
      .single();
    if (error) return false;
    setRemoteUpdatedAt(data?.updated_at ?? null);
    return true;
  }, [faculty, courses, activities, assignments, selectedAcademicYear]);

  const writeToSupabase = useCallback(async () => {
    if (!(isSupabaseConfigured && supabase)) return false;
    const nowIso = new Date().toISOString();
    const resolvedScenarios = scenarios.length > 0
      ? scenarios
      : academicYears.length > 0
        ? [{
            id: 'sc-default',
            academic_year_id: academicYears[0].id,
            name: 'Base Plan',
            description: 'Auto-created default scenario',
            is_active: true
          }]
        : [];
    const facultyIds = new Set(faculty.map((row) => row.id));
    const courseIds = new Set(courses.map((row) => row.id));
    const activityIds = new Set(activities.map((row) => row.id));
    const scenarioIds = new Set(resolvedScenarios.map((row) => row.id));
    const defaultScenarioId = resolvedScenarios[0]?.id ?? null;
    const safeQualifications = qualifications.filter((row) => facultyIds.has(row.faculty_id) && courseIds.has(row.course_id));
    const safeAssignments = assignments.flatMap((row) => {
      const hasFaculty = facultyIds.has(row.faculty_id);
      const hasItem = row.item_type === 'course'
        ? Boolean(row.course_id && courseIds.has(row.course_id))
        : Boolean(row.activity_id && activityIds.has(row.activity_id));
      const scenario_id = scenarioIds.has(row.scenario_id) ? row.scenario_id : defaultScenarioId;
      if (!hasFaculty || !hasItem || !scenario_id) return [];
      return [{ ...row, scenario_id }];
    });
    const payloads = {
      academic_years: academicYears.map((row) => ({ ...row, active: row.label === selectedAcademicYear })),
      scenarios: resolvedScenarios,
      faculty: faculty.map((row) => ({ ...row, prefix: row.prefix ?? 'Dr.' })),
      courses,
      activities,
      faculty_course_qualifications: safeQualifications,
      workload_assignments: safeAssignments.map((row) => ({ ...row, updated_at: nowIso }))
    } as const;

    const tables = Object.entries(payloads) as Array<[keyof typeof payloads, Record<string, unknown>[]]>;
    for (const [table, rows] of tables) {
      const { error: upsertError } = await upsertWithCompatibility(table, rows);
      if (upsertError) {
        if (upsertError.message.includes('invalid input syntax for type uuid')) {
          const legacyOk = await writeLegacyPlannerState();
          if (legacyOk) {
            setSyncState('saved');
            setSyncMessage('Legacy planner_state sync saved. Run migration 004_relational_sync.sql to enable full relational sync.');
            return true;
          }
        }
        setSyncState('error');
        setSyncMessage(`Supabase write failed (${table}): ${upsertError.message}`);
        return false;
      }
    }

    setRemoteUpdatedAt(nowIso);
    setSyncState('saved');
    setSyncMessage('Supabase relational sync saved (all tables).');
    return true;
  }, [academicYears, scenarios, faculty, courses, activities, qualifications, assignments, selectedAcademicYear, writeLegacyPlannerState]);

  useEffect(() => {
    const load = async () => {
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
          const legacy = await supabase.from('planner_state').select('payload, updated_at').eq('id', LEGACY_STATE_ID).maybeSingle();
          if (legacy.error) {
            setSyncState('error');
            setSyncMessage(`Supabase read failed: ${firstError.message}`);
          } else {
            const payload = legacy.data?.payload as Partial<AppDataState> | undefined;
            if (payload?.faculty) setFaculty(payload.faculty);
            if (payload?.courses) setCourses(payload.courses);
            if (payload?.activities) setActivities(payload.activities);
            if (payload?.assignments) setAssignments(payload.assignments);
            if (payload?.selectedAcademicYear) setSelectedAcademicYear(payload.selectedAcademicYear);
            setRemoteUpdatedAt(legacy.data?.updated_at ?? null);
            setSyncState('saved');
            setSyncMessage('Loaded legacy planner_state sync. Run migration 004_relational_sync.sql for relational mode.');
          }
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
          } else {
            setAcademicYears([]);
            setSelectedAcademicYear('');
          }
          setScenarios(remoteScenarios);
          setFaculty(remoteFaculty);
          setCourses(remoteCourses);
          setActivities(remoteActivities);
          setQualifications(remoteQualifications);
          setAssignments(remoteAssignments);
          const updatedAt = remoteAssignments
            .map((row) => row.updated_at)
            .filter(Boolean)
            .sort()
            .at(-1);
          setRemoteUpdatedAt(updatedAt ?? null);
          setSyncMessage('Supabase relational sync connected.');
          setSyncState('saved');
        }
      }
      setHydrated(true);
    };
    void load();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!(isSupabaseConfigured && supabase)) return;
    setSyncState('saving');
    setSyncMessage('Writing planner tables to Supabase…');
    void (async () => {
      await writeToSupabase();
    })();
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
    setSyncMessage('Reset to seed is disabled in Supabase-only production mode.');
  };

  const value = useMemo(
    () => ({ faculty, courses, activities, scenarios, academicYears, selectedAcademicYear, qualifications, assignments, setFaculty, setCourses, setActivities, setAssignments, setSelectedAcademicYear, syncState, syncMessage, remoteUpdatedAt, blockColors, setBlockColors, forceSync, checkRemoteState, resetToSeed }),
    [faculty, courses, activities, scenarios, academicYears, selectedAcademicYear, qualifications, assignments, syncState, syncMessage, remoteUpdatedAt, blockColors, forceSync, checkRemoteState]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
