import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ fieldKey: string }> }
) {
    try {
        const { fieldKey } = await params;
        
        const result = await sql`
            DELETE FROM form_settings 
            WHERE field_key = ${fieldKey}
            RETURNING *
        `;
        
        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Form setting not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({ message: 'Form setting deleted successfully' });
    } catch (error) {
        console.error('Failed to delete form setting:', error);
        return NextResponse.json(
            { error: 'Failed to delete form setting' },
            { status: 500 }
        );
    }
}
