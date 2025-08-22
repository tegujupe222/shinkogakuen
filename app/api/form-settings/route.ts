import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        const result = await sql`
            SELECT * FROM form_settings 
            ORDER BY field_group, field_order
        `;
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Failed to fetch form settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch form settings' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            field_key,
            field_label,
            field_type,
            field_group,
            field_order,
            is_required,
            is_visible,
            is_editable,
            validation_rules,
            options,
            placeholder,
            help_text
        } = body;

        const result = await sql`
            INSERT INTO form_settings (
                field_key, field_label, field_type, field_group, field_order,
                is_required, is_visible, is_editable, validation_rules,
                options, placeholder, help_text
            ) VALUES (
                ${field_key}, ${field_label}, ${field_type}, ${field_group}, ${field_order},
                ${is_required || false}, ${is_visible !== false}, ${is_editable !== false},
                ${validation_rules || null}, ${options || null}, ${placeholder || null}, ${help_text || null}
            )
            ON CONFLICT (field_key) DO UPDATE SET
                field_label = EXCLUDED.field_label,
                field_type = EXCLUDED.field_type,
                field_group = EXCLUDED.field_group,
                field_order = EXCLUDED.field_order,
                is_required = EXCLUDED.is_required,
                is_visible = EXCLUDED.is_visible,
                is_editable = EXCLUDED.is_editable,
                validation_rules = EXCLUDED.validation_rules,
                options = EXCLUDED.options,
                placeholder = EXCLUDED.placeholder,
                help_text = EXCLUDED.help_text,
                updated_at = NOW()
            RETURNING *
        `;

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to create/update form setting:', error);
        return NextResponse.json(
            { error: 'Failed to create/update form setting' },
            { status: 500 }
        );
    }
}
