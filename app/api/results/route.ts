import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 全個人結果を取得
export async function GET() {
    try {
        const result = await sql`
            SELECT * FROM student_results 
            ORDER BY created_at DESC
        `;
        
        return NextResponse.json({
            success: true,
            results: result.rows
        });
    } catch (error) {
        console.error('Failed to fetch student results:', error);
        return NextResponse.json(
            { error: '個人結果の取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 全個人結果を削除
export async function DELETE() {
    try {
        await sql`DELETE FROM student_results`;
        
        return NextResponse.json({
            success: true,
            message: '全ての個人結果を削除しました'
        });
    } catch (error) {
        console.error('Failed to delete student results:', error);
        return NextResponse.json(
            { error: '個人結果の削除に失敗しました' },
            { status: 500 }
        );
    }
}
