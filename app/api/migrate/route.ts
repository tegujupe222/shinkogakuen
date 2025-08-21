import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

// パスワードハッシュ化関数
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
    try {
        // usersテーブルにexam_noカラムを追加
        await sql`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS exam_no VARCHAR(4) UNIQUE
        `;

        // usersテーブルにphone_last4カラムを追加
        await sql`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_last4 VARCHAR(4)
        `;

        // usersテーブルにupdated_atカラムを追加
        await sql`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        `;

        // 既存の管理者アカウントにexam_noを設定
        await sql`
            UPDATE users 
            SET exam_no = '0000', 
                updated_at = CURRENT_TIMESTAMP 
            WHERE email = 'admin@example.com' AND exam_no IS NULL
        `;

        // 新しい管理者アカウントを追加
        await sql`
            INSERT INTO users (exam_no, password_hash, email, name, role, created_at, updated_at)
            VALUES ('9999', ${hashPassword('5896')}, 'admin@shinko.edu.jp', '管理者', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (exam_no) DO NOTHING
        `;

        return NextResponse.json({
            success: true,
            message: 'Database migration completed successfully'
        });
    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json(
            { error: 'Migration failed', details: error },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // マイグレーション状態を確認
        const result = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `;
        
        return NextResponse.json({
            success: true,
            columns: result.rows
        });
    } catch (error) {
        console.error('Migration check failed:', error);
        return NextResponse.json(
            { error: 'Migration check failed', details: error },
            { status: 500 }
        );
    }
}
