import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 特定の書類を削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const result = await sql`
            DELETE FROM documents 
            WHERE id = ${id}
            RETURNING id
        `;

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: '書類が見つかりません' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '書類を削除しました'
        });
    } catch (error) {
        console.error('Failed to delete document:', error);
        return NextResponse.json(
            { error: '書類の削除に失敗しました' },
            { status: 500 }
        );
    }
}
