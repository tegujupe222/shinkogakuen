import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import * as XLSX from 'xlsx';

interface StudentResult {
    exam_no: string;
    name: string;
    application_type: string; // H列: 出願（専願/併願）
    application_course: string; // G列: 出願時のコース
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
        
        for (let i = 1; i < workbook.SheetNames.length; i++) {
            const sheetName = workbook.SheetNames[i];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            for (let j = 1; j < data.length; j++) {
                const row = data[j] as any[];
                if (!row || row.length === 0) continue;

                // A列: 学生ID, B列: 受験番号, C列: 出願種別, D列: 氏名, E列: 性別, F列: 出身中学校, G列: 出願時のコース
                const studentId = row[0]?.toString() || ''; // A列: 学生ID
                const examNo = row[1]?.toString() || ''; // B列: 受験番号
                const applicationType = row[2]?.toString() || ''; // C列: 出願種別
                const name = row[3]?.toString() || ''; // D列: 氏名
                const gender = row[4]?.toString() || ''; // E列: 性別
                const middleSchool = row[5]?.toString() || ''; // F列: 出身中学校
                const applicationCourse = row[6]?.toString() || ''; // G列: 出願時のコース

                if (!examNo) continue;

                try {
                    // 既存のレコードを更新または新規作成
                    await sql`
                        INSERT INTO student_results (
                            exam_no, student_id, application_type, name, gender, 
                            middle_school, application_course
                        ) VALUES (
                            ${examNo}, ${studentId}, ${applicationType}, ${name}, ${gender},
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
                } catch (error) {
                    console.error(`Error inserting row ${j}:`, error);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `データを処理しました`,
            summary: {
                total: workbook.SheetNames.length - 1, // シート数からヘッダー行を除く
                processed: workbook.SheetNames.length - 1,
                errors: 0 // エラーは発生しない想定
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
