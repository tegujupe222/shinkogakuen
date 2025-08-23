import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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

        // 削除対象の学生アカウント数を取得
        const studentCountResult = await sql`
            SELECT COUNT(*) as count FROM users WHERE role = 'student'
        `;
        const studentCount = parseInt(studentCountResult.rows[0].count);

        if (studentCount === 0) {
            return NextResponse.json({
                success: true,
                message: '削除対象の学生アカウントがありません',
                deletedCount: 0
            });
        }

        // 学生アカウントの受験番号を取得
        const studentExamNos = await sql`
            SELECT exam_no FROM users WHERE role = 'student'
        `;

        // 関連データを削除
        for (const row of studentExamNos.rows) {
            const examNo = row.exam_no;
            
            // プロフィールデータを削除
            await sql`DELETE FROM student_profiles WHERE student_id = ${examNo}`;
            
            // 合格証書データを削除
            await sql`DELETE FROM certificates WHERE student_id = ${examNo}`;
            
            // 個人結果データを削除
            await sql`DELETE FROM student_results WHERE exam_no = ${examNo}`;
            
            // 免除割り当てデータを削除
            await sql`DELETE FROM student_exemption_assignments WHERE student_id = ${examNo}`;
        }

        // 学生アカウントを削除
        const deleteResult = await sql`
            DELETE FROM users WHERE role = 'student'
        `;

        return NextResponse.json({
            success: true,
            message: `学生アカウント ${studentCount}件 を削除しました`,
            deletedCount: studentCount
        });

    } catch (error) {
        console.error('Failed to delete all students:', error);
        return NextResponse.json(
            { error: '学生全削除に失敗しました' },
            { status: 500 }
        );
    }
}
