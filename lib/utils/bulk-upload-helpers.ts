import * as XLSX from 'xlsx';
import type { BulkStudentData, BulkUploadError } from '@/types/bulk-upload-types';

/**
 * CSV Template Headers
 */
const CSV_HEADERS = [
    'firstName',
    'middleName',
    'lastName',
    'email',
    'gender',
    'dateOfBirth',
    'studentId',
    'studentType',
    'className',
    'guardianEmail',
    'address',
    'phoneNumber',
];

/**
 * Sample data for template
 */
const SAMPLE_DATA: BulkStudentData[] = [
    {
        firstName: 'John',
        middleName: 'Banda',
        lastName: 'Phiri',
        email: 'john.phiri@school.mw',
        gender: 'male',
        dateOfBirth: '2008-05-15',
        studentId: 'STU2024001',
        studentType: 'internal',
        className: 'Form 1A',
        guardianEmail: 'parent.phiri@email.com',
        address: 'Area 47, Lilongwe',
        phoneNumber: '+265999123456',
    },
    {
        firstName: 'Grace',
        middleName: '',
        lastName: 'Mwale',
        email: 'grace.mwale@school.mw',
        gender: 'female',
        dateOfBirth: '2009-08-22',
        studentId: 'STU2024002',
        studentType: 'external',
        className: 'Form 2B',
        guardianEmail: 'parent.mwale@email.com',
        address: 'Kawale, Lilongwe',
        phoneNumber: '0888765432',
    },
];

/**
 * Generate CSV template content
 */
export function generateCSVTemplate(includeSampleData: boolean = true): string {
    const headers = CSV_HEADERS.join(',');

    if (!includeSampleData) {
        return headers;
    }

    const sampleRows = SAMPLE_DATA.map(row =>
        CSV_HEADERS.map(header => {
            const value = row[header as keyof BulkStudentData] || '';
            // Escape commas and quotes
            return `"${value}"`;
        }).join(',')
    );

    return [headers, ...sampleRows].join('\n');
}

/**
 * Generate Excel template with data validation
 */
export function generateExcelTemplate(includeSampleData: boolean = true): ArrayBuffer {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create worksheet data
    const wsData: any[][] = [
        // Headers
        CSV_HEADERS,
    ];

    // Add sample data if requested
    if (includeSampleData) {
        SAMPLE_DATA.forEach(row => {
            wsData.push(
                CSV_HEADERS.map(header => row[header as keyof BulkStudentData] || '')
            );
        });
    }

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
        { wch: 15 }, // firstName
        { wch: 15 }, // middleName
        { wch: 15 }, // lastName
        { wch: 25 }, // email
        { wch: 10 }, // gender
        { wch: 12 }, // dateOfBirth
        { wch: 15 }, // studentId
        { wch: 12 }, // studentType
        { wch: 15 }, // className
        { wch: 25 }, // guardianEmail
        { wch: 30 }, // address
        { wch: 15 }, // phoneNumber
    ];

    // Add data validation for gender column (E)
    if (!ws['!dataValidation']) {
        ws['!dataValidation'] = [];
    }

    // Gender validation (column E, rows 2+)
    ws['!dataValidation'].push({
        sqref: 'E2:E1000',
        type: 'list',
        formula1: '"male,female"',
        showErrorMessage: true,
        errorTitle: 'Invalid Gender',
        error: 'Please select either "male" or "female"',
    });

    // Student Type validation (column H, rows 2+)
    ws['!dataValidation'].push({
        sqref: 'H2:H1000',
        type: 'list',
        formula1: '"internal,external"',
        showErrorMessage: true,
        errorTitle: 'Invalid Student Type',
        error: 'Please select either "internal" or "external"',
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    // Add instructions sheet
    const instructionsData = [
        ['Bulk Student Registration Template - Instructions'],
        [''],
        ['Column Descriptions:'],
        ['firstName', 'Student\'s first name (required)'],
        ['middleName', 'Student\'s middle name (optional)'],
        ['lastName', 'Student\'s last name (required)'],
        ['email', 'Student\'s email address (required, must be unique)'],
        ['gender', 'Either "male" or "female" (required)'],
        ['dateOfBirth', 'Format: YYYY-MM-DD, e.g., 2008-05-15 (required)'],
        ['studentId', 'Unique student ID, 6-20 characters (required)'],
        ['studentType', 'Either "internal" or "external" (required)'],
        ['className', 'Class/Form name, e.g., "Form 1A" (required)'],
        ['guardianEmail', 'Parent/Guardian email address (required)'],
        ['address', 'Student\'s address (optional)'],
        ['phoneNumber', 'Phone number in Malawi format: +265XXXXXXXXX or 0XXXXXXXXX (optional)'],
        [''],
        ['Important Notes:'],
        ['1. All students will receive the default password: Student@sssims2025'],
        ['2. Students must change their password on first login'],
        ['3. Email addresses must be unique across all students'],
        ['4. Student IDs must be unique'],
        ['5. Class names must match existing classes in the system'],
        ['6. Maximum file size: 10MB'],
        ['7. Recommended batch size: 500 students per upload'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 20 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Write to buffer
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return wbout;
}

/**
 * Download CSV template
 */
export function downloadCSVTemplate(includeSampleData: boolean = true) {
    const content = generateCSVTemplate(includeSampleData);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'student_registration_template.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Download Excel template
 */
export function downloadExcelTemplate(includeSampleData: boolean = true) {
    const buffer = generateExcelTemplate(includeSampleData);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'student_registration_template.xlsx');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export bulk upload errors to CSV
 */
export function exportBulkErrorsToCSV(errors: BulkUploadError[]): void {
    const headers = ['Row', 'Email', 'Student ID', 'Error Type', 'Error Message'];
    const rows = errors.map(err => [
        err.row.toString(),
        err.email || '',
        err.studentId || '',
        err.type,
        err.error,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.setAttribute('href', url);
    link.setAttribute('download', `bulk_upload_errors_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate upload statistics
 */
export function calculateUploadStats(total: number, success: number, failed: number, skipped: number) {
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
    const failureRate = total > 0 ? Math.round((failed / total) * 100) : 0;
    const skipRate = total > 0 ? Math.round((skipped / total) * 100) : 0;

    return {
        total,
        success,
        failed,
        skipped,
        successRate,
        failureRate,
        skipRate,
    };
}

/**
 * Teacher CSV Template Headers
 */
const TEACHER_CSV_HEADERS = [
    'title',
    'firstName',
    'middleName',
    'lastName',
    'email',
    'gender',
    'employeeId',
    'department',
    'role',
    'teacherType',
    'subjects',
    'classes',
];

/**
 * Sample teacher data
 */
const TEACHER_SAMPLE_DATA = [
    {
        title: 'Mr.',
        firstName: 'James',
        middleName: '',
        lastName: 'Banda',
        email: 'james.banda@school.mw',
        gender: 'male',
        employeeId: 'TCH2024001',
        department: 'Mathematics',
        role: 'teacher',
        teacherType: 'permanent',
        subjects: 'Mathematics, Physics',
        classes: 'Form 1A, Form 2B',
    },
    {
        title: 'Mrs.',
        firstName: 'Sarah',
        middleName: 'J',
        lastName: 'Phiri',
        email: 'sarah.phiri@school.mw',
        gender: 'female',
        employeeId: 'TCH2024002',
        department: 'Languages',
        role: 'teacher',
        teacherType: 'permanent',
        subjects: 'English, Chichewa',
        classes: 'Form 3A, Form 4B',
    },
];

/**
 * Generate Teacher CSV template content
 */
export function generateTeacherCSVTemplate(includeSampleData: boolean = true): string {
    const headers = TEACHER_CSV_HEADERS.join(',');

    if (!includeSampleData) {
        return headers;
    }

    const sampleRows = TEACHER_SAMPLE_DATA.map(row =>
        TEACHER_CSV_HEADERS.map(header => {
            // @ts-ignore
            const value = row[header] || '';
            return `"${value}"`;
        }).join(',')
    );

    return [headers, ...sampleRows].join('\n');
}

/**
 * Generate Teacher Excel template
 */
export function generateTeacherExcelTemplate(includeSampleData: boolean = true): ArrayBuffer {
    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [TEACHER_CSV_HEADERS];

    if (includeSampleData) {
        TEACHER_SAMPLE_DATA.forEach(row => {
            // @ts-ignore
            wsData.push(TEACHER_CSV_HEADERS.map(header => row[header] || ''));
        });
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [
        { wch: 10 }, // title
        { wch: 15 }, // firstName
        { wch: 15 }, // middleName
        { wch: 15 }, // lastName
        { wch: 25 }, // email
        { wch: 10 }, // gender
        { wch: 15 }, // employeeId
        { wch: 20 }, // department
        { wch: 15 }, // role
        { wch: 15 }, // teacherType
        { wch: 30 }, // subjects
        { wch: 30 }, // classes
    ];

    // Data validation
    if (!ws['!dataValidation']) ws['!dataValidation'] = [];

    // Gender (F)
    ws['!dataValidation'].push({
        sqref: 'F2:F1000',
        type: 'list',
        formula1: '"male,female"',
        showErrorMessage: true,
        errorTitle: 'Invalid Gender',
        error: 'Select male or female',
    });

    // Role (I)
    ws['!dataValidation'].push({
        sqref: 'I2:I1000',
        type: 'list',
        formula1: '"teacher,headteacher,deputy_headteacher"',
        showErrorMessage: true,
        errorTitle: 'Invalid Role',
        error: 'Select valid role',
    });

    // Teacher Type (J)
    ws['!dataValidation'].push({
        sqref: 'J2:J1000',
        type: 'list',
        formula1: '"permanent,temporary,tp"',
        showErrorMessage: true,
        errorTitle: 'Invalid Type',
        error: 'Select valid teacher type',
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Teachers');

    // Instructions
    const instructionsData = [
        ['Bulk Teacher Registration Template - Instructions'],
        [''],
        ['Column Descriptions:'],
        ['title', 'Mr., Mrs., Ms., Dr., Prof., Rev.'],
        ['firstName', 'Required'],
        ['middleName', 'Optional'],
        ['lastName', 'Required'],
        ['email', 'Required, Unique'],
        ['gender', 'male/female'],
        ['employeeId', 'Required, Unique'],
        ['department', 'Exact department name (e.g. Mathematics)'],
        ['role', 'teacher, headteacher, deputy_headteacher'],
        ['teacherType', 'permanent, temporary, tp'],
        ['subjects', 'Comma-separated list of subject names'],
        ['classes', 'Comma-separated list of class names'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 20 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}

/**
 * Download Teacher CSV template
 */
export function downloadTeacherCSVTemplate(includeSampleData: boolean = true) {
    const content = generateTeacherCSVTemplate(includeSampleData);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'teacher_registration_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Download Teacher Excel template
 */
export function downloadTeacherExcelTemplate(includeSampleData: boolean = true) {
    const buffer = generateTeacherExcelTemplate(includeSampleData);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'teacher_registration_template.xlsx');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
