import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 特定の受験番号の個人結果を取得
export async function GET(
    request: NextRequest,
    { params }: { params: { examNo: string } }
) {
    try {
        const { examNo } = params;
        
        const result = await sql`
            SELECT * FROM student_results 
            WHERE exam_no = ${examNo}
        `;
        
        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: '個人結果が見つかりません' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            result: result.rows[0]
        });
    } catch (error) {
        console.error('Failed to fetch student result:', error);
        return NextResponse.json(
            { error: '個人結果の取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 特定の受験番号の個人結果を更新
export async function PUT(
    request: NextRequest,
    { params }: { params: { examNo: string } }
) {
    try {
        const { examNo } = params;
        const body = await request.json();
        
        const result = await sql`
            UPDATE student_results 
            SET 
                student_id = ${body.student_id || null},
                name = ${body.name || null},
                gender = ${body.gender || null},
                application_course = ${body.application_course || null},
                application_type = ${body.application_type || null},
                recommendation = ${body.recommendation || null},
                middle_school = ${body.middle_school || null},
                top_10_percent = ${body.top_10_percent || null},
                special_advance_top5 = ${body.special_advance_top5 || null},
                advance_top5 = ${body.advance_top5 || null},
                club_tuition_exemption = ${body.club_tuition_exemption || null},
                club_fee_exemption = ${body.club_fee_exemption || null},
                club_scholarship = ${body.club_scholarship || null},
                accepted_course = ${body.accepted_course || null},
                scholarship_student = ${body.scholarship_student || null},
                club_recommendation = ${body.club_recommendation || null},
                updated_at = NOW()
            WHERE exam_no = ${examNo}
            RETURNING *
        `;
        
        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: '個人結果が見つかりません' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            message: '個人結果を更新しました',
            result: result.rows[0]
        });
    } catch (error) {
        console.error('Failed to update student result:', error);
        return NextResponse.json(
            { error: '個人結果の更新に失敗しました' },
            { status: 500 }
        );
    }
}

// 特定の受験番号の個人結果を削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: { examNo: string } }
) {
    try {
        const { examNo } = params;
        
        const result = await sql`
            DELETE FROM student_results 
            WHERE exam_no = ${examNo}
            RETURNING *
        `;
        
        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: '個人結果が見つかりません' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            message: '個人結果を削除しました'
        });
    } catch (error) {
        console.error('Failed to delete student result:', error);
        return NextResponse.json(
            { error: '個人結果の削除に失敗しました' },
            { status: 500 }
        );
    }
}
