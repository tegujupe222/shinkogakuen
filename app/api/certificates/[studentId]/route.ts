import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 特定の学生の合格証書を取得
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const { studentId } = await params;

        const result = await sql`
            SELECT * FROM certificates 
            WHERE student_id = ${studentId}
            ORDER BY issued_at DESC
            LIMIT 1
        `;

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: '合格証書が見つかりません' },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to fetch certificate:', error);
        return NextResponse.json(
            { error: '合格証書の取得に失敗しました' },
            { status: 500 }
        );
    }
}
