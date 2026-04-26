export type Quarter = 'Fall' | 'Winter' | 'Spring' | 'Summer';
export type Program = 'Mechanical Engineering' | 'ICET' | 'Other';

export type Faculty = {
  id: string;
  prefix?: string;
  name: string;
  program: Program;
  rank_or_role: string;
  annual_workload_target: number;
  fall_target: number;
  winter_target: number;
  spring_target: number;
  summer_target: number;
  notes?: string;
  active: boolean;
};

export type Course = {
  id: string;
  prefix: string;
  number: string;
  title: string;
  program: Program;
  credit_hours: number;
  default_workload_units: number;
  annual_sections_required?: number;
  is_required: boolean;
  normally_offered_fall: boolean;
  normally_offered_winter: boolean;
  normally_offered_spring: boolean;
  normally_offered_summer: boolean;
  notes?: string;
  active: boolean;
};

export type ActivityCategory =
  | 'teaching'
  | 'research'
  | 'advising'
  | 'program chair'
  | 'service'
  | 'administration'
  | 'lab management'
  | 'release time'
  | 'other';

export type Activity = {
  id: string;
  title: string;
  category: ActivityCategory;
  default_workload_units: number;
  notes?: string;
  active: boolean;
};

export type AssignmentStatus = 'planned' | 'confirmed' | 'problem';

export type WorkloadAssignment = {
  id: string;
  faculty_id: string;
  scenario_id: string;
  academic_year: string;
  quarter: Quarter;
  item_type: 'course' | 'activity';
  course_id: string | null;
  activity_id: string | null;
  workload_units: number;
  workload_units_override: boolean;
  credit_hours_snapshot: number | null;
  section?: number | null;
  label: string;
  notes?: string;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string;
};

export type FacultyCourseQualification = {
  id: string;
  faculty_id: string;
  course_id: string;
  qualification_level: 'preferred' | 'qualified' | 'possible' | 'avoid';
  notes?: string;
};

export type AcademicYear = {
  id: string;
  label: string;
  start_year: number;
  active: boolean;
};

export type Scenario = {
  id: string;
  academic_year_id: string;
  name: string;
  description?: string;
  is_active: boolean;
};
