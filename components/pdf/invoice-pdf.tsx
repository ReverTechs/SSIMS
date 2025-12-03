import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Professional styling for invoice PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    header: {
        marginBottom: 30,
        borderBottom: '2 solid #2563eb',
        paddingBottom: 20,
    },
    schoolName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 5,
    },
    schoolInfo: {
        fontSize: 9,
        color: '#64748b',
        marginBottom: 2,
    },
    invoiceTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginTop: 20,
        marginBottom: 10,
    },
    invoiceNumber: {
        fontSize: 12,
        color: '#475569',
        marginBottom: 5,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 10,
        borderBottom: '1 solid #e2e8f0',
        paddingBottom: 5,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: '30%',
        fontSize: 10,
        color: '#64748b',
    },
    value: {
        width: '70%',
        fontSize: 10,
        color: '#1e293b',
        fontWeight: 'bold',
    },
    table: {
        marginTop: 20,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1e40af',
        padding: 10,
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1 solid #e2e8f0',
        padding: 10,
        fontSize: 10,
    },
    tableRowAlt: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderBottom: '1 solid #e2e8f0',
        padding: 10,
        fontSize: 10,
    },
    col1: { width: '10%' },
    col2: { width: '40%' },
    col3: { width: '15%', textAlign: 'right' },
    col4: { width: '15%', textAlign: 'right' },
    col5: { width: '20%', textAlign: 'right' },
    summary: {
        marginTop: 20,
        marginLeft: 'auto',
        width: '50%',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 10,
    },
    summaryLabel: {
        fontSize: 10,
        color: '#64748b',
    },
    summaryValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#1e40af',
        color: '#ffffff',
        padding: 12,
        marginTop: 5,
        borderRadius: 4,
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTop: '1 solid #e2e8f0',
        paddingTop: 15,
    },
    footerText: {
        fontSize: 8,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 3,
    },
    statusBadge: {
        position: 'absolute',
        top: 40,
        right: 40,
        padding: 10,
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusPaid: {
        backgroundColor: '#10b981',
        color: '#ffffff',
    },
    statusUnpaid: {
        backgroundColor: '#ef4444',
        color: '#ffffff',
    },
    statusPartial: {
        backgroundColor: '#f59e0b',
        color: '#ffffff',
    },
    statusOverdue: {
        backgroundColor: '#dc2626',
        color: '#ffffff',
    },
    notes: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f8fafc',
        borderLeft: '3 solid #3b82f6',
    },
    notesTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 5,
    },
    notesText: {
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.5,
    },
});

interface InvoiceItem {
    item_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
}

interface InvoiceData {
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    status: string;
    student: {
        student_id: string;
        full_name: string;
        class_name: string;
    };
    academic_year: string;
    term: string;
    items: InvoiceItem[];
    total_amount: number;
    amount_paid: number;
    balance: number;
    notes?: string;
}

export const InvoicePDF: React.FC<{ data: InvoiceData }> = ({ data }) => {
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return styles.statusPaid;
            case 'unpaid':
                return styles.statusUnpaid;
            case 'partial':
                return styles.statusPartial;
            case 'overdue':
                return styles.statusOverdue;
            default:
                return styles.statusUnpaid;
        }
    };

    const formatCurrency = (amount: number) => {
        return `MK ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.schoolName}>
                        Wynberg Boys' High School</Text>
                    <Text style={styles.schoolInfo}>P.O. Box 123, Lilongwe, Malawi</Text>
                    <Text style={styles.schoolInfo}>Tel: +265 1 234 567 | Email: info@ssims.ac.mw</Text>
                </View>

                {/* Status Badge */}
                <View style={[styles.statusBadge, getStatusStyle(data.status)]}>
                    <Text>{data.status.toUpperCase()}</Text>
                </View>

                {/* Invoice Title */}
                <View>
                    <Text style={styles.invoiceTitle}>INVOICE</Text>
                    <Text style={styles.invoiceNumber}>{data.invoice_number}</Text>
                </View>

                {/* Student & Invoice Info */}
                <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20 }}>
                    <View style={{ width: '50%' }}>
                        <Text style={styles.sectionTitle}>BILL TO</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Student:</Text>
                            <Text style={styles.value}>{data.student.full_name}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Student ID:</Text>
                            <Text style={styles.value}>{data.student.student_id}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Class:</Text>
                            <Text style={styles.value}>{data.student.class_name}</Text>
                        </View>
                    </View>
                    <View style={{ width: '50%' }}>
                        <Text style={styles.sectionTitle}>INVOICE DETAILS</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Academic Year:</Text>
                            <Text style={styles.value}>{data.academic_year}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Term:</Text>
                            <Text style={styles.value}>{data.term}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Invoice Date:</Text>
                            <Text style={styles.value}>{formatDate(data.invoice_date)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Due Date:</Text>
                            <Text style={styles.value}>{formatDate(data.due_date)}</Text>
                        </View>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>#</Text>
                        <Text style={styles.col2}>Description</Text>
                        <Text style={styles.col3}>Qty</Text>
                        <Text style={styles.col4}>Unit Price</Text>
                        <Text style={styles.col5}>Amount</Text>
                    </View>
                    {data.items.map((item, index) => (
                        <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                            <Text style={styles.col1}>{index + 1}</Text>
                            <View style={styles.col2}>
                                <Text style={{ fontWeight: 'bold' }}>{item.item_name}</Text>
                                {item.description && (
                                    <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>
                                        {item.description}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.col3}>{item.quantity}</Text>
                            <Text style={styles.col4}>{formatCurrency(item.unit_price)}</Text>
                            <Text style={styles.col5}>{formatCurrency(item.total_amount)}</Text>
                        </View>
                    ))}
                </View>

                {/* Summary */}
                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal:</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(data.total_amount)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Amount Paid:</Text>
                        <Text style={[styles.summaryValue, { color: '#10b981' }]}>
                            {formatCurrency(data.amount_paid)}
                        </Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Balance Due:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(data.balance)}</Text>
                    </View>
                </View>

                {/* Notes */}
                {data.notes && (
                    <View style={styles.notes}>
                        <Text style={styles.notesTitle}>Notes:</Text>
                        <Text style={styles.notesText}>{data.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Thank you for your payment. For inquiries, contact the Finance Office.
                    </Text>
                    <Text style={styles.footerText}>
                        This is a computer-generated invoice and does not require a signature.
                    </Text>
                    <Text style={styles.footerText}>
                        Generated on {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB')}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};
