'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { activities as seedActivities, courses as seedCourses, faculty as seedFaculty, initialAssignments, qualifications as seedQualifications, scenarios as seedScenarios } from '@/lib/seed-data';
import { Activity, Course, Faculty, FacultyCourseQualification, Scenario, WorkloadAssignment } from '@/lib/types';

type AppDataState = {
  faculty: Faculty[];
  courses: Course[];
  activities: Activity[];
  scenarios: Scenario[];
  qualifications: FacultyCourseQualification[];
  assignments: WorkloadAssignment[];
  setFaculty: Dispatch<SetStateAction<Faculty[]>>;
  setCourses: Dispatch<SetStateAction<Course[]>>;
  setActivities: Dispatch<SetStateAction<Activity[]>>;
  setAssignments: Dispatch<SetStateAction<WorkloadAssignment[]>>;
  resetToSeed: () => void;
};

const STORAGE_KEY = 'flm-admin-data-v1';

const AppDataContext = createContext<AppDataState | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [faculty, setFaculty] = useState<Faculty[]>(seedFaculty);
  const [courses, setCourses] = useState<Course[]>(seedCourses);
  const [activities, setActivities] = useState<Activity[]>(seedActivities);
  const [scenarios] = useState<Scenario[]>(seedScenarios);
  const [qualifications] = useState<FacultyCourseQualification[]>(seedQualifications);
  const [assignments, setAssignments] = useState<WorkloadAssignment[]>(initialAssignments);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<AppDataState>;
      if (parsed.faculty) setFaculty(parsed.faculty);
      if (parsed.courses) setCourses(parsed.courses);
      if (parsed.activities) setActivities(parsed.activities);
      if (parsed.assignments) setAssignments(parsed.assignments);
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ faculty, courses, activities, assignments })
    );
  }, [faculty, courses, activities, assignments]);

  const resetToSeed = () => {
    setFaculty(seedFaculty);
    setCourses(seedCourses);
    setActivities(seedActivities);
    setAssignments(initialAssignments);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ faculty, courses, activities, scenarios, qualifications, assignments, setFaculty, setCourses, setActivities, setAssignments, resetToSeed }),
    [faculty, courses, activities, scenarios, qualifications, assignments]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
