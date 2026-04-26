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
const REMOTE_STATE_ID = 'global';

const AppDataContext = createContext<AppDataState | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [faculty, setFaculty] = useState<Faculty[]>(seedFaculty);
  const [courses, setCourses] = useState<Course[]>(seedCourses);
  const [activities, setActivities] = useState<Activity[]>(seedActivities);
  const [scenarios] = useState<Scenario[]>(seedScenarios);
  const [academicYears] = useState<AcademicYear[]>(seedAcademicYears);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(seedAcademicYears.find((a) => a.active)?.label ?? seedAcademicYears[0].label);
  const [qualifications] = useState<FacultyCourseQualification[]>(seedQualifications);
  const [assignments, setAssignments] = useState<WorkloadAssignment[]>(initialAssignments);
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<'disabled' | 'loading' | 'saving' | 'saved' | 'error'>(isSupabaseConfigured ? 'loading' : 'disabled');
  const [syncMessage, setSyncMessage] = useState(isSupabaseConfigured ? 'Connecting to Supabase…' : 'Supabase not configured; using local browser storage only.');
  const [remoteUpdatedAt, setRemoteUpdatedAt] = useState<string | null>(null);

  const writeToSupabase = useCallback(async () => {
    if (!(isSupabaseConfigured && supabase)) return false;
    const { data, error } = await supabase
      .from('planner_state')
      .upsert({
        id: REMOTE_STATE_ID,
        payload: { faculty, courses, activities, assignments, selectedAcademicYear },
        updated_at: new Date().toISOString()
      })
      .select('updated_at')
      .single();
    if (error) {
      setSyncState('error');
      setSyncMessage(`Supabase write failed: ${error.message}`);
      return false;
    }
    setRemoteUpdatedAt(data?.updated_at ?? null);
    setSyncState('saved');
    setSyncMessage('Supabase sync saved.');
    return true;
  }, [faculty, courses, activities, assignments, selectedAcademicYear]);

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
        setSyncMessage('Reading planner_state from Supabase…');
        const { data, error } = await supabase.from('planner_state').select('payload, updated_at').eq('id', REMOTE_STATE_ID).maybeSingle();
        if (error) {
          setSyncState('error');
          setSyncMessage(`Supabase read failed: ${error.message}`);
        } else {
          const payload = data?.payload as Partial<AppDataState> | undefined;
          if (payload) {
            if (payload.faculty) setFaculty(payload.faculty);
            if (payload.courses) setCourses(payload.courses);
            if (payload.activities) setActivities(payload.activities);
            if (payload.assignments) setAssignments(payload.assignments);
            if (payload.selectedAcademicYear) setSelectedAcademicYear(payload.selectedAcademicYear);
          }
          setRemoteUpdatedAt(data?.updated_at ?? null);
          setSyncState('saved');
          setSyncMessage('Supabase sync connected.');
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
      JSON.stringify({ faculty, courses, activities, assignments, selectedAcademicYear })
    );
  }, [faculty, courses, activities, assignments, selectedAcademicYear, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!(isSupabaseConfigured && supabase)) return;
    const handle = setTimeout(() => {
      setSyncState('saving');
      setSyncMessage('Writing planner state to Supabase…');
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
    setSyncMessage('Checking planner_state row in Supabase…');
    const { data, error } = await supabase
      .from('planner_state')
      .select('id, updated_at')
      .eq('id', REMOTE_STATE_ID)
      .maybeSingle();
    if (error) {
      setSyncState('error');
      setSyncMessage(`Supabase verify failed: ${error.message}`);
      return false;
    }
    if (!data) {
      setSyncState('error');
      setSyncMessage('No planner_state row found yet. Click "Sync to Supabase now" to create it.');
      setRemoteUpdatedAt(null);
      return false;
    }
    setRemoteUpdatedAt(data.updated_at ?? null);
    setSyncState('saved');
    setSyncMessage(`Verified planner_state row "${data.id}" in Supabase.`);
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
