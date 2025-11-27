import { z } from 'zod';

/**
 * Zod validation schema for bulk student registration
 * Validates CSV/Excel row data before database insertion
 */

// Email validation with proper format
const emailSchema = z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .toLowerCase()
    .trim();

// Date validation (YYYY-MM-DD format)
const dateSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime()) && parsed < new Date();
    }, 'Invalid date or future date not allowed');

// Gender validation
const genderSchema = z.enum(['male', 'female'], {
    message: 'Gender must be either "male" or "female"'
});

// Student type validation
const studentTypeSchema = z.enum(['internal', 'external'], {
    message: 'Student type must be either "internal" or "external"'
});

// Student ID validation (alphanumeric, 6-20 characters)
const studentIdSchema = z.string()
    .min(6, 'Student ID must be at least 6 characters')
    .max(20, 'Student ID must not exceed 20 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Student ID must be alphanumeric')
    .trim();

// Name validation (letters, spaces, hyphens, apostrophes)
const nameSchema = z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[A-Za-z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim();

// Optional name validation
const optionalNameSchema = z.string()
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[A-Za-z\s'-]*$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim()
    .optional()
    .or(z.literal(''));

// Phone number validation (Malawi format: +265 or 0, followed by 9 digits)
const phoneSchema = z.string()
    .regex(/^(\+265|0)?[1-9]\d{8}$/, 'Invalid phone number format (use Malawi format: +265XXXXXXXXX or 0XXXXXXXXX)')
    .trim()
    .optional()
    .or(z.literal(''));

// Address validation
const addressSchema = z.string()
    .max(500, 'Address must not exceed 500 characters')
    .trim()
    .optional()
    .or(z.literal(''));

// Class name validation
const classNameSchema = z.string()
    .min(1, 'Class name is required')
    .max(50, 'Class name must not exceed 50 characters')
    .trim();

/**
 * Main validation schema for a single student record
 */
export const bulkStudentSchema = z.object({
    firstName: nameSchema,
    middleName: optionalNameSchema,
    lastName: nameSchema,
    email: emailSchema,
    gender: genderSchema,
    dateOfBirth: dateSchema,
    studentId: studentIdSchema,
    studentType: studentTypeSchema,
    className: classNameSchema,
    guardianEmail: emailSchema,
    address: addressSchema,
    phoneNumber: phoneSchema,
});

/**
 * Array validation for bulk upload
 */
export const bulkStudentArraySchema = z.array(bulkStudentSchema);

/**
 * Type inference from schema
 */
export type BulkStudentSchemaType = z.infer<typeof bulkStudentSchema>;

/**
 * Validate a single student record and return detailed errors
 */
export function validateStudentRecord(data: any, rowNumber: number) {
    const result = bulkStudentSchema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map((err: any) => ({
            row: rowNumber,
            field: err.path.join('.'),
            value: data[err.path[0]],
            message: err.message,
        }));
        return { isValid: false, errors };
    }

    return { isValid: true, data: result.data, errors: [] };
}

/**
 * Validate array of student records
 */
export function validateBulkStudentData(data: any[]) {
    // Handle null/undefined input
    if (!data || !Array.isArray(data)) {
        return {
            validRecords: [],
            errors: [],
            validCount: 0,
            invalidCount: 0,
        };
    }

    const validRecords: BulkStudentSchemaType[] = [];
    const errors: Array<{ row: number; field: string; value: any; message: string }> = [];

    data.forEach((record, index) => {
        const rowNumber = index + 2; // +2 because row 1 is headers, and arrays are 0-indexed
        const validation = validateStudentRecord(record, rowNumber);

        if (validation.isValid && validation.data) {
            validRecords.push(validation.data);
        } else {
            errors.push(...validation.errors);
        }
    });

    return {
        validRecords,
        errors,
        validCount: validRecords.length,
        invalidCount: errors.length,
    };
}

/**
 * CSV/Excel header mapping
 * Maps common header variations to our schema fields
 */
export const headerMapping: Record<string, string> = {
    'first name': 'firstName',
    'firstname': 'firstName',
    'first_name': 'firstName',
    'middle name': 'middleName',
    'middlename': 'middleName',
    'middle_name': 'middleName',
    'last name': 'lastName',
    'lastname': 'lastName',
    'last_name': 'lastName',
    'surname': 'lastName',
    'email': 'email',
    'email address': 'email',
    'gender': 'gender',
    'sex': 'gender',
    'date of birth': 'dateOfBirth',
    'dob': 'dateOfBirth',
    'birth date': 'dateOfBirth',
    'birthdate': 'dateOfBirth',
    'date_of_birth': 'dateOfBirth',
    'student id': 'studentId',
    'studentid': 'studentId',
    'student_id': 'studentId',
    'id': 'studentId',
    'student type': 'studentType',
    'studenttype': 'studentType',
    'student_type': 'studentType',
    'type': 'studentType',
    'class': 'className',
    'class name': 'className',
    'classname': 'className',
    'class_name': 'className',
    'form': 'className',
    'guardian email': 'guardianEmail',
    'guardianemail': 'guardianEmail',
    'guardian_email': 'guardianEmail',
    'parent email': 'guardianEmail',
    'address': 'address',
    'phone': 'phoneNumber',
    'phone number': 'phoneNumber',
    'phonenumber': 'phoneNumber',
    'phone_number': 'phoneNumber',
    'contact': 'phoneNumber',
};

/**
 * Normalize CSV/Excel headers to match our schema
 */
export function normalizeHeaders(headers: string[]): string[] {
    return headers.map(header => {
        const normalized = header.toLowerCase().trim();
        return headerMapping[normalized] || header;
    });
}
