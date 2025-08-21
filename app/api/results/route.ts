import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 全個人結果を取得
export async function GET(request: NextRequest) {
    try {
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
            SELECT 
                id, 
                exam_no, 
                name, 
                application_type,
                gender,
                middle_school,
                accepted_course,
                created_at, 
                updated_at
            FROM student_results 
            ORDER BY exam_no ASC
        `;

        return NextResponse.json({
            success: true,
            results: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Failed to fetch student results:', error);
        return NextResponse.json(
            { error: '個人結果一覧の取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 全個人結果を削除
export async function DELETE(request: NextRequest) {
    try {
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

        // 削除前の件数を取得
        const countResult = await sql`SELECT COUNT(*) as count FROM student_results`;
        const count = parseInt(countResult.rows[0].count);

        if (count === 0) {
            return NextResponse.json(
                { error: '削除する個人結果がありません' },
                { status: 404 }
            );
        }

        // 全個人結果を削除
        await sql`DELETE FROM student_results`;

        return NextResponse.json({
            success: true,
            message: `${count}件の個人結果を削除しました`,
            deletedCount: count
        });

    } catch (error) {
        console.error('Failed to delete all student results:', error);
        return NextResponse.json(
            { error: '個人結果の全削除に失敗しました' },
            { status: 500 }
        );
    }
}
