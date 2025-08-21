import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 全ユーザー一覧を取得
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

        const result = await sql`
            SELECT 
                id, 
                exam_no, 
                email, 
                name, 
                role, 
                phone_last4, 
                created_at, 
                updated_at
            FROM users 
            ORDER BY 
                CASE WHEN role = 'admin' THEN 0 ELSE 1 END,
                exam_no ASC
        `;

        return NextResponse.json({
            success: true,
            users: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json(
            { error: 'ユーザー一覧の取得に失敗しました' },
            { status: 500 }
        );
    }
}
