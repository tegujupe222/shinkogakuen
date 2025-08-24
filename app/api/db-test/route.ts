import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
    try {
        // 環境変数の確認
        const envCheck = {
            POSTGRES_URL: !!process.env.POSTGRES_URL,
            POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
            DATABASE_URL: !!process.env.DATABASE_URL,
        };

        // データベース接続テスト
        const result = await sql`SELECT 1 as test`;
        
        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            envCheck,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Database connection failed:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            envCheck: {
                POSTGRES_URL: !!process.env.POSTGRES_URL,
                POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
                DATABASE_URL: !!process.env.DATABASE_URL,
            }
        }, { status: 500 });
    }
}
