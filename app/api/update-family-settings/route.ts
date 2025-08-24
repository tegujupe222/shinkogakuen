import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
    try {
        console.log('Starting family form settings update...');

        // 既存のguardian1グループのフィールドをfamilyグループに更新
        const updateResult = await sql`
            UPDATE form_settings 
            SET field_group = 'family', 
                updated_at = NOW()
            WHERE field_group = 'guardian1'
        `;
        console.log('Updated guardian1 fields to family group:', updateResult.rowCount);

        // 新しい家族情報フィールドを追加（バッチ処理）
        const insertQueries = [
            // 保護者2情報
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('guardian2_last_name', '保護者２名前(姓)', 'text', 'family', 17, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('guardian2_first_name', '保護者２名前(名)', 'text', 'family', 18, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('guardian2_last_name_kana', '保護者２名前(ふりがな)(姓)', 'text', 'family', 19, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('guardian2_first_name_kana', '保護者２名前(ふりがな)(名)', 'text', 'family', 20, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('guardian2_postal_code', '保護者２現在住所(郵便番号)', 'text', 'family', 21, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('guardian2_address', '保護者２現在住所', 'text', 'family', 22, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('guardian2_address_detail', '保護者２現在住所(番地・部屋番号)', 'text', 'family', 23, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('guardian2_phone', '保護者２電話番号', 'tel', 'family', 24, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('guardian2_relationship', '保護者２と生徒本人との関係', 'select', 'family', 25, false, '父,母,祖父,祖母,その他', NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('guardian2_relationship_other', '保護者２と生徒本人との関係(その他の場合)', 'text', 'family', 26, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('guardian2_email', '保護者２メールアドレス', 'email', 'family', 27, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,

            // 書類送付先
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('document_recipient_last_name', '書類の送付先(姓)', 'text', 'family', 28, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('document_recipient_first_name', '書類の送付先(名)', 'text', 'family', 29, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('document_recipient_postal_code', '書類の送付先 住所(郵便番号)', 'text', 'family', 30, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('document_recipient_address', '書類の送付先 住所', 'text', 'family', 31, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('document_recipient_address_detail', '書類の送付先 住所(番地・部屋番号)', 'text', 'family', 32, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,

            // 緊急連絡先1
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('emergency1_last_name', '緊急連絡先１(姓)', 'text', 'family', 33, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('emergency1_first_name', '緊急連絡先１(名)', 'text', 'family', 34, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('emergency1_phone', '緊急連絡先１(電話番号)', 'tel', 'family', 35, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('emergency1_relationship', '緊急連絡先１(生徒本人との関係)', 'select', 'family', 36, false, '父,母,祖父,祖母,兄弟,姉妹,その他', NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('emergency1_relationship_other', '緊急連絡先１と生徒本人との関係(その他の場合)', 'text', 'family', 37, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,

            // 緊急連絡先2
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('emergency2_last_name', '緊急連絡先２(姓)', 'text', 'family', 38, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('emergency2_first_name', '緊急連絡先２(名)', 'text', 'family', 39, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('emergency2_phone', '緊急連絡先２(電話番号)', 'tel', 'family', 40, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('emergency2_relationship', '緊急連絡先２(生徒本人との関係)', 'select', 'family', 41, false, '父,母,祖父,祖母,兄弟,姉妹,その他', NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('emergency2_relationship_other', '緊急連絡先２と生徒本人との関係(その他の場合)', 'text', 'family', 42, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,

            // 兄弟姉妹情報
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('has_siblings_at_school', '本校在籍の兄弟姉妹の有無', 'select', 'family', 43, false, 'あり,なし', NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,

            // 家族1情報
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('family1_last_name', '家族１名前(姓)', 'text', 'family', 44, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('family1_first_name', '家族１名前(名)', 'text', 'family', 45, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('family1_relationship', '家族１と生徒本人との関係', 'select', 'family', 46, false, '父,母,祖父,祖母,兄弟,姉妹,その他', NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('family1_relationship_other', '家族１と生徒本人との関係(その他の場合)', 'text', 'family', 47, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('family1_birth_date', '家族１(生年月日)', 'date', 'family', 48, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('family1_living_status', '家族１(同居/別居)', 'select', 'family', 49, false, '同居,別居', NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`,
            sql`INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES ('family1_workplace_school', '家族１(勤務先または学校名)', 'text', 'family', 50, false, null, NOW(), NOW()) ON CONFLICT (field_key) DO UPDATE SET field_label = EXCLUDED.field_label, field_type = EXCLUDED.field_type, field_group = EXCLUDED.field_group, field_order = EXCLUDED.field_order, is_required = EXCLUDED.is_required, options = EXCLUDED.options, updated_at = NOW()`
        ];

        // バッチ処理でフィールドを追加
        for (let i = 0; i < insertQueries.length; i++) {
            try {
                await insertQueries[i];
                console.log(`Inserted field ${i + 1}/${insertQueries.length}`);
            } catch (error) {
                console.error(`Error inserting field ${i + 1}:`, error);
            }
        }

        // 更新結果を確認
        const result = await sql`
            SELECT field_key, field_label, field_group, field_order 
            FROM form_settings 
            WHERE field_group = 'family' 
            ORDER BY field_order
        `;

        console.log('Family form settings update completed. Total fields:', result.rows.length);

        return NextResponse.json({
            success: true,
            message: '家族情報フォーム設定を更新しました',
            count: result.rows.length,
            fields: result.rows
        });

    } catch (error) {
        console.error('Failed to update family form settings:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
