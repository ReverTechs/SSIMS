import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { BulkStudentData, ParsedFileData, ValidationError, FileType, FileValidation } from '@/types/bulk-upload-types';
import { validateBulkStudentData, normalizeHeaders } from '@/lib/validation/student-bulk-validation';

/**
 * File size limit (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Allowed file types
 */
const ALLOWED_TYPES = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

/**
 * Validate file before parsing
 */
export function validateFile(file: File): FileValidation {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        };
    }

    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return {
            isValid: false,
            error: `Invalid file type. Allowed types: CSV, XLSX, XLS`,
        };
    }

    // Determine file type
    let fileType: FileType;
    if (extension === '.csv') {
        fileType = 'csv';
    } else if (extension === '.xlsx') {
        fileType = 'xlsx';
    } else {
        fileType = 'xls';
    }

    return {
        isValid: true,
        fileType,
    };
}

/**
 * Parse CSV file using papaparse
 */
export async function parseCSVFile(file: File): Promise<ParsedFileData> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => {
                // Normalize headers to match our schema
                const normalized = normalizeHeaders([header])[0];
                return normalized;
            },
            transform: (value) => {
                // Trim whitespace from all values
                return value.trim();
            },
            complete: (results) => {
                try {
                    // Check if results and data exist
                    if (!results || !results.data) {
                        reject(new Error('CSV file is empty or invalid'));
                        return;
                    }

                    const rawData = results.data as any[];

                    // Check if we have any data
                    if (!Array.isArray(rawData) || rawData.length === 0) {
                        reject(new Error('CSV file contains no data rows'));
                        return;
                    }

                    // Filter out completely empty rows
                    const nonEmptyData = rawData.filter(row => {
                        // Check if row has at least one non-empty value
                        return Object.values(row).some(val => val !== '' && val !== null && val !== undefined);
                    });

                    if (nonEmptyData.length === 0) {
                        reject(new Error('CSV file contains no valid data'));
                        return;
                    }

                    // Validate data
                    const validation = validateBulkStudentData(nonEmptyData);

                    const parsedData: ParsedFileData = {
                        data: validation.validRecords as BulkStudentData[],
                        errors: validation.errors,
                        fileName: file.name,
                        fileSize: file.size,
                        rowCount: nonEmptyData.length,
                        validRowCount: validation.validCount,
                        invalidRowCount: validation.invalidCount,
                    };

                    resolve(parsedData);
                } catch (error) {
                    reject(new Error(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`));
                }
            },
            error: (error) => {
                reject(new Error(`CSV parsing error: ${error.message}`));
            },
        });
    });
}

/**
 * Parse Excel file using xlsx
 */
export async function parseExcelFile(file: File): Promise<ParsedFileData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    reject(new Error('Failed to read file'));
                    return;
                }

                // Parse Excel file
                const workbook = XLSX.read(data, { type: 'binary' });

                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                if (!sheetName) {
                    reject(new Error('Excel file is empty'));
                    return;
                }

                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON with header row
                const rawData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false, // Get formatted strings
                    defval: '', // Default value for empty cells
                });

                // Check if we have any data
                if (!Array.isArray(rawData) || rawData.length === 0) {
                    reject(new Error('Excel file contains no data rows'));
                    return;
                }

                // Normalize headers
                const normalizedData = rawData.map((row: any) => {
                    const normalizedRow: any = {};
                    Object.keys(row).forEach(key => {
                        const normalizedKey = normalizeHeaders([key])[0];
                        normalizedRow[normalizedKey] = typeof row[key] === 'string' ? row[key].trim() : row[key];
                    });
                    return normalizedRow;
                });

                // Filter out completely empty rows
                const nonEmptyData = normalizedData.filter(row => {
                    return Object.values(row).some(val => val !== '' && val !== null && val !== undefined);
                });

                if (nonEmptyData.length === 0) {
                    reject(new Error('Excel file contains no valid data'));
                    return;
                }

                // Validate data
                const validation = validateBulkStudentData(nonEmptyData);

                const parsedData: ParsedFileData = {
                    data: validation.validRecords as BulkStudentData[],
                    errors: validation.errors,
                    fileName: file.name,
                    fileSize: file.size,
                    rowCount: nonEmptyData.length,
                    validRowCount: validation.validCount,
                    invalidRowCount: validation.invalidCount,
                };

                resolve(parsedData);
            } catch (error) {
                reject(new Error(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read Excel file'));
        };

        reader.readAsBinaryString(file);
    });
}

/**
 * Main file parser - automatically detects file type and uses appropriate parser
 */
export async function parseStudentFile(file: File): Promise<ParsedFileData> {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.isValid) {
        throw new Error(validation.error);
    }

    // Parse based on file type
    if (validation.fileType === 'csv') {
        return parseCSVFile(file);
    } else {
        return parseExcelFile(file);
    }
}

/**
 * Export validation errors to CSV for download
 */
export function exportErrorsToCSV(errors: ValidationError[]): string {
    const headers = ['Row', 'Field', 'Value', 'Error Message'];
    const rows = errors.map(err => [
        err.row.toString(),
        err.field,
        err.value?.toString() || '',
        err.message,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
