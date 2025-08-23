import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fieldKey: string }> }
) {
    try {
        const { fieldKey } = await params;
        
        const result = await sql`
            SELECT * FROM form_settings 
            WHERE field_key = ${fieldKey}
        `;
        
        if (result.rows.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'フォーム設定が見つかりません' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            setting: result.rows[0] 
        });
    } catch (error) {
        console.error('Failed to fetch form setting:', error);
        return NextResponse.json(
            { error: 'フォーム設定の取得に失敗しました' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ fieldKey: string }> }
) {
    try {
        const { fieldKey } = await params;
        const body = await request.json();
        
        console.log('API: Updating form setting for fieldKey:', fieldKey);
        console.log('API: Request body:', body);
        
        const result = await sql`
            UPDATE form_settings 
            SET 
                field_label = ${body.field_label || null},
                field_type = ${body.field_type || null},
                field_group = ${body.field_group || null},
                field_order = ${body.field_order || null},
                is_required = ${body.is_required || false},
                is_visible = ${body.is_visible !== false},
                is_editable = ${body.is_editable !== false},
                validation_rules = ${body.validation_rules || null},
                options = ${body.field_options || null},
                placeholder = ${body.placeholder || null},
                help_text = ${body.help_text || null},
                updated_at = NOW()
            WHERE field_key = ${fieldKey}
            RETURNING *
        `;
        
        console.log('API: Update result:', result.rows);
        
        if (result.rows.length === 0) {
            console.log('API: Form setting not found');
            return NextResponse.json({ 
                success: false, 
                message: 'フォーム設定が見つかりません' 
            }, { status: 404 });
        }
        
        console.log('API: Update successful');
        return NextResponse.json({ 
            success: true, 
            message: 'フォーム設定を更新しました',
            setting: result.rows[0]
        });
    } catch (error) {
        console.error('Failed to update form setting:', error);
        return NextResponse.json(
            { error: 'フォーム設定の更新に失敗しました' },
            { status: 500 }
        );
    }
}

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
            return NextResponse.json({ 
                success: false, 
                message: 'フォーム設定が見つかりません' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            message: 'フォーム設定を削除しました' 
        });
    } catch (error) {
        console.error('Failed to delete form setting:', error);
        return NextResponse.json(
            { error: 'フォーム設定の削除に失敗しました' },
            { status: 500 }
        );
    }
}
