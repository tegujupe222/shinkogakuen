import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'CSVファイルがアップロードされていません' },
                { status: 400 }
            );
        }

        // CSVファイルの内容を読み取り
        const csvText = await file.text();
        const lines = csvText.split('\n').filter(line => line.trim());

        // ヘッダー行をスキップ（最初の行）
        const dataLines = lines.slice(1);

        const results = [];
        const errors = [];

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));

            if (columns.length < 2) {
                errors.push(`行 ${i + 2}: データが不足しています`);
                continue;
            }

            const examNumber = columns[0]; // A列: 受験番号
            const phoneNumber = columns[1]; // B列: 電話番号

            // バリデーション
            if (!examNumber || examNumber.length !== 4 || !/^\d{4}$/.test(examNumber)) {
                errors.push(`行 ${i + 2}: 受験番号が無効です (${examNumber})`);
                continue;
            }

            if (!phoneNumber || phoneNumber.length < 4) {
                errors.push(`行 ${i + 2}: 電話番号が無効です (${phoneNumber})`);
                continue;
            }

            // パスワードは電話番号の下4桁
            const password = phoneNumber.slice(-4);

            try {
                // 既存のユーザーをチェック
                const existingUser = await sql`
                    SELECT id FROM users WHERE id = ${examNumber}
                `;

                if (existingUser.rows.length > 0) {
                    // 既存ユーザーを更新
                    await sql`
                        UPDATE users 
                        SET password = ${password}, 
                            email = ${`student${examNumber}@shinko.edu.jp`},
                            name = ${`学生${examNumber}`},
                            role = 'student',
                            updated_at = NOW()
                        WHERE id = ${examNumber}
                    `;
                    results.push(`受験番号 ${examNumber}: 更新完了`);
                } else {
                    // 新規ユーザーを作成
                    await sql`
                        INSERT INTO users (id, password, email, name, role, created_at, updated_at)
                        VALUES (${examNumber}, ${password}, ${`student${examNumber}@shinko.edu.jp`}, ${`学生${examNumber}`}, 'student', NOW(), NOW())
                    `;
                    results.push(`受験番号 ${examNumber}: 新規作成完了`);
                }
            } catch (dbError) {
                errors.push(`行 ${i + 2}: データベースエラー - ${examNumber}`);
                console.error('Database error:', dbError);
            }
        }

        return NextResponse.json({
            success: true,
            message: `${results.length}件の学生データを処理しました`,
            results,
            errors,
            summary: {
                total: dataLines.length,
                success: results.length,
                errors: errors.length
            }
        });

    } catch (error) {
        console.error('CSV upload error:', error);
        return NextResponse.json(
            { error: 'CSVファイルの処理中にエラーが発生しました' },
            { status: 500 }
        );
    }
}
