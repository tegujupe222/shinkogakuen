import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const { studentId } = await params;
        
        const result = await sql`
            SELECT * FROM student_profiles 
            WHERE student_id = ${studentId}
        `;
        
        if (result.rows.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'プロフィールが見つかりません' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            profile: result.rows[0] 
        });
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        return NextResponse.json(
            { error: 'プロフィールの取得に失敗しました' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const { studentId } = await params;
        
        const result = await sql`
            DELETE FROM student_profiles 
            WHERE student_id = ${studentId}
            RETURNING *
        `;
        
        if (result.rows.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'プロフィールが見つかりません' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            message: 'プロフィールを削除しました' 
        });
    } catch (error) {
        console.error('Failed to delete profile:', error);
        return NextResponse.json(
            { error: 'プロフィールの削除に失敗しました' },
            { status: 500 }
        );
    }
}
