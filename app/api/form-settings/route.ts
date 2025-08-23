import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        const result = await sql`
            SELECT * FROM form_settings 
            ORDER BY field_group, field_order
        `;
        return NextResponse.json({ 
            success: true, 
            settings: result.rows 
        });
    } catch (error) {
        console.error('Failed to fetch form settings:', error);
        return NextResponse.json(
            { error: 'フォーム設定の取得に失敗しました' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { field_key, field_label, field_type, field_group, field_order, is_required, is_visible, is_editable, validation_rules, field_options, placeholder, help_text } = body;

        if (!field_key || !field_label || !field_type || !field_group) {
            return NextResponse.json(
                { error: '必須フィールドが不足しています' },
                { status: 400 }
            );
        }

        // 既存のフィールドキーを確認
        const existingField = await sql`
            SELECT id FROM form_settings WHERE field_key = ${field_key}
        `;

        if (existingField.rows.length > 0) {
            return NextResponse.json(
                { error: 'このフィールドキーは既に存在します' },
                { status: 400 }
            );
        }

        const result = await sql`
            INSERT INTO form_settings (
                field_key, field_label, field_type, field_group, field_order,
                is_required, is_visible, is_editable, validation_rules,
                field_options, placeholder, help_text
            ) VALUES (
                ${field_key}, ${field_label}, ${field_type}, ${field_group}, ${field_order || 0},
                ${is_required || false}, ${is_visible !== false}, ${is_editable !== false},
                ${validation_rules || null}, ${field_options || null},
                ${placeholder || null}, ${help_text || null}
            )
            RETURNING *
        `;

        return NextResponse.json({ 
            success: true, 
            message: 'フォーム設定を作成しました',
            setting: result.rows[0]
        });
    } catch (error) {
        console.error('Failed to create form setting:', error);
        return NextResponse.json(
            { error: 'フォーム設定の作成に失敗しました' },
            { status: 500 }
        );
    }
}
