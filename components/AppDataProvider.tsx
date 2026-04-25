'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
        const { data } = await supabase.from('planner_state').select('payload').eq('id', REMOTE_STATE_ID).maybeSingle();
        const payload = data?.payload as Partial<AppDataState> | undefined;
        if (payload) {
          if (payload.faculty) setFaculty(payload.faculty);
          if (payload.courses) setCourses(payload.courses);
          if (payload.activities) setActivities(payload.activities);
          if (payload.assignments) setAssignments(payload.assignments);
          if (payload.selectedAcademicYear) setSelectedAcademicYear(payload.selectedAcademicYear);
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
    const client = supabase;
    const handle = setTimeout(() => {
      void client.from('planner_state').upsert({
        id: REMOTE_STATE_ID,
        payload: { faculty, courses, activities, assignments, selectedAcademicYear },
        updated_at: new Date().toISOString()
      });
    }, 500);
    return () => clearTimeout(handle);
  }, [faculty, courses, activities, assignments, selectedAcademicYear, hydrated]);

  const resetToSeed = () => {
    setFaculty(seedFaculty);
    setCourses(seedCourses);
    setActivities(seedActivities);
    setAssignments(initialAssignments);
    setSelectedAcademicYear(seedAcademicYears.find((a) => a.active)?.label ?? seedAcademicYears[0].label);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ faculty, courses, activities, scenarios, academicYears, selectedAcademicYear, qualifications, assignments, setFaculty, setCourses, setActivities, setAssignments, setSelectedAcademicYear, resetToSeed }),
    [faculty, courses, activities, scenarios, academicYears, selectedAcademicYear, qualifications, assignments]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
