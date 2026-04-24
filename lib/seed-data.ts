import { AcademicYear, Activity, Course, Faculty, FacultyCourseQualification, Scenario, WorkloadAssignment } from './types';

export const quarters = ['Fall', 'Winter', 'Spring', 'Summer'] as const;

export const academicYears: AcademicYear[] = [{ id: 'ay-2026', label: '2026-2027', start_year: 2026, active: true }];

export const scenarios: Scenario[] = [
  { id: 'sc-base', academic_year_id: 'ay-2026', name: 'Base Plan', description: 'Primary staffing plan', is_active: true },
  { id: 'sc-alt', academic_year_id: 'ay-2026', name: 'Alternate Plan', description: 'Contingency for staffing shifts', is_active: false },
  { id: 'sc-release', academic_year_id: 'ay-2026', name: 'If faculty member receives release', is_active: false },
  { id: 'sc-hire', academic_year_id: 'ay-2026', name: 'If new hire joins', is_active: false },
  { id: 'sc-cancel', academic_year_id: 'ay-2026', name: 'If course is canceled', is_active: false }
];

export const faculty: Faculty[] = [
  { id: 'f1', name: 'Dr. Alyssa Moreno', program: 'Mechanical Engineering', rank_or_role: 'Professor', annual_workload_target: 24, fall_target: 6, winter_target: 6, spring_target: 6, summer_target: 6, notes: 'Program chair rotation 2026-27', active: true },
  { id: 'f2', name: 'Dr. Ben Carter', program: 'Mechanical Engineering', rank_or_role: 'Associate Professor', annual_workload_target: 24, fall_target: 6, winter_target: 6, spring_target: 6, summer_target: 6, active: true },
  { id: 'f3', name: 'Dr. Chloe Park', program: 'Mechanical Engineering', rank_or_role: 'Assistant Professor', annual_workload_target: 22, fall_target: 6, winter_target: 6, spring_target: 6, summer_target: 4, active: true },
  { id: 'f4', name: 'Prof. Daniel Kim', program: 'ICET', rank_or_role: 'Professor of Practice', annual_workload_target: 24, fall_target: 6, winter_target: 6, spring_target: 6, summer_target: 6, active: true },
  { id: 'f5', name: 'Prof. Elena Singh', program: 'ICET', rank_or_role: 'Senior Lecturer', annual_workload_target: 24, fall_target: 6, winter_target: 6, spring_target: 6, summer_target: 6, active: true },
  { id: 'f6', name: 'Dr. Farah Qureshi', program: 'Mechanical Engineering', rank_or_role: 'Assistant Professor', annual_workload_target: 20, fall_target: 5, winter_target: 5, spring_target: 5, summer_target: 5, active: true }
];

export const courses: Course[] = [
  { id: 'c1', prefix: 'MEEN', number: '221', title: 'Statics', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 3, is_required: true, normally_offered_fall: true, normally_offered_winter: true, normally_offered_spring: false, normally_offered_summer: false, active: true },
  { id: 'c2', prefix: 'MEEN', number: '222', title: 'Dynamics', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 3, is_required: true, normally_offered_fall: false, normally_offered_winter: true, normally_offered_spring: true, normally_offered_summer: false, active: true },
  { id: 'c3', prefix: 'MEEN', number: '310', title: 'Thermodynamics', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 3, is_required: true, normally_offered_fall: true, normally_offered_winter: false, normally_offered_spring: true, normally_offered_summer: false, active: true },
  { id: 'c4', prefix: 'MEEN', number: '382', title: 'Fluids Lab', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 4, is_required: true, normally_offered_fall: false, normally_offered_winter: true, normally_offered_spring: false, normally_offered_summer: false, active: true },
  { id: 'c5', prefix: 'MEEN', number: '462', title: 'Machine Design', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 3, is_required: true, normally_offered_fall: true, normally_offered_winter: false, normally_offered_spring: true, normally_offered_summer: false, active: true },
  { id: 'c6', prefix: 'MEEN', number: '498', title: 'Capstone Coordination', program: 'Mechanical Engineering', credit_hours: 1, default_workload_units: 2, is_required: true, normally_offered_fall: false, normally_offered_winter: false, normally_offered_spring: true, normally_offered_summer: false, active: true },
  { id: 'c7', prefix: 'MEEN', number: '370', title: 'Materials Engineering', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 3, is_required: false, normally_offered_fall: true, normally_offered_winter: false, normally_offered_spring: false, normally_offered_summer: true, active: true },
  { id: 'c8', prefix: 'MEEN', number: '430', title: 'Heat Transfer', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 3, is_required: false, normally_offered_fall: false, normally_offered_winter: true, normally_offered_spring: true, normally_offered_summer: false, active: true },
  { id: 'c9', prefix: 'MEEN', number: '340', title: 'Manufacturing Processes', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 3, is_required: false, normally_offered_fall: true, normally_offered_winter: true, normally_offered_spring: false, normally_offered_summer: false, active: true },
  { id: 'c10', prefix: 'MEEN', number: '410', title: 'Control Systems', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 3, is_required: false, normally_offered_fall: false, normally_offered_winter: false, normally_offered_spring: true, normally_offered_summer: false, active: true },
  { id: 'c11', prefix: 'MEEN', number: '455', title: 'Finite Element Analysis', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 3, is_required: false, normally_offered_fall: false, normally_offered_winter: true, normally_offered_spring: false, normally_offered_summer: false, active: true },
  { id: 'c12', prefix: 'MEEN', number: '480', title: 'Energy Systems', program: 'Mechanical Engineering', credit_hours: 3, default_workload_units: 3, is_required: false, normally_offered_fall: true, normally_offered_winter: false, normally_offered_spring: true, normally_offered_summer: true, active: true },
  { id: 'c13', prefix: 'ICET', number: '101', title: 'Intro to Instrumentation', program: 'ICET', credit_hours: 3, default_workload_units: 3, is_required: true, normally_offered_fall: true, normally_offered_winter: false, normally_offered_spring: true, normally_offered_summer: false, active: true },
  { id: 'c14', prefix: 'ICET', number: '220', title: 'PLC Fundamentals', program: 'ICET', credit_hours: 4, default_workload_units: 4, is_required: true, normally_offered_fall: false, normally_offered_winter: true, normally_offered_spring: false, normally_offered_summer: false, active: true },
  { id: 'c15', prefix: 'ICET', number: '240', title: 'Industrial Networking', program: 'ICET', credit_hours: 3, default_workload_units: 3, is_required: true, normally_offered_fall: true, normally_offered_winter: false, normally_offered_spring: true, normally_offered_summer: false, active: true },
  { id: 'c16', prefix: 'ICET', number: '260', title: 'Motor Controls', program: 'ICET', credit_hours: 3, default_workload_units: 3, is_required: true, normally_offered_fall: false, normally_offered_winter: true, normally_offered_spring: true, normally_offered_summer: false, active: true },
  { id: 'c17', prefix: 'ICET', number: '310', title: 'Process Automation', program: 'ICET', credit_hours: 4, default_workload_units: 4, is_required: true, normally_offered_fall: true, normally_offered_winter: false, normally_offered_spring: false, normally_offered_summer: false, active: true },
  { id: 'c18', prefix: 'ICET', number: '320', title: 'SCADA Systems', program: 'ICET', credit_hours: 3, default_workload_units: 3, is_required: false, normally_offered_fall: false, normally_offered_winter: true, normally_offered_spring: false, normally_offered_summer: true, active: true },
  { id: 'c19', prefix: 'ICET', number: '360', title: 'Robotics Integration', program: 'ICET', credit_hours: 3, default_workload_units: 4, is_required: false, normally_offered_fall: true, normally_offered_winter: false, normally_offered_spring: true, normally_offered_summer: false, active: true },
  { id: 'c20', prefix: 'ICET', number: '410', title: 'Senior Project', program: 'ICET', credit_hours: 2, default_workload_units: 3, is_required: true, normally_offered_fall: false, normally_offered_winter: false, normally_offered_spring: true, normally_offered_summer: false, active: true }
];

export const activities: Activity[] = [
  { id: 'a1', title: 'Research', category: 'research', default_workload_units: 3, active: true },
  { id: 'a2', title: 'Program Chair Duties', category: 'program chair', default_workload_units: 6, active: true },
  { id: 'a3', title: 'Advising', category: 'advising', default_workload_units: 2, active: true },
  { id: 'a4', title: 'College Service', category: 'service', default_workload_units: 1, active: true },
  { id: 'a5', title: 'Lab Management', category: 'lab management', default_workload_units: 2, active: true },
  { id: 'a6', title: 'Administration', category: 'administration', default_workload_units: 3, active: true },
  { id: 'a7', title: 'Course Release', category: 'release time', default_workload_units: 3, active: true }
];

export const qualifications: FacultyCourseQualification[] = [
  { id: 'q1', faculty_id: 'f1', course_id: 'c5', qualification_level: 'preferred' },
  { id: 'q2', faculty_id: 'f2', course_id: 'c1', qualification_level: 'qualified' },
  { id: 'q3', faculty_id: 'f3', course_id: 'c4', qualification_level: 'possible' },
  { id: 'q4', faculty_id: 'f4', course_id: 'c14', qualification_level: 'preferred' },
  { id: 'q5', faculty_id: 'f5', course_id: 'c17', qualification_level: 'qualified' },
  { id: 'q6', faculty_id: 'f6', course_id: 'c2', qualification_level: 'avoid' }
];

export const initialAssignments: WorkloadAssignment[] = [
  { id: 'w1', faculty_id: 'f1', scenario_id: 'sc-base', academic_year: '2026-2027', quarter: 'Fall', item_type: 'course', course_id: 'c5', activity_id: null, workload_units: 3, workload_units_override: false, credit_hours_snapshot: 3, label: 'MEEN 462 Machine Design', status: 'confirmed', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'w2', faculty_id: 'f1', scenario_id: 'sc-base', academic_year: '2026-2027', quarter: 'Fall', item_type: 'activity', course_id: null, activity_id: 'a2', workload_units: 6, workload_units_override: false, credit_hours_snapshot: null, label: 'Program Chair Duties', status: 'planned', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'w3', faculty_id: 'f2', scenario_id: 'sc-base', academic_year: '2026-2027', quarter: 'Winter', item_type: 'course', course_id: 'c4', activity_id: null, workload_units: 4, workload_units_override: true, credit_hours_snapshot: 3, label: 'MEEN 382 Fluids Lab', status: 'planned', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'w4', faculty_id: 'f4', scenario_id: 'sc-base', academic_year: '2026-2027', quarter: 'Winter', item_type: 'course', course_id: 'c14', activity_id: null, workload_units: 4, workload_units_override: false, credit_hours_snapshot: 4, label: 'ICET 220 PLC Fundamentals', status: 'confirmed', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'w5', faculty_id: 'f5', scenario_id: 'sc-base', academic_year: '2026-2027', quarter: 'Spring', item_type: 'course', course_id: 'c20', activity_id: null, workload_units: 3, workload_units_override: false, credit_hours_snapshot: 2, label: 'ICET 410 Senior Project', status: 'planned', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'w6', faculty_id: 'f3', scenario_id: 'sc-base', academic_year: '2026-2027', quarter: 'Spring', item_type: 'activity', course_id: null, activity_id: 'a1', workload_units: 3, workload_units_override: false, credit_hours_snapshot: null, label: 'Research', status: 'planned', created_at: '2026-04-01', updated_at: '2026-04-01' }
];
