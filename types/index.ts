export type UserRole =
  | "student"
  | "teacher"
  | "headteacher"
  | "deputy_headteacher"
  | "guardian"
  | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Student extends User {
  role: "student";
  studentId: string;
  class: string;
  classId?: string;
  guardianId?: string; // Deprecated: use guardians array instead
  guardians?: Guardian[]; // Array of guardians for this student
  dateOfBirth?: Date;
  address?: string;
  phoneNumber?: string;
  gender?: 'male' | 'female';
  studentType?: 'internal' | 'external';
}


export interface Teacher extends User {
  role: "teacher" | "headteacher" | "deputy_headteacher";
  teacherId: string;
  subjects: string[];
  department?: string;
}

// =====================================================================
// GUARDIAN TYPES - Production-ready with dual-role support
// =====================================================================

/**
 * Guardian entity - stores guardian-specific data
 * Note: Name and email are stored in the profiles table (no duplication)
 * A user can be both a teacher AND a guardian (dual role support)
 */
export interface Guardian {
  id: string; // References profiles.id
  phoneNumber?: string;
  alternativePhone?: string;
  address?: string;
  occupation?: string;
  nationalId?: string; // Unique identifier
  workplace?: string;
  workPhone?: string;
  preferredContactMethod?: 'email' | 'phone' | 'sms' | 'whatsapp';
  isEmergencyContact?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Student-Guardian relationship with permissions and responsibilities
 * Supports many-to-many: one student can have multiple guardians,
 * one guardian can have multiple students (e.g., siblings, or teacher's own children)
 */
export interface StudentGuardian {
  studentId: string;
  guardianId: string;
  relationship: 'father' | 'mother' | 'stepfather' | 'stepmother' |
  'grandfather' | 'grandmother' | 'uncle' | 'aunt' |
  'brother' | 'sister' | 'legal_guardian' | 'foster_parent' | 'other';
  isPrimary: boolean; // Primary guardian for THIS student
  isEmergencyContact: boolean;
  canPickup: boolean; // Authorized to pick up student from school
  financialResponsibility: boolean; // Responsible for fees
  receivesReportCard: boolean;
  receivesNotifications: boolean;
  notes?: string; // Special instructions (e.g., custody arrangements)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Extended Guardian with profile information (for display purposes)
 * Combines data from profiles and guardians tables
 */
export interface GuardianWithProfile extends Guardian {
  email?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  role: 'guardian';
}

// Legacy Guardian interface extending User (kept for backward compatibility)
export interface GuardianUser extends User {
  role: "guardian";
  guardianId: string;
  students: string[]; // Array of student IDs
  relationship: string;
  phoneNumber?: string;
}



export interface Admin extends User {
  role: "admin";
  adminId: string;
  permissions: string[];
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  teacherId: string;
  score: number;
  maxScore: number;
  grade: string;
  term: string;
  academicYear: string;
  createdAt: Date;
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  paid: number;
  balance: number;
  dueDate: Date;
  status: "paid" | "partial" | "unpaid";
  description?: string;
}

export interface Report {
  id: string;
  studentId: string;
  academicYear: string;
  term: string;
  grades: Grade[];
  overallGrade: string;
  remarks?: string;
  generatedAt: Date;
  generatedBy: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  targetAudience: UserRole[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: "holiday" | "exam" | "event" | "meeting";
  createdBy: string;
}

export interface Timetable {
  id: string;
  class: string;
  day: string;
  period: number;
  subject: string;
  teacherId: string;
  teacherName: string;
  room?: string;
  startTime: string;
  endTime: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  class: string;
  description?: string;
}

export interface AcademicProgress {
  studentId: string;
  subject: string;
  term1Average?: number;
  term2Average?: number;
  term3Average?: number;
  overallAverage?: number;
  trend: "improving" | "stable" | "declining";
}





