import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 特定の学生の個人結果を取得
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ examNo: string }> }
) {
    try {
        const { examNo } = await params;

        // データベース接続チェック
        if (!process.env.POSTGRES_URL) {
            return NextResponse.json(
                { 
                    error: 'データベースが設定されていません。',
                    details: 'POSTGRES_URL environment variable is not set'
                },
                { status: 503 }
            );
        }

        // テーブル存在チェック
        try {
            const tableCheck = await sql`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'student_results'
                );
            `;
            
            if (!tableCheck.rows[0]?.exists) {
                return NextResponse.json(
                    { 
                        error: 'student_resultsテーブルが存在しません。',
                        details: 'Please run /api/migrate first'
                    },
                    { status: 503 }
                );
            }
        } catch (error) {
            console.error('Table check failed:', error);
            return NextResponse.json(
                { error: 'データベース接続エラーが発生しました' },
                { status: 500 }
            );
        }

        const result = await sql`
            SELECT * FROM student_results 
            WHERE exam_no = ${examNo}
        `;

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: '個人結果が見つかりません' },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to fetch student result:', error);
        return NextResponse.json(
            { error: '個人結果の取得に失敗しました' },
            { status: 500 }
        );
    }
}
