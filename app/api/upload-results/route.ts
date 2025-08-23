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

            // 実際のエクセルファイルの列順序に合わせて修正（ログから確認した実際の構造）
            // A列: 学生ID, B列: 受験番号, C列: 氏名, D列: ふりがな, E列: 性別, F列: 中学校コード, G列: 出願時のコース, H列: 出願種別, I列: 不明, J列: 推薦
            const studentId = row[0]?.toString() || null; // A列: 学生ID
            const examNo = row[1]?.toString() || ''; // B列: 受験番号
            const name = row[2]?.toString() || ''; // C列: 氏名
            const gender = row[4]?.toString() || ''; // E列: 性別
            const applicationCourse = row[6]?.toString() || null; // G列: 出願時のコース
            const applicationType = row[7]?.toString() || null; // H列: 出願種別（専願/併願）
            const recommendation = row[9]?.toString() || null; // J列: 推薦
            
            // 以下の列は成績の良い生徒のみにデータがあるため、存在する場合は取得、ない場合はnull
            const middleSchool = row[12]?.toString() || null; // M列: 中学校名（全員に入っているはず）
            const top10Percent = row[14]?.toString() || null; // O列: 3教科上位10%（成績の良い生徒のみ）
            const specialAdvanceTop5 = row[15]?.toString() || null; // P列: 特進上位5名（成績の良い生徒のみ）
            const advanceTop5 = row[16]?.toString() || null; // Q列: 進学上位5名（成績の良い生徒のみ）
            const clubTuitionExemption = row[17]?.toString() || null; // R列: 部活動推薦入学金免除（成績の良い生徒のみ）
            const clubFeeExemption = row[18]?.toString() || null; // S列: 部活動推薦諸費用免除（成績の良い生徒のみ）
            const clubScholarship = row[19]?.toString() || null; // T列: 部活動推薦奨学金支給（成績の良い生徒のみ）
            const acceptedCourse = row[21]?.toString() || null; // V列: 合格コース（成績の良い生徒のみ）
            const scholarshipStudent = row[23]?.toString() || null; // X列: 特待生（成績の良い生徒のみ）
            const clubRecommendation = row[25]?.toString() || null; // Z列: 部活動推薦表記（成績の良い生徒のみ）

            // デバッグ用ログ（最初の3行のみ）
            if (j <= 3) {
                console.log(`Row ${j}:`, {
                    studentId,
                    examNo,
                    name,
                    gender,
                    applicationCourse,
                    applicationType,
                    recommendation,
                    middleSchool,
                    top10Percent,
                    specialAdvanceTop5,
                    advanceTop5,
                    clubTuitionExemption,
                    clubFeeExemption,
                    clubScholarship,
                    acceptedCourse,
                    scholarshipStudent,
                    clubRecommendation,
                    rawRow: row // 全列を表示して実際の構造を確認
                });
            }

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
