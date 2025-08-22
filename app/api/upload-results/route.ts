import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import * as XLSX from 'xlsx';



export async function POST(request: NextRequest) {
    try {
        // データベース接続チェック
        if (!process.env.POSTGRES_URL) {
            return NextResponse.json(
                { 
                    error: 'データベースが設定されていません。Vercelダッシュボードでデータベースを設定してください。',
                    details: 'POSTGRES_URL environment variable is not set'
                },
                { status: 503 }
            );
        }

        // テーブル存在チェック
        try {
            const tableCheck = await sql`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'student_results'
                );
            `;
            
            if (!tableCheck.rows[0]?.exists) {
                return NextResponse.json(
                    { 
                        error: 'student_resultsテーブルが存在しません。先にマイグレーションを実行してください。',
                        details: 'Please run /api/migrate first'
                    },
                    { status: 503 }
                );
            }
        } catch (error) {
            console.error('Table check failed:', error);
            return NextResponse.json(
                { error: 'データベース接続エラーが発生しました' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'エクセルファイルがアップロードされていません' },
                { status: 400 }
            );
        }

        // ファイル形式チェック
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            return NextResponse.json(
                { error: 'エクセルファイル（.xlsx または .xls）をアップロードしてください' },
                { status: 400 }
            );
        }

        // ファイルをバッファとして読み取り
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        
        // 最初のシートを処理
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const results = [];
        const errors = [];
        let processedCount = 0;

        // ヘッダー行をスキップ（最初の行）
        for (let j = 1; j < data.length; j++) {
            const row = data[j] as any[];
            if (!row || row.length === 0) continue;

            // 実際のエクセルファイルの列順序に合わせて修正
            // A列: 学生ID, B列: 受験番号, C列: 氏名（ふりがな）, D列: 氏名（漢字）, E列: 性別, F列: 出身中学校, G列: 出願時コース
            const studentId = row[0]?.toString() || ''; // A列: 学生ID
            const examNo = row[1]?.toString() || ''; // B列: 受験番号
            const nameKana = row[2]?.toString() || ''; // C列: 氏名（ふりがな）
            const name = row[3]?.toString() || ''; // D列: 氏名（漢字）
            const gender = row[4]?.toString() || ''; // E列: 性別
            const middleSchool = row[5]?.toString() || ''; // F列: 出身中学校
            const applicationCourse = row[6]?.toString() || ''; // G列: 出願時コース
            
            // 出願種別は現在のデータには含まれていないため、空文字として設定
            const applicationType = '';
            
            // 漢字の氏名が空の場合は、ふりがなを氏名として使用
            const displayName = name || nameKana;

            if (!examNo) {
                continue; // 受験番号が空の行はスキップ
            }

            try {
                // 既存のレコードを更新または新規作成
                await sql`
                    INSERT INTO student_results (
                        exam_no, student_id, application_type, name, gender, 
                        middle_school, application_course
                    ) VALUES (
                        ${examNo}, ${studentId}, ${applicationType}, ${displayName}, ${gender},
                        ${middleSchool}, ${applicationCourse}
                    )
                    ON CONFLICT (exam_no) 
                    DO UPDATE SET
                        student_id = EXCLUDED.student_id,
                        application_type = EXCLUDED.application_type,
                        name = EXCLUDED.name,
                        gender = EXCLUDED.gender,
                        middle_school = EXCLUDED.middle_school,
                        application_course = EXCLUDED.application_course,
                        updated_at = NOW()
                `;
                
                results.push(`受験番号 ${examNo}: ${displayName} - 処理完了`);
                processedCount++;
            } catch (error) {
                console.error(`Error inserting row ${j}:`, error);
                errors.push(`行 ${j + 1}: データ処理エラー`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `${processedCount}件の結果データを処理しました`,
            results,
            errors,
            summary: {
                total: data.length - 1, // ヘッダー行を除く
                processed: processedCount,
                errors: errors.length
            }
        });

    } catch (error) {
        console.error('Excel upload error:', error);
        return NextResponse.json(
            { error: 'エクセルファイルの処理中にエラーが発生しました' },
            { status: 500 }
        );
    }
}
