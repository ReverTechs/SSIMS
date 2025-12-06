import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { StudentRecord } from '@/app/actions/get-student-management-data';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 10,
        color: '#666666',
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#e5e7eb',
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableColHeader: {
        width: '20%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        padding: 8,
    },
    tableCol: {
        width: '20%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#e5e7eb',
        padding: 8,
    },
    tableCellHeader: {
        margin: 'auto',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#374151',
    },
    tableCell: {
        margin: 'auto',
        fontSize: 10,
        color: '#4b5563',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 8,
    },
});

interface StudentListPdfProps {
    students: StudentRecord[];
    filters: {
        search?: string;
        grade?: string;
        status?: string;
    };
}

export function StudentListPdf({ students, filters }: StudentListPdfProps) {
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const filterText = [
        filters.grade && filters.grade !== 'all' ? `Grade: ${filters.grade}` : null,
        filters.status && filters.status !== 'all' ? `Status: ${filters.status}` : null,
    ].filter(Boolean).join(' | ');

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Student List Export</Text>
                    <Text style={styles.subtitle}>Generated on {currentDate}</Text>
                    {filterText && <Text style={styles.subtitle}>{filterText}</Text>}
                </View>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCellHeader}>Student ID</Text>
                        </View>
                        <View style={{ ...styles.tableColHeader, width: '25%' }}>
                            <Text style={styles.tableCellHeader}>Name</Text>
                        </View>
                        <View style={{ ...styles.tableColHeader, width: '15%' }}>
                            <Text style={styles.tableCellHeader}>Grade</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCellHeader}>Status</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCellHeader}>Fees</Text>
                        </View>
                    </View>

                    {students.map((student) => (
                        <View style={styles.tableRow} key={student.id}>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{student.studentId}</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '25%' }}>
                                <Text style={styles.tableCell}>{student.name}</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '15%' }}>
                                <Text style={styles.tableCell}>{student.grade}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{student.status}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{student.fees}</Text>
                            </View>
                        </View>
                    ))}

                    {students.length === 0 && (
                        <View style={styles.tableRow}>
                            <View style={{ ...styles.tableCol, width: '100%' }}>
                                <Text style={styles.tableCell}>No students found matching criteria.</Text>
                            </View>
                        </View>
                    )}
                </View>

                <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                    `Page ${pageNumber} of ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
}
