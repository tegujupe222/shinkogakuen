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
            // A列: 学生ID, B列: 受験番号, C列: 氏名, E列: 性別, G列: 出願時のコース, H列: 出願種別, J列: 推薦, M列: 中学校名, O列: 3教科上位10%, P列: 特進上位5名, Q列: 進学上位5名, R列: 部活動推薦入学金免除, S列: 部活動推薦諸費用免除, T列: 部活動推薦奨学金支給, V列: 合格コース, X列: 特待生, Z列: 部活動推薦表記
            const studentId = row[0]?.toString() || ''; // A列: 学生ID
            const examNo = row[1]?.toString() || ''; // B列: 受験番号
            const name = row[2]?.toString() || ''; // C列: 氏名
            const gender = row[4]?.toString() || ''; // E列: 性別
            const applicationCourse = row[6]?.toString() || ''; // G列: 出願時のコース
            const applicationType = row[7]?.toString() || ''; // H列: 出願種別（専願/併願）
            const recommendation = row[9]?.toString() || ''; // J列: 推薦
            const middleSchool = row[12]?.toString() || ''; // M列: 中学校名
            const top10Percent = row[14]?.toString() || ''; // O列: 3教科上位10%
            const specialAdvanceTop5 = row[15]?.toString() || ''; // P列: 特進上位5名
            const advanceTop5 = row[16]?.toString() || ''; // Q列: 進学上位5名
            const clubTuitionExemption = row[17]?.toString() || ''; // R列: 部活動推薦入学金免除
            const clubFeeExemption = row[18]?.toString() || ''; // S列: 部活動推薦諸費用免除
            const clubScholarship = row[19]?.toString() || ''; // T列: 部活動推薦奨学金支給
            const acceptedCourse = row[21]?.toString() || ''; // V列: 合格コース
            const scholarshipStudent = row[23]?.toString() || ''; // X列: 特待生
            const clubRecommendation = row[25]?.toString() || ''; // Z列: 部活動推薦表記

            if (!examNo) {
                continue; // 受験番号が空の行はスキップ
            }

            try {
                // 既存のレコードを更新または新規作成
                await sql`
                    INSERT INTO student_results (
                        exam_no, student_id, name, gender, application_course, application_type,
                        recommendation, middle_school, top_10_percent, special_advance_top5,
                        advance_top5, club_tuition_exemption, club_fee_exemption, club_scholarship,
                        accepted_course, scholarship_student, club_recommendation
                    ) VALUES (
                        ${examNo}, ${studentId}, ${name}, ${gender}, ${applicationCourse}, ${applicationType},
                        ${recommendation}, ${middleSchool}, ${top10Percent}, ${specialAdvanceTop5},
                        ${advanceTop5}, ${clubTuitionExemption}, ${clubFeeExemption}, ${clubScholarship},
                        ${acceptedCourse}, ${scholarshipStudent}, ${clubRecommendation}
                    )
                    ON CONFLICT (exam_no) 
                    DO UPDATE SET
                        student_id = EXCLUDED.student_id,
                        name = EXCLUDED.name,
                        gender = EXCLUDED.gender,
                        application_course = EXCLUDED.application_course,
                        application_type = EXCLUDED.application_type,
                        recommendation = EXCLUDED.recommendation,
                        middle_school = EXCLUDED.middle_school,
                        top_10_percent = EXCLUDED.top_10_percent,
                        special_advance_top5 = EXCLUDED.special_advance_top5,
                        advance_top5 = EXCLUDED.advance_top5,
                        club_tuition_exemption = EXCLUDED.club_tuition_exemption,
                        club_fee_exemption = EXCLUDED.club_fee_exemption,
                        club_scholarship = EXCLUDED.club_scholarship,
                        accepted_course = EXCLUDED.accepted_course,
                        scholarship_student = EXCLUDED.scholarship_student,
                        club_recommendation = EXCLUDED.club_recommendation,
                        updated_at = NOW()
                `;
                
                results.push(`受験番号 ${examNo}: ${name} - 処理完了`);
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
