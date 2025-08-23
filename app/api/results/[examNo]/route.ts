import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 特定の学生の個人結果を削除
export async function DELETE(
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

        // 結果が存在するかチェック
        const existingResult = await sql`
            SELECT exam_no, name FROM student_results WHERE exam_no = ${examNo}
        `;

        if (existingResult.rows.length === 0) {
            return NextResponse.json(
                { error: '指定された個人結果が見つかりません' },
                { status: 404 }
            );
        }

        const result = existingResult.rows[0];

        // 個人結果を削除
        await sql`DELETE FROM student_results WHERE exam_no = ${examNo}`;

        return NextResponse.json({
            success: true,
            message: `個人結果 ${examNo} (${result.name}) を削除しました`,
            deletedResult: {
                exam_no: result.exam_no,
                name: result.name
            }
        });

    } catch (error) {
        console.error('Failed to delete student result:', error);
        return NextResponse.json(
            { error: '個人結果の削除に失敗しました' },
            { status: 500 }
        );
    }
}

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

// 特定の学生の個人結果を更新
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ examNo: string }> }
) {
    try {
        const { examNo } = await params;
        const body = await request.json();

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

        // 結果が存在するかチェック
        const existingResult = await sql`
            SELECT exam_no, name FROM student_results WHERE exam_no = ${examNo}
        `;

        if (existingResult.rows.length === 0) {
            return NextResponse.json(
                { error: '指定された個人結果が見つかりません' },
                { status: 404 }
            );
        }

        // 個人結果を更新
        const updatedResult = await sql`
            UPDATE student_results SET
                student_id = ${body.student_id || null},
                name = ${body.name || null},
                gender = ${body.gender || null},
                application_course = ${body.application_course || null},
                application_type = ${body.application_type || null},
                recommendation = ${body.recommendation || null},
                middle_school = ${body.middle_school || null},
                top_10_percent = ${body.top_10_percent || null},
                special_advance_top5 = ${body.special_advance_top5 || null},
                advance_top5 = ${body.advance_top5 || null},
                club_tuition_exemption = ${body.club_tuition_exemption || null},
                club_fee_exemption = ${body.club_fee_exemption || null},
                club_scholarship = ${body.club_scholarship || null},
                accepted_course = ${body.accepted_course || null},
                scholarship_student = ${body.scholarship_student || null},
                club_recommendation = ${body.club_recommendation || null},
                updated_at = CURRENT_TIMESTAMP
            WHERE exam_no = ${examNo}
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            message: `個人結果 ${examNo} を更新しました`,
            updatedResult: updatedResult.rows[0]
        });

    } catch (error) {
        console.error('Failed to update student result:', error);
        return NextResponse.json(
            { error: '個人結果の更新に失敗しました' },
            { status: 500 }
        );
    }
}
