import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 全合格証書を取得（管理者用）
export async function GET() {
    try {
        const result = await sql`
            SELECT * FROM certificates 
            ORDER BY issued_at DESC
        `;
        
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Failed to fetch certificates:', error);
        return NextResponse.json(
            { error: '合格証書の取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 合格証書を作成・更新（管理者用）
export async function POST(request: NextRequest) {
    try {
        const { studentId, fileName, fileUrl, issuedAt } = await request.json();

        // バリデーション
        if (!studentId || !fileName) {
            return NextResponse.json(
                { error: '学生IDとファイル名は必須です' },
                { status: 400 }
            );
        }

        // 既存の合格証書をチェック
        const existingCertificate = await sql`
            SELECT id FROM certificates WHERE student_id = ${studentId}
        `;

        if (existingCertificate.rows.length > 0) {
            // 既存の合格証書を更新
            await sql`
                UPDATE certificates 
                SET file_name = ${fileName},
                    file_url = ${fileUrl || null},
                    issued_at = ${issuedAt || new Date().toISOString()},
                    updated_at = NOW()
                WHERE student_id = ${studentId}
            `;
            
            return NextResponse.json({
                success: true,
                message: '合格証書を更新しました',
                studentId
            });
        } else {
            // 新規合格証書を作成
            await sql`
                INSERT INTO certificates (student_id, file_name, file_url, issued_at, created_at, updated_at)
                VALUES (${studentId}, ${fileName}, ${fileUrl || null}, ${issuedAt || new Date().toISOString()}, NOW(), NOW())
            `;
            
            return NextResponse.json({
                success: true,
                message: '合格証書を作成しました',
                studentId
            });
        }
    } catch (error) {
        console.error('Failed to create/update certificate:', error);
        return NextResponse.json(
            { error: '合格証書の作成・更新に失敗しました' },
            { status: 500 }
        );
    }
}
