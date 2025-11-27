import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { BulkTeacherData, ParsedFileData, ValidationError } from '@/types/bulk-upload-types';

/**
 * Required columns for teacher upload
 */
const REQUIRED_COLUMNS = [
    'firstName',
    'lastName',
    'email',
    'gender',
    'employeeId',
    'department',
    'role',
];

/**
 * Auto-normalization mappings for common variations
 */
const TITLE_NORMALIZATIONS: Record<string, string> = {
    'mr.': 'Mr',
    'mr': 'Mr',
    'mrs.': 'Mrs',
    'mrs': 'Mrs',
    'ms.': 'Ms',
    'ms': 'Ms',
    'miss': 'Ms',
    'miss.': 'Ms',
    'dr.': 'Dr',
    'dr': 'Dr',
    'prof.': 'Prof',
    'prof': 'Prof',
    'professor': 'Prof',
};

const GENDER_NORMALIZATIONS: Record<string, 'male' | 'female'> = {
    'm': 'male',
    'f': 'female',
    'boy': 'male',
    'girl': 'female',
    'man': 'male',
    'woman': 'female',
};

const ROLE_NORMALIZATIONS: Record<string, string> = {
    'head teacher': 'headteacher',
    'head-teacher': 'headteacher',
    'deputy head teacher': 'deputy_headteacher',
    'deputy-head-teacher': 'deputy_headteacher',
    'deputy headteacher': 'deputy_headteacher',
    'deputy': 'deputy_headteacher',
};

const TEACHER_TYPE_NORMALIZATIONS: Record<string, string> = {
    'perm': 'permanent',
    'temp': 'temporary',
    'contract': 'temporary',
};

/**
 * Normalize a value using a mapping table
 */
function normalize(value: string | undefined, mappings: Record<string, string>): string {
    if (!value) return '';
    const trimmed = value.toString().trim();
    const lower = trimmed.toLowerCase();
    return mappings[lower] || trimmed;
}

/**
 * Normalize title with common variations
 */
function normalizeTitle(title: string | undefined): string {
    return normalize(title, TITLE_NORMALIZATIONS);
}

/**
 * Normalize gender with common variations
 */
function normalizeGender(gender: string | undefined): string {
    if (!gender) return '';
    const trimmed = gender.toString().trim();
    const lower = trimmed.toLowerCase();
    return GENDER_NORMALIZATIONS[lower] || lower;
}

/**
 * Normalize role with common variations
 */
function normalizeRole(role: string | undefined): string {
    return normalize(role, ROLE_NORMALIZATIONS);
}

/**
 * Normalize teacher type with common variations
 */
function normalizeTeacherType(type: string | undefined): string {
    return normalize(type, TEACHER_TYPE_NORMALIZATIONS);
}

/**
 * Normalize department name (trim and title case)
 */
function normalizeDepartment(dept: string | undefined): string {
    if (!dept) return '';
    return dept.toString().trim();
}

/**
 * Parse Teacher CSV/Excel file
 */
export async function parseTeacherFile(file: File): Promise<ParsedFileData<BulkTeacherData>> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
        return parseCSV(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
        return parseExcel(file);
    } else {
        throw new Error('Unsupported file format. Please use CSV or Excel.');
    }
}

/**
 * Parse CSV file
 */
function parseCSV(file: File): Promise<ParsedFileData<BulkTeacherData>> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                const { validData, errors, validCount, invalidCount } = validateTeachers(data);

                resolve({
                    data: validData,
                    errors,
                    fileName: file.name,
                    fileSize: file.size,
                    rowCount: data.length,
                    validRowCount: validCount,
                    invalidRowCount: invalidCount,
                });
            },
            error: (error) => {
                reject(new Error(`CSV parsing error: ${error.message}`));
            },
        });
    });
}

/**
 * Parse Excel file
 */
function parseExcel(file: File): Promise<ParsedFileData<BulkTeacherData>> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const { validData, errors, validCount, invalidCount } = validateTeachers(jsonData);

                resolve({
                    data: validData,
                    errors,
                    fileName: file.name,
                    fileSize: file.size,
                    rowCount: jsonData.length,
                    validRowCount: validCount,
                    invalidRowCount: invalidCount,
                });
            } catch (error) {
                reject(new Error('Failed to parse Excel file'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsBinaryString(file);
    });
}

/**
 * Validate teacher data
 */
function validateTeachers(data: any[]): {
    validData: BulkTeacherData[];
    errors: ValidationError[];
    validCount: number;
    invalidCount: number;
} {
    const validData: BulkTeacherData[] = [];
    const errors: ValidationError[] = [];
    let validCount = 0;
    let invalidCount = 0;

    data.forEach((row, index) => {
        const rowNumber = index + 2; // +2 for header and 0-index
        const rowErrors: ValidationError[] = [];

        // Auto-normalize data before validation
        const normalizedRow = {
            ...row,
            title: normalizeTitle(row.title),
            firstName: row.firstName?.toString().trim() || '',
            middleName: row.middleName?.toString().trim() || '',
            lastName: row.lastName?.toString().trim() || '',
            email: row.email?.toString().trim().toLowerCase() || '',
            gender: normalizeGender(row.gender),
            employeeId: row.employeeId?.toString().trim() || '',
            department: normalizeDepartment(row.department),
            role: normalizeRole(row.role),
            teacherType: normalizeTeacherType(row.teacherType),
            subjects: row.subjects?.toString().trim() || '',
            classes: row.classes?.toString().trim() || '',
        };

        // Check required fields
        REQUIRED_COLUMNS.forEach(field => {
            if (!normalizedRow[field] || normalizedRow[field].toString().trim() === '') {
                rowErrors.push({
                    row: rowNumber,
                    field,
                    value: '',
                    message: 'Required field is missing',
                });
            }
        });

        // Validate Email
        if (normalizedRow.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedRow.email)) {
            rowErrors.push({
                row: rowNumber,
                field: 'email',
                value: normalizedRow.email,
                message: 'Invalid email format',
            });
        }

        // Validate Gender (after normalization)
        if (normalizedRow.gender && !['male', 'female'].includes(normalizedRow.gender.toLowerCase())) {
            rowErrors.push({
                row: rowNumber,
                field: 'gender',
                value: row.gender, // Show original value in error
                message: 'Gender must be "male" or "female" (or M/F)',
            });
        }

        // Validate Role (after normalization)
        if (normalizedRow.role && !['teacher', 'headteacher', 'deputy_headteacher'].includes(normalizedRow.role.toLowerCase())) {
            rowErrors.push({
                row: rowNumber,
                field: 'role',
                value: row.role, // Show original value in error
                message: 'Role must be "teacher", "headteacher", or "deputy_headteacher"',
            });
        }

        // Validate Teacher Type (after normalization)
        if (normalizedRow.teacherType && !['permanent', 'temporary', 'tp'].includes(normalizedRow.teacherType.toLowerCase())) {
            rowErrors.push({
                row: rowNumber,
                field: 'teacherType',
                value: row.teacherType, // Show original value in error
                message: 'Teacher type must be "permanent", "temporary", or "tp"',
            });
        }

        if (rowErrors.length > 0) {
            errors.push(...rowErrors);
            invalidCount++;
        } else {
            validData.push({
                title: normalizedRow.title,
                firstName: normalizedRow.firstName,
                middleName: normalizedRow.middleName,
                lastName: normalizedRow.lastName,
                email: normalizedRow.email,
                gender: normalizedRow.gender.toLowerCase() as 'male' | 'female',
                employeeId: normalizedRow.employeeId,
                department: normalizedRow.department,
                role: normalizedRow.role.toLowerCase() as 'teacher' | 'headteacher' | 'deputy_headteacher',
                teacherType: (normalizedRow.teacherType || 'permanent').toLowerCase() as 'permanent' | 'temporary' | 'tp',
                subjects: normalizedRow.subjects,
                classes: normalizedRow.classes,
            });
            validCount++;
        }
    });

    return { validData, errors, validCount, invalidCount };
}
