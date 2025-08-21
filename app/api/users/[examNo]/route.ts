import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 特定の学生アカウントを削除
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

        // 管理者アカウント（9999）は削除不可
        if (examNo === '9999') {
            return NextResponse.json(
                { error: '管理者アカウントは削除できません' },
                { status: 403 }
            );
        }

        // ユーザーが存在するかチェック
        const existingUser = await sql`
            SELECT id, exam_no, name, role FROM users WHERE exam_no = ${examNo}
        `;

        if (existingUser.rows.length === 0) {
            return NextResponse.json(
                { error: '指定されたアカウントが見つかりません' },
                { status: 404 }
            );
        }

        const user = existingUser.rows[0];

        // 管理者アカウントは削除不可
        if (user.role === 'admin') {
            return NextResponse.json(
                { error: '管理者アカウントは削除できません' },
                { status: 403 }
            );
        }

        // 関連データも削除（プロフィール、合格証書）
        await sql`DELETE FROM profiles WHERE student_id = ${examNo}`;
        await sql`DELETE FROM certificates WHERE student_id = ${examNo}`;
        
        // ユーザーアカウントを削除
        await sql`DELETE FROM users WHERE exam_no = ${examNo}`;

        return NextResponse.json({
            success: true,
            message: `アカウント ${examNo} (${user.name}) を削除しました`,
            deletedUser: {
                exam_no: user.exam_no,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Failed to delete user:', error);
        return NextResponse.json(
            { error: 'アカウントの削除に失敗しました' },
            { status: 500 }
        );
    }
}

// 特定の学生アカウント情報を取得
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ examNo: string }> }
) {
    try {
        const { examNo } = await params;

        const result = await sql`
            SELECT id, exam_no, email, name, role, phone_last4, created_at, updated_at 
            FROM users 
            WHERE exam_no = ${examNo}
        `;

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'アカウントが見つかりません' },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return NextResponse.json(
            { error: 'アカウント情報の取得に失敗しました' },
            { status: 500 }
        );
    }
}
