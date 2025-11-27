/**
 * Bulk Upload Types for Student Registration
 * Supports CSV and Excel file uploads with validation
 */

export interface BulkStudentData {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    gender: 'male' | 'female';
    dateOfBirth: string; // YYYY-MM-DD format
    studentId: string;
    studentType: 'internal' | 'external';
    className: string; // Class name (will be mapped to class_id)
    guardianEmail: string;
    address?: string;
    phoneNumber?: string;
}

export interface BulkTeacherData {
    title: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    gender: 'male' | 'female';
    employeeId: string;
    department: string;
    role: 'teacher' | 'headteacher' | 'deputy_headteacher';
    teacherType: 'permanent' | 'temporary' | 'tp';
    subjects: string; // Comma-separated list of subject names
    classes: string; // Comma-separated list of class names
}

export interface ValidationError {
    row: number;
    field: string;
    value: any;
    message: string;
}

export interface ParsedFileData<T = BulkStudentData> {
    data: T[];
    errors: ValidationError[];
    fileName: string;
    fileSize: number;
    rowCount: number;
    validRowCount: number;
    invalidRowCount: number;
}

export interface BulkUploadResult {
    success: boolean;
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    skippedCount: number;
    errors: BulkUploadError[];
    message: string;
}

export interface BulkUploadError {
    row: number;
    email?: string;
    studentId?: string;
    error: string;
    type: 'validation' | 'duplicate' | 'database' | 'auth';
}

export interface UploadProgress {
    stage: 'parsing' | 'validating' | 'uploading' | 'complete' | 'error';
    current: number;
    total: number;
    percentage: number;
    message: string;
}

export interface ClassMapping {
    id: string;
    name: string;
}

export type FileType = 'csv' | 'xlsx' | 'xls';

export interface FileValidation {
    isValid: boolean;
    error?: string;
    fileType?: FileType;
}
