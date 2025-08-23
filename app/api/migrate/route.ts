import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

// パスワードハッシュ化関数
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
    try {
        // usersテーブルにexam_noカラムを追加
        await sql`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS exam_no VARCHAR(4) UNIQUE
        `;

        // usersテーブルにphone_last4カラムを追加
        await sql`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_last4 VARCHAR(4)
        `;

        // usersテーブルにupdated_atカラムを追加
        await sql`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        `;

        // 既存の管理者アカウントにexam_noを設定
        await sql`
            UPDATE users 
            SET exam_no = '0000', 
                updated_at = CURRENT_TIMESTAMP 
            WHERE email = 'admin@example.com' AND exam_no IS NULL
        `;

        // 新しい管理者アカウントを追加
        await sql`
            INSERT INTO users (exam_no, password_hash, email, name, role, created_at, updated_at)
            VALUES ('9999', ${hashPassword('5896')}, 'admin@shinko.edu.jp', '管理者', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (exam_no) DO NOTHING
        `;



        // 新しい学生プロフィールテーブルを作成
        await sql`
            CREATE TABLE IF NOT EXISTS student_profiles (
                id SERIAL PRIMARY KEY,
                student_id VARCHAR(50) UNIQUE NOT NULL,
                
                -- 生徒基本情報
                student_last_name VARCHAR(50),
                student_first_name VARCHAR(50),
                student_last_name_kana VARCHAR(50),
                student_first_name_kana VARCHAR(50),
                gender VARCHAR(10),
                birth_date DATE,
                registered_address TEXT,
                
                -- 生徒現在住所
                student_postal_code VARCHAR(10),
                student_address TEXT,
                student_address_detail TEXT,
                student_phone VARCHAR(20),
                
                -- 出身校情報
                middle_school_name VARCHAR(100),
                graduation_date DATE,
                
                -- 保護者1情報
                guardian1_last_name VARCHAR(50),
                guardian1_first_name VARCHAR(50),
                guardian1_last_name_kana VARCHAR(50),
                guardian1_first_name_kana VARCHAR(50),
                guardian1_postal_code VARCHAR(10),
                guardian1_address TEXT,
                guardian1_address_detail TEXT,
                guardian1_phone VARCHAR(20),
                guardian1_relationship VARCHAR(50),
                guardian1_relationship_other TEXT,
                guardian1_email VARCHAR(255),
                guardian1_workplace_name VARCHAR(100),
                guardian1_workplace_postal_code VARCHAR(10),
                guardian1_workplace_address TEXT,
                guardian1_workplace_address_detail TEXT,
                guardian1_workplace_phone VARCHAR(20),
                
                -- 保護者2情報
                guardian2_last_name VARCHAR(50),
                guardian2_first_name VARCHAR(50),
                guardian2_last_name_kana VARCHAR(50),
                guardian2_first_name_kana VARCHAR(50),
                guardian2_postal_code VARCHAR(10),
                guardian2_address TEXT,
                guardian2_address_detail TEXT,
                guardian2_phone VARCHAR(20),
                guardian2_relationship VARCHAR(50),
                guardian2_relationship_other TEXT,
                guardian2_email VARCHAR(255),
                
                -- 書類送付先
                document_recipient_last_name VARCHAR(50),
                document_recipient_first_name VARCHAR(50),
                document_recipient_postal_code VARCHAR(10),
                document_recipient_address TEXT,
                document_recipient_address_detail TEXT,
                
                -- 緊急連絡先
                emergency1_last_name VARCHAR(50),
                emergency1_first_name VARCHAR(50),
                emergency1_phone VARCHAR(20),
                emergency1_relationship VARCHAR(50),
                emergency1_relationship_other TEXT,
                emergency2_last_name VARCHAR(50),
                emergency2_first_name VARCHAR(50),
                emergency2_phone VARCHAR(20),
                emergency2_relationship VARCHAR(50),
                emergency2_relationship_other TEXT,
                
                -- 兄弟姉妹情報
                has_siblings_at_school BOOLEAN DEFAULT FALSE,
                
                -- 家族情報（最大6人）
                family1_last_name VARCHAR(50),
                family1_first_name VARCHAR(50),
                family1_relationship VARCHAR(50),
                family1_relationship_other TEXT,
                family1_birth_date DATE,
                family1_living_status VARCHAR(20),
                family1_workplace_school VARCHAR(100),
                
                family2_last_name VARCHAR(50),
                family2_first_name VARCHAR(50),
                family2_relationship VARCHAR(50),
                family2_relationship_other TEXT,
                family2_birth_date DATE,
                family2_living_status VARCHAR(20),
                family2_workplace_school VARCHAR(100),
                
                family3_last_name VARCHAR(50),
                family3_first_name VARCHAR(50),
                family3_relationship VARCHAR(50),
                family3_relationship_other TEXT,
                family3_birth_date DATE,
                family3_living_status VARCHAR(20),
                family3_workplace_school VARCHAR(100),
                
                family4_last_name VARCHAR(50),
                family4_first_name VARCHAR(50),
                family4_relationship VARCHAR(50),
                family4_relationship_other TEXT,
                family4_birth_date DATE,
                family4_living_status VARCHAR(20),
                family4_workplace_school VARCHAR(100),
                
                family5_last_name VARCHAR(50),
                family5_first_name VARCHAR(50),
                family5_relationship VARCHAR(50),
                family5_relationship_other TEXT,
                family5_birth_date DATE,
                family5_living_status VARCHAR(20),
                family5_workplace_school VARCHAR(100),
                
                family6_last_name VARCHAR(50),
                family6_first_name VARCHAR(50),
                family6_relationship VARCHAR(50),
                family6_relationship_other TEXT,
                family6_birth_date DATE,
                family6_living_status VARCHAR(20),
                family6_workplace_school VARCHAR(100),
                
                -- 通学方法
                commute_method VARCHAR(50),
                jr_start VARCHAR(50),
                jr_end VARCHAR(50),
                subway_nishin_start VARCHAR(50),
                subway_nishin_end VARCHAR(50),
                subway_kaigan_start VARCHAR(50),
                subway_kaigan_end VARCHAR(50),
                hankyu_start VARCHAR(50),
                hankyu_end VARCHAR(50),
                kobe_electric_start VARCHAR(50),
                kobe_electric_end VARCHAR(50),
                hanshin_start VARCHAR(50),
                hanshin_end VARCHAR(50),
                sanyo_start VARCHAR(50),
                sanyo_end VARCHAR(50),
                kobe_bus_start VARCHAR(50),
                kobe_bus_end VARCHAR(50),
                sanyo_bus_start VARCHAR(50),
                sanyo_bus_end VARCHAR(50),
                shinhi_bus_start VARCHAR(50),
                shinhi_bus_end VARCHAR(50),
                other1_transport VARCHAR(50),
                other1_start VARCHAR(50),
                other1_end VARCHAR(50),
                other2_transport VARCHAR(50),
                other2_start VARCHAR(50),
                other2_end VARCHAR(50),
                via_station TEXT,
                
                -- 芸術科目選択
                art_first_choice VARCHAR(20),
                art_second_choice VARCHAR(20),
                
                -- 持病・健康情報
                has_chronic_illness BOOLEAN DEFAULT FALSE,
                accommodation_notes TEXT,
                family_communication TEXT,
                chronic_illness_details TEXT,
                
                -- フォーム進捗状況
                personal_info_completed BOOLEAN DEFAULT FALSE,
                commute_info_completed BOOLEAN DEFAULT FALSE,
                art_selection_completed BOOLEAN DEFAULT FALSE,
                health_info_completed BOOLEAN DEFAULT FALSE,
                
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // フォーム設定管理テーブルを作成
        await sql`
            CREATE TABLE IF NOT EXISTS form_settings (
                id SERIAL PRIMARY KEY,
                field_key VARCHAR(100) UNIQUE NOT NULL,
                field_label VARCHAR(200) NOT NULL,
                field_type VARCHAR(50) NOT NULL,
                field_group VARCHAR(100) NOT NULL,
                field_order INTEGER NOT NULL,
                is_required BOOLEAN DEFAULT FALSE,
                is_visible BOOLEAN DEFAULT TRUE,
                is_editable BOOLEAN DEFAULT TRUE,
                validation_rules TEXT,
                options TEXT,
                placeholder TEXT,
                help_text TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // フォーム設定の初期データを挿入
        const initialFormSettings = [
            // 生徒基本情報
            { key: 'student_last_name', label: '生徒名前(姓)', type: 'text', group: 'personal', order: 1, required: true },
            { key: 'student_first_name', label: '生徒名前(名)', type: 'text', group: 'personal', order: 2, required: true },
            { key: 'student_last_name_kana', label: '生徒名前(ふりがな)(姓)', type: 'text', group: 'personal', order: 3 },
            { key: 'student_first_name_kana', label: '生徒名前(ふりがな)(名)', type: 'text', group: 'personal', order: 4 },
            { key: 'gender', label: '性別', type: 'select', group: 'personal', order: 5, options: '男,女' },
            { key: 'birth_date', label: '生年月日', type: 'date', group: 'personal', order: 6 },
            { key: 'registered_address', label: '本籍地', type: 'text', group: 'personal', order: 7 },
            
            // 生徒現在住所
            { key: 'student_postal_code', label: '生徒の現在住所(郵便番号)', type: 'text', group: 'personal', order: 8, placeholder: '123-4567' },
            { key: 'student_address', label: '生徒の現在住所', type: 'text', group: 'personal', order: 9 },
            { key: 'student_address_detail', label: '生徒の現在住所(番地部屋番号)', type: 'text', group: 'personal', order: 10 },
            { key: 'student_phone', label: '電話番号', type: 'tel', group: 'personal', order: 11 },
            
            // 出身校情報
            { key: 'middle_school_name', label: '出身中学校名', type: 'text', group: 'personal', order: 12 },
            { key: 'graduation_date', label: '卒業年月日', type: 'date', group: 'personal', order: 13 },
            
            // 保護者1情報
            { key: 'guardian1_last_name', label: '保護者１名前(姓)', type: 'text', group: 'guardian1', order: 1 },
            { key: 'guardian1_first_name', label: '保護者１名前(名)', type: 'text', group: 'guardian1', order: 2 },
            { key: 'guardian1_last_name_kana', label: '保護者１名前(ふりがな)(姓)', type: 'text', group: 'guardian1', order: 3 },
            { key: 'guardian1_first_name_kana', label: '保護者１名前(ふりがな)(名)', type: 'text', group: 'guardian1', order: 4 },
            { key: 'guardian1_postal_code', label: '保護者１現在住所(郵便番号)', type: 'text', group: 'guardian1', order: 5 },
            { key: 'guardian1_address', label: '保護者１現在住所', type: 'text', group: 'guardian1', order: 6 },
            { key: 'guardian1_address_detail', label: '保護者１現在住所(番地・部屋番号)', type: 'text', group: 'guardian1', order: 7 },
            { key: 'guardian1_phone', label: '保護者１電話番号', type: 'tel', group: 'guardian1', order: 8 },
            { key: 'guardian1_relationship', label: '保護者１と生徒本人との関係', type: 'select', group: 'guardian1', order: 9, options: '父,母,祖父,祖母,その他' },
            { key: 'guardian1_relationship_other', label: '保護者１と生徒本人との関係(その他の場合)', type: 'text', group: 'guardian1', order: 10 },
            { key: 'guardian1_email', label: '保護者１メールアドレス', type: 'email', group: 'guardian1', order: 11 },
            { key: 'guardian1_workplace_name', label: '保護者１勤務先名', type: 'text', group: 'guardian1', order: 12 },
            { key: 'guardian1_workplace_postal_code', label: '保護者１勤務先住所(郵便番号)', type: 'text', group: 'guardian1', order: 13 },
            { key: 'guardian1_workplace_address', label: '保護者１勤務先住所', type: 'text', group: 'guardian1', order: 14 },
            { key: 'guardian1_workplace_address_detail', label: '保護者１勤務先住所(番地・部屋番号)', type: 'text', group: 'guardian1', order: 15 },
            { key: 'guardian1_workplace_phone', label: '保護者１勤務先電話番号', type: 'tel', group: 'guardian1', order: 16 },
            
            // 通学方法
            { key: 'commute_method', label: '通学方法', type: 'select', group: 'commute', order: 1, options: '交通機関利用,自転車,徒歩' },
            { key: 'jr_start', label: 'JR区間(始)', type: 'text', group: 'commute', order: 2 },
            { key: 'jr_end', label: 'JR区間(終)', type: 'text', group: 'commute', order: 3 },
            { key: 'subway_nishin_start', label: '神戸市営地下鉄（西神線）区間(始)', type: 'text', group: 'commute', order: 4 },
            { key: 'subway_nishin_end', label: '神戸市営地下鉄（西神線）区間(終)', type: 'text', group: 'commute', order: 5 },
            { key: 'via_station', label: '経由地', type: 'textarea', group: 'commute', order: 20 },
            
            // 芸術科目選択
            { key: 'art_first_choice', label: '芸術選択第１希望科目', type: 'select', group: 'art', order: 1, options: '音楽,美術,書道' },
            { key: 'art_second_choice', label: '芸術選択第２希望科目', type: 'select', group: 'art', order: 2, options: '音楽,美術,書道' },
            
            // 持病・健康情報
            { key: 'has_chronic_illness', label: '持病(あり/なし)', type: 'select', group: 'health', order: 1, options: 'あり,なし' },
            { key: 'accommodation_notes', label: '宿泊行事について学校へ伝えたいこと', type: 'textarea', group: 'health', order: 2 },
            { key: 'family_communication', label: '学校生活について家庭からの連絡', type: 'textarea', group: 'health', order: 3 },
            { key: 'chronic_illness_details', label: '持病に当てはまるもの', type: 'textarea', group: 'health', order: 4, help_text: '心疾患、川崎病、リウマチ熱、腎臓疾患、肝臓疾患、糖尿病、てんかん、喘息、難聴、弱視、側湾症、色覚異常、アトピー性皮膚炎、発達障害、身体障害、食物アレルギー、薬剤アレルギー、怪我、その他' }
        ];

        for (const setting of initialFormSettings) {
            await sql`
                INSERT INTO form_settings (
                    field_key, field_label, field_type, field_group, field_order,
                    is_required, options, placeholder, help_text
                ) VALUES (
                    ${setting.key}, ${setting.label}, ${setting.type}, ${setting.group}, ${setting.order},
                    ${setting.required || false}, ${setting.options || null}, ${setting.placeholder || null}, ${setting.help_text || null}
                )
                ON CONFLICT (field_key) DO UPDATE SET
                    field_label = EXCLUDED.field_label,
                    field_type = EXCLUDED.field_type,
                    field_group = EXCLUDED.field_group,
                    field_order = EXCLUDED.field_order,
                    is_required = EXCLUDED.is_required,
                    options = EXCLUDED.options,
                    placeholder = EXCLUDED.placeholder,
                    help_text = EXCLUDED.help_text,
                    updated_at = NOW()
            `;
        }

        return NextResponse.json({
            success: true,
            message: 'Database migration completed successfully'
        });
    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json(
            { error: 'Migration failed', details: error },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // マイグレーション状態を確認
        const result = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `;
        
        return NextResponse.json({
            success: true,
            columns: result.rows
        });
    } catch (error) {
        console.error('Migration check failed:', error);
        return NextResponse.json(
            { error: 'Migration check failed', details: error },
            { status: 500 }
        );
    }
}
