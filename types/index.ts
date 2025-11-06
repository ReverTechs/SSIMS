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
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Student extends User {
  role: "student";
  studentId: string;
  class: string;
  guardianId?: string;
  dateOfBirth?: Date;
  address?: string;
  phoneNumber?: string;
}

export interface Teacher extends User {
  role: "teacher" | "headteacher" | "deputy_headteacher";
  teacherId: string;
  subjects: string[];
  department?: string;
}

export interface Guardian extends User {
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



