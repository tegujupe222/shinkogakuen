import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import * as XLSX from 'xlsx';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'ファイルが選択されていません' },
                { status: 400 }
            );
        }

        // ファイルの内容を読み取り
        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (data.length < 2) {
            return NextResponse.json(
                { error: 'CSVファイルにデータがありません' },
                { status: 400 }
            );
        }

        let updatedCount = 0;
        const errors: string[] = [];

        // ヘッダー行をスキップしてデータを処理
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            
            if (!row || row.length < 2) {
                errors.push(`行 ${i + 1}: データが不足しています`);
                continue;
            }

            const examNo = String(row[0]).trim();
            const phoneNumber = String(row[1]).trim();

            // 受験番号の検証（4桁の数字）
            if (!/^\d{4}$/.test(examNo)) {
                errors.push(`行 ${i + 1}: 受験番号が4桁の数字ではありません (${examNo})`);
                continue;
            }

            // 電話番号の検証
            if (!phoneNumber || phoneNumber.length < 4) {
                errors.push(`行 ${i + 1}: 電話番号が無効です (${phoneNumber})`);
                continue;
            }

            // パスワードは電話番号の下4桁
            const password = phoneNumber.slice(-4);

            try {
                // 既存のユーザーを確認
                const existingUser = await sql`
                    SELECT exam_no FROM users WHERE exam_no = ${examNo}
                `;

                if (existingUser.rows.length === 0) {
                    // 新規ユーザーを作成
                    await sql`
                        INSERT INTO users (exam_no, password, created_at, updated_at)
                        VALUES (${examNo}, ${crypto.createHash('sha256').update(password).digest('hex')}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    `;
                } else {
                    // 既存ユーザーのパスワードを更新
                    await sql`
                        UPDATE users 
                        SET password = ${crypto.createHash('sha256').update(password).digest('hex')}, updated_at = CURRENT_TIMESTAMP
                        WHERE exam_no = ${examNo}
                    `;
                }

                updatedCount++;
            } catch (error) {
                console.error(`Failed to update user ${examNo}:`, error);
                errors.push(`行 ${i + 1}: ユーザー更新に失敗しました (${examNo})`);
            }
        }

        if (errors.length > 0) {
            return NextResponse.json({
                success: false,
                error: `一部のデータでエラーが発生しました。更新件数: ${updatedCount}件`,
                details: errors
            });
        }

        return NextResponse.json({
            success: true,
            message: 'ログイン設定を更新しました',
            updatedCount
        });

    } catch (error) {
        console.error('Failed to upload login settings:', error);
        return NextResponse.json(
            { error: 'ログイン設定のアップロードに失敗しました' },
            { status: 500 }
        );
    }
}
