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

        // student_resultsテーブルを作成
        await sql`
            CREATE TABLE IF NOT EXISTS student_results (
                id SERIAL PRIMARY KEY,
                exam_no VARCHAR(4) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                application_type VARCHAR(20),
                application_course VARCHAR(100), -- G列: 出願時のコース
                gender VARCHAR(10),
                middle_school VARCHAR(100),
                recommendation VARCHAR(100),
                club_recommendation VARCHAR(100),
                accepted_course VARCHAR(100),
                top_10_percent VARCHAR(100),
                special_advance_top5 VARCHAR(100),
                advance_top5 VARCHAR(100),
                club_tuition_exemption BOOLEAN DEFAULT FALSE,
                club_fee_exemption BOOLEAN DEFAULT FALSE,
                club_scholarship BOOLEAN DEFAULT FALSE,
                scholarship_student VARCHAR(100),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // student_resultsテーブルにapplication_courseカラムを追加（既存テーブル用）
        await sql`
            ALTER TABLE student_results ADD COLUMN IF NOT EXISTS application_course VARCHAR(100)
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
