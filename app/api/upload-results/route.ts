import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import * as XLSX from 'xlsx';

interface StudentResult {
    exam_no: string;
    name: string;
    application_type: string; // H列: 出願（専願/併願）
    gender: string; // E列: 性別
    middle_school: string; // M列: 中学校名
    recommendation: string; // J列: 推薦の表示
    club_recommendation: string; // Z列: 部活動推薦表記
    accepted_course: string; // V列: 合格コース
    top_10_percent: string; // O列: 3教科上位10%
    special_advance_top5: string; // P列: 特進上位5名
    advance_top5: string; // Q列: 進学上位5名
    club_tuition_exemption: boolean; // R列: 部活動推薦入学金免除
    club_fee_exemption: boolean; // S列: 部活動推薦諸費用免除
    club_scholarship: boolean; // T列: 部活動推薦奨学金支給
    scholarship_student: string; // X列: 特待生の表示
}

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
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // エクセルデータをJSONに変換
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // ヘッダー行をスキップ（最初の行）
        const dataRows = jsonData.slice(1);
        
        const results = [];
        const errors = [];
        let processedCount = 0;

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i] as any[];
            
            try {
                // 受験番号（B列）が必須
                const examNo = row[1]?.toString().trim();
                if (!examNo || examNo.length === 0) {
                    continue; // 受験番号が空の行はスキップ
                }

                // 氏名（C列）が必須
                const name = row[2]?.toString().trim();
                if (!name || name.length === 0) {
                    errors.push(`行 ${i + 2}: 氏名が入力されていません`);
                    continue;
                }

                const studentResult: StudentResult = {
                    exam_no: examNo,
                    name: name,
                    application_type: row[7]?.toString().trim() || '', // H列
                    gender: row[4]?.toString().trim() || '', // E列
                    middle_school: row[12]?.toString().trim() || '', // M列
                    recommendation: row[9]?.toString().trim() || '', // J列
                    club_recommendation: row[25]?.toString().trim() || '', // Z列
                    accepted_course: row[21]?.toString().trim() || '', // V列
                    top_10_percent: row[14]?.toString().trim() || '', // O列
                    special_advance_top5: row[15]?.toString().trim() || '', // P列
                    advance_top5: row[16]?.toString().trim() || '', // Q列
                    club_tuition_exemption: row[17]?.toString().trim() === '1', // R列
                    club_fee_exemption: row[18]?.toString().trim() === '1', // S列
                    club_scholarship: row[19]?.toString().trim() === '1', // T列
                    scholarship_student: row[23]?.toString().trim() || '', // X列
                };

                // データベースに保存または更新
                await sql`
                    INSERT INTO student_results (
                        exam_no, name, application_type, gender, middle_school,
                        recommendation, club_recommendation, accepted_course,
                        top_10_percent, special_advance_top5, advance_top5,
                        club_tuition_exemption, club_fee_exemption, club_scholarship,
                        scholarship_student, created_at, updated_at
                    ) VALUES (
                        ${studentResult.exam_no}, ${studentResult.name}, ${studentResult.application_type},
                        ${studentResult.gender}, ${studentResult.middle_school}, ${studentResult.recommendation},
                        ${studentResult.club_recommendation}, ${studentResult.accepted_course},
                        ${studentResult.top_10_percent}, ${studentResult.special_advance_top5},
                        ${studentResult.advance_top5}, ${studentResult.club_tuition_exemption},
                        ${studentResult.club_fee_exemption}, ${studentResult.club_scholarship},
                        ${studentResult.scholarship_student}, NOW(), NOW()
                    )
                    ON CONFLICT (exam_no) 
                    DO UPDATE SET
                        name = EXCLUDED.name,
                        application_type = EXCLUDED.application_type,
                        gender = EXCLUDED.gender,
                        middle_school = EXCLUDED.middle_school,
                        recommendation = EXCLUDED.recommendation,
                        club_recommendation = EXCLUDED.club_recommendation,
                        accepted_course = EXCLUDED.accepted_course,
                        top_10_percent = EXCLUDED.top_10_percent,
                        special_advance_top5 = EXCLUDED.special_advance_top5,
                        advance_top5 = EXCLUDED.advance_top5,
                        club_tuition_exemption = EXCLUDED.club_tuition_exemption,
                        club_fee_exemption = EXCLUDED.club_fee_exemption,
                        club_scholarship = EXCLUDED.club_scholarship,
                        scholarship_student = EXCLUDED.scholarship_student,
                        updated_at = NOW()
                `;

                results.push(`受験番号 ${examNo}: ${name} - 処理完了`);
                processedCount++;

            } catch (error) {
                console.error(`行 ${i + 2} の処理エラー:`, error);
                errors.push(`行 ${i + 2}: データ処理エラー`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `${processedCount}件の結果データを処理しました`,
            results,
            errors,
            summary: {
                total: dataRows.length,
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
