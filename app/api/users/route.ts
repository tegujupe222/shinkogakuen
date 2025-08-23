import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

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

// ユーザーを作成
export async function POST(request: NextRequest) {
    try {
        const { exam_no, password, role } = await request.json();

        // 入力値の検証
        if (!exam_no || !password || !role) {
            return NextResponse.json(
                { error: '受験番号、パスワード、ロールは必須です' },
                { status: 400 }
            );
        }

        // 受験番号の形式チェック（4桁の数字）
        if (!/^\d{4}$/.test(exam_no)) {
            return NextResponse.json(
                { error: '受験番号は4桁の数字で入力してください' },
                { status: 400 }
            );
        }

        // パスワードの形式チェック（4桁の数字）
        if (!/^\d{4}$/.test(password)) {
            return NextResponse.json(
                { error: 'パスワードは4桁の数字で入力してください' },
                { status: 400 }
            );
        }

        // ロールの検証
        if (!['student', 'admin'].includes(role)) {
            return NextResponse.json(
                { error: 'ロールはstudentまたはadminで指定してください' },
                { status: 400 }
            );
        }

        // 既存ユーザーの確認
        const existingUser = await sql`
            SELECT exam_no FROM users WHERE exam_no = ${exam_no}
        `;

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: 'この受験番号は既に使用されています' },
                { status: 409 }
            );
        }

        // パスワードをハッシュ化
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // ユーザーを作成
        const result = await sql`
            INSERT INTO users (exam_no, password_hash, phone_last4, name, role, created_at, updated_at)
            VALUES (${exam_no}, ${hashedPassword}, ${password}, ${exam_no}, ${role}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, exam_no, name, role, created_at
        `;

        return NextResponse.json({
            success: true,
            message: 'ユーザーを作成しました',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json(
            { error: 'ユーザーの作成に失敗しました' },
            { status: 500 }
        );
    }
}
