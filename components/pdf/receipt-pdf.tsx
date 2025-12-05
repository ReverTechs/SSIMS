import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Professional styling for receipt PDF - Optimized for single page
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    watermark: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: 60,
        color: '#10b981',
        opacity: 0.08,
        fontWeight: 'bold',
    },
    header: {
        marginBottom: 12,
        borderBottom: '2 solid #10b981',
        paddingBottom: 10,
        backgroundColor: '#f0fdf4',
        padding: 12,
        marginHorizontal: -15,
        marginTop: -15,
    },
    schoolName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#047857',
        marginBottom: 3,
    },
    schoolInfo: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 1,
    },
    receiptTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#059669',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    receiptNumber: {
        fontSize: 11,
        color: '#047857',
        textAlign: 'center',
        marginBottom: 3,
        fontWeight: 'bold',
    },
    paidStamp: {
        position: 'absolute',
        top: 70,
        right: 30,
        padding: 10,
        border: '3 solid #10b981',
        borderRadius: 6,
        transform: 'rotate(-15deg)',
    },
    paidText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10b981',
    },
    section: {
        marginBottom: 10,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#047857',
        marginBottom: 6,
        backgroundColor: '#f0fdf4',
        padding: 5,
        borderLeft: '3 solid #10b981',
        paddingLeft: 8,
    },
    infoBox: {
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 3,
        border: '1 solid #e2e8f0',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: '40%',
        fontSize: 9,
        color: '#64748b',
    },
    value: {
        width: '60%',
        fontSize: 9,
        color: '#1e293b',
        fontWeight: 'bold',
    },
    amountBox: {
        backgroundColor: '#dcfce7',
        border: '2 solid #10b981',
        borderRadius: 6,
        padding: 12,
        marginTop: 10,
        marginBottom: 10,
    },
    amountLabel: {
        fontSize: 10,
        color: '#047857',
        marginBottom: 3,
        textAlign: 'center',
    },
    amountValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#047857',
        textAlign: 'center',
    },
    amountWords: {
        fontSize: 8,
        color: '#059669',
        textAlign: 'center',
        marginTop: 3,
        fontStyle: 'italic',
    },
    paymentDetails: {
        backgroundColor: '#ffffff',
        border: '1 solid #e2e8f0',
        borderRadius: 3,
        padding: 10,
        marginBottom: 8,
    },
    signature: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '45%',
    },
    signatureLine: {
        borderTop: '1 solid #94a3b8',
        marginTop: 25,
        paddingTop: 4,
    },
    signatureLabel: {
        fontSize: 8,
        color: '#64748b',
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 30,
        right: 30,
        borderTop: '1.5 solid #10b981',
        paddingTop: 8,
    },
    footerText: {
        fontSize: 7,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 2,
    },
    disclaimer: {
        marginTop: 10,
        padding: 8,
        backgroundColor: '#fef3c7',
        border: '1 solid #fbbf24',
        borderRadius: 3,
    },
    disclaimerText: {
        fontSize: 7,
        color: '#92400e',
        textAlign: 'center',
        lineHeight: 1.3,
    },
});

interface ReceiptData {
    receipt_number: string;
    payment_number: string;
    invoice_number: string;
    payment_date: string;
    amount: number;
    payment_method: string;
    reference_number?: string;
    student: {
        student_id: string;
        full_name: string;
        class_name: string;
    };
    academic_year: string;
    term: string;
    invoice_balance_before: number;
    invoice_balance_after: number;
    recorded_by: string;
}

export const ReceiptPDF: React.FC<{ data: ReceiptData }> = ({ data }) => {
    const formatCurrency = (amount: number) => {
        return `MK ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const numberToWords = (num: number): string => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        if (num === 0) return 'Zero';

        const convert = (n: number): string => {
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
            if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
            return convert(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + convert(n % 1000000) : '');
        };

        const kwacha = Math.floor(num);
        const tambala = Math.round((num - kwacha) * 100);

        let result = convert(kwacha) + ' Kwacha';
        if (tambala > 0) {
            result += ' and ' + convert(tambala) + ' Tambala';
        }
        return result + ' Only';
    };

    const getPaymentMethodDisplay = (method: string) => {
        const methods: { [key: string]: string } = {
            cash: 'Cash',
            bank_transfer: 'Bank Transfer',
            mobile_money: 'Mobile Money',
            cheque: 'Cheque',
            card: 'Card Payment',
        };
        return methods[method] || method;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Watermark */}
                <Text style={styles.watermark}>PAID</Text>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.schoolName}>Wynberg Boys' High School</Text>
                    <Text style={styles.schoolInfo}>P.O. Box 123, Lilongwe, Malawi</Text>
                    <Text style={styles.schoolInfo}>Tel: +265 1 234 567 | Email: finance@ssims.ac.mw</Text>
                </View>

                {/* PAID Stamp */}
                <View style={styles.paidStamp}>
                    <Text style={styles.paidText}>PAID</Text>
                </View>

                {/* Receipt Title */}
                <View>
                    <Text style={styles.receiptTitle}>OFFICIAL RECEIPT</Text>
                    <Text style={styles.receiptNumber}>{data.receipt_number}</Text>
                    <Text style={{ fontSize: 9, color: '#64748b', textAlign: 'center', marginBottom: 10 }}>
                        Payment Reference: {data.payment_number}
                    </Text>
                </View>

                {/* Student Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>RECEIVED FROM</Text>
                    <View style={styles.infoBox}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Student Name:</Text>
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
                        <View style={styles.row}>
                            <Text style={styles.label}>Academic Year:</Text>
                            <Text style={styles.value}>{data.academic_year}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Term:</Text>
                            <Text style={styles.value}>{data.term}</Text>
                        </View>
                    </View>
                </View>

                {/* Amount */}
                <View style={styles.amountBox}>
                    <Text style={styles.amountLabel}>AMOUNT RECEIVED</Text>
                    <Text style={styles.amountValue}>{formatCurrency(data.amount)}</Text>
                    <Text style={styles.amountWords}>{numberToWords(data.amount)}</Text>
                </View>

                {/* Payment Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PAYMENT DETAILS</Text>
                    <View style={styles.paymentDetails}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Payment Date:</Text>
                            <Text style={styles.value}>{formatDate(data.payment_date)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Payment Method:</Text>
                            <Text style={styles.value}>{getPaymentMethodDisplay(data.payment_method)}</Text>
                        </View>
                        {data.reference_number && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Reference Number:</Text>
                                <Text style={styles.value}>{data.reference_number}</Text>
                            </View>
                        )}
                        <View style={styles.row}>
                            <Text style={styles.label}>Invoice Number:</Text>
                            <Text style={styles.value}>{data.invoice_number}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Previous Balance:</Text>
                            <Text style={styles.value}>{formatCurrency(data.invoice_balance_before)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>New Balance:</Text>
                            <Text style={[styles.value, { color: data.invoice_balance_after === 0 ? '#10b981' : '#f59e0b' }]}>
                                {formatCurrency(data.invoice_balance_after)}
                                {data.invoice_balance_after === 0 && ' (FULLY PAID)'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimer}>
                    <Text style={styles.disclaimerText}>
                        This receipt is valid only when stamped and signed by an authorized school official.
                        Please retain this receipt for your records.
                    </Text>
                </View>

                {/* Signatures */}
                <View style={styles.signature}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine}>
                            <Text style={styles.signatureLabel}>Received By</Text>
                            <Text style={{ fontSize: 8, color: '#64748b', textAlign: 'center', marginTop: 2 }}>
                                {data.recorded_by}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine}>
                            <Text style={styles.signatureLabel}>Authorized Signature</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Thank you for your payment. Keep this receipt for your records.
                    </Text>
                    <Text style={styles.footerText}>
                        For any queries, please contact the Finance Office during working hours.
                    </Text>
                    <Text style={styles.footerText}>
                        Generated on {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB')}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};
