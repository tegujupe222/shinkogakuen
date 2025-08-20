import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
    try {
        // documentsテーブルにdescriptionカラムを追加
        await sql`
            ALTER TABLE documents 
            ADD COLUMN IF NOT EXISTS description TEXT
        `;

        // documentsテーブルにcreated_atカラムを追加
        await sql`
            ALTER TABLE documents 
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        `;

        // documentsテーブルにupdated_atカラムを追加
        await sql`
            ALTER TABLE documents 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        `;

        return NextResponse.json({
            success: true,
            message: 'データベーススキーマを更新しました'
        });

    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json(
            { error: 'マイグレーションに失敗しました' },
            { status: 500 }
        );
    }
}
