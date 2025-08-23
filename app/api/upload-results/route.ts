import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'Excelファイルがアップロードされていません' },
                { status: 400 }
            );
        }

        // Excelファイルの内容を読み取り
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // ヘッダー行をスキップ（最初の行）
        const rows = data.slice(1);

        const results = [];
        const errors = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i] as any[];
            
            if (!row || row.length === 0) continue;

            try {
                // 列のマッピング（0ベースのインデックス）
                // A列: 学生ID (0), B列: 受験番号 (1), C列: 氏名 (2), E列: 性別 (4)
                // G列: 出願時のコース (6), H列: 出願種別 (7), J列: 推薦 (9)
                // M列: 中学校名 (12), O列: 3教科上位10% (14), P列: 特進上位5名 (15)
                // Q列: 進学上位5名 (16), R列: 部活動推薦入学金免除 (17)
                // S列: 部活動推薦諸費用免除 (18), T列: 部活動推薦奨学金支給 (19)
                // V列: 合格コース (21), X列: 特待生 (23), Z列: 部活動推薦表記 (25)
                
                const studentId = row[0]?.toString() || null; // A列: 学生ID
                const examNo = row[1]?.toString() || ''; // B列: 受験番号
                const name = row[2]?.toString() || ''; // C列: 氏名
                const gender = row[4]?.toString() || ''; // E列: 性別
                const applicationCourse = row[6]?.toString() || null; // G列: 出願時のコース
                const applicationType = row[7]?.toString() || null; // H列: 出願種別
                const recommendation = row[9]?.toString() || null; // J列: 推薦
                const middleSchool = row[12]?.toString() || null; // M列: 中学校名
                const top10Percent = row[14]?.toString() || null; // O列: 3教科上位10%
                const specialAdvanceTop5 = row[15]?.toString() || null; // P列: 特進上位5名
                const advanceTop5 = row[16]?.toString() || null; // Q列: 進学上位5名
                const clubTuitionExemption = row[17]?.toString() || null; // R列: 部活動推薦入学金免除
                const clubFeeExemption = row[18]?.toString() || null; // S列: 部活動推薦諸費用免除
                const clubScholarship = row[19]?.toString() || null; // T列: 部活動推薦奨学金支給
                const acceptedCourse = row[21]?.toString() || null; // V列: 合格コース
                const scholarshipStudent = row[23]?.toString() || null; // X列: 特待生
                const clubRecommendation = row[25]?.toString() || null; // Z列: 部活動推薦表記

                // バリデーション
                if (!examNo) {
                    errors.push(`行 ${i + 2}: 受験番号が空です`);
                    continue;
                }

                // データベースに挿入または更新
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

                results.push(`受験番号 ${examNo}: 処理完了`);
            } catch (error) {
                console.error(`Error inserting row ${i + 2}:`, error);
                errors.push(`行 ${i + 2}: データベースエラー - ${error}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Excelファイルの処理が完了しました',
            summary: {
                total: rows.length,
                processed: results.length,
                errors: errors.length
            },
            results: results,
            errors: errors
        });

    } catch (error) {
        console.error('Failed to process Excel file:', error);
        return NextResponse.json(
            { error: 'Excelファイルの処理に失敗しました' },
            { status: 500 }
        );
    }
}
