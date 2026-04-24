'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { academicYears as seedAcademicYears, activities as seedActivities, courses as seedCourses, faculty as seedFaculty, initialAssignments, qualifications as seedQualifications, scenarios as seedScenarios } from '@/lib/seed-data';
import { AcademicYear, Activity, Course, Faculty, FacultyCourseQualification, Scenario, WorkloadAssignment } from '@/lib/types';

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

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
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
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ faculty, courses, activities, assignments, selectedAcademicYear })
    );
  }, [faculty, courses, activities, assignments, selectedAcademicYear]);

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
