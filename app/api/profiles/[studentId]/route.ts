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
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}
