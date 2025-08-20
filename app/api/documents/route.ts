import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 全書類を取得
export async function GET() {
    try {
        const result = await sql`
            SELECT * FROM documents 
            ORDER BY uploaded_at DESC
        `;
        
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Failed to fetch documents:', error);
        return NextResponse.json(
            { error: '書類の取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 書類を作成・更新
export async function POST(request: NextRequest) {
    try {
        const { name, fileName, fileUrl, description } = await request.json();

        // バリデーション
        if (!name || !fileName) {
            return NextResponse.json(
                { error: '書類名とファイル名は必須です' },
                { status: 400 }
            );
        }

        // 新規書類を作成
        const result = await sql`
            INSERT INTO documents (name, file_name, file_url, description, uploaded_at, created_at, updated_at)
            VALUES (${name}, ${fileName}, ${fileUrl || null}, ${description || null}, NOW(), NOW(), NOW())
            RETURNING id
        `;
        
        return NextResponse.json({
            success: true,
            message: '書類をアップロードしました',
            id: result.rows[0].id
        });
    } catch (error) {
        console.error('Failed to create document:', error);
        return NextResponse.json(
            { error: '書類のアップロードに失敗しました' },
            { status: 500 }
        );
    }
}
