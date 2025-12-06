import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToStream } from '@react-pdf/renderer';
import { StudentListPdf } from '@/components/pdf/student-list-pdf';
import { getStudentManagementList } from '@/app/actions/get-student-management-data';
import React from 'react';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('query') || undefined;
        const grade = searchParams.get('grade') || undefined;
        const status = searchParams.get('status') || undefined;

        const supabase = await createClient();

        // Auth Check
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch Data (High limit for export)
        const students = await getStudentManagementList(search, grade, status, 1000);

        // Render PDF
        const pdfElement = React.createElement(StudentListPdf, {
            students,
            filters: { search, grade, status }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stream = await renderToStream(pdfElement as any);

        // Stream to Buffer
        const chunks: Buffer[] = [];
        for await (const chunk of stream as AsyncIterable<Buffer>) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="student_list_export.pdf"`,
            },
        });

    } catch (error) {
        console.error('Error exporting student list:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
