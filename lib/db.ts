import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
import crypto from 'crypto';

// パスワードハッシュ化関数
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// パスワード検証関数
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// データベース接続チェック
async function checkDatabaseConnection() {
  try {
    // 環境変数の存在をチェック
    if (!process.env.POSTGRES_URL) {
      console.log('POSTGRES_URL environment variable is not set');
      return false;
    }
    
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// データベース初期化（テーブル作成）
export async function initDatabase() {
  noStore();
  
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    // お知らせテーブル
    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // ユーザーテーブル
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        exam_no VARCHAR(4) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone_last4 VARCHAR(4),
        email VARCHAR(255),
        name VARCHAR(100),
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 書類テーブル
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255),
        file_url TEXT,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 学生プロフィールテーブル（完全版）
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

    // フォーム設定管理テーブル
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

    // 入学手続金設定テーブル
    await sql`
      CREATE TABLE IF NOT EXISTS admission_fee_settings (
        id SERIAL PRIMARY KEY,
        admission_fee INTEGER DEFAULT 200000,
        miscellaneous_fee INTEGER DEFAULT 240000,
        grade_fee INTEGER DEFAULT 150000,
        dedicated_deadline DATE DEFAULT '2026-02-19',
        combined_deadline DATE DEFAULT '2026-03-24',
        notes TEXT DEFAULT '• 振込期日までに指定口座にお振込みください
• 振込手数料はご負担ください
• 振込人名義は保護者名でお願いします
• 振込完了後、振込控えを学校までご提出ください',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 入学手続金免除設定テーブル
    await sql`
      CREATE TABLE IF NOT EXISTS admission_fee_exemptions (
        id SERIAL PRIMARY KEY,
        exemption_name VARCHAR(255) NOT NULL,
        exemption_amount INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 学生免除割り当てテーブル
    await sql`
      CREATE TABLE IF NOT EXISTS student_exemption_assignments (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        exemption_id INTEGER NOT NULL,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exemption_id) REFERENCES admission_fee_exemptions(id) ON DELETE CASCADE
      )
    `;

    // 合格証書テーブル
    await sql`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        file_name VARCHAR(255),
        file_url TEXT,
        issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 学生結果テーブル
    await sql`
      CREATE TABLE IF NOT EXISTS student_results (
        id SERIAL PRIMARY KEY,
        exam_no VARCHAR(50) UNIQUE NOT NULL,
        student_id VARCHAR(50),
        name VARCHAR(100),
        gender VARCHAR(10),
        application_course VARCHAR(100),
        application_type VARCHAR(100),
        recommendation VARCHAR(100),
        middle_school VARCHAR(100),
        top_10_percent VARCHAR(50),
        special_advance_top5 VARCHAR(50),
        advance_top5 VARCHAR(50),
        club_tuition_exemption VARCHAR(50),
        club_fee_exemption VARCHAR(50),
        club_scholarship VARCHAR(50),
        accepted_course VARCHAR(100),
        scholarship_student VARCHAR(50),
        club_recommendation VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 初期データの挿入（管理者アカウント）
    await sql`
      INSERT INTO users (exam_no, password_hash, email, name, role)
      VALUES ('0000', ${hashPassword('admin123')}, 'admin@example.com', '管理者（旧）', 'admin')
      ON CONFLICT (exam_no) DO NOTHING
    `;

    await sql`
      INSERT INTO users (exam_no, password_hash, email, name, role)
      VALUES ('9999', ${hashPassword('5896')}, 'admin@shinko.edu.jp', '管理者', 'admin')
      ON CONFLICT (exam_no) DO NOTHING
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// お知らせ関連の関数
export async function getAnnouncements() {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      SELECT * FROM announcements 
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    throw error;
  }
}

export async function createAnnouncement(title: string, content: string, author: string) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      INSERT INTO announcements (title, content, author)
      VALUES (${title}, ${content}, ${author})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to create announcement:', error);
    throw error;
  }
}

export async function updateAnnouncement(id: number, title: string, content: string) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      UPDATE announcements 
      SET title = ${title}, content = ${content}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to update announcement:', error);
    throw error;
  }
}

export async function deleteAnnouncement(id: number) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    await sql`
      DELETE FROM announcements WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Failed to delete announcement:', error);
    throw error;
  }
}

// ユーザー認証関連の関数
export async function getUserByEmail(email: string) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

export async function getUserByExamNo(examNo: string) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      SELECT * FROM users WHERE exam_no = ${examNo}
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to fetch user by exam number:', error);
    throw error;
  }
}

export async function authenticateUser(examNo: string, password: string) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const user = await getUserByExamNo(examNo);
    if (!user) {
      return null;
    }
    
    if (verifyPassword(password, user.password_hash)) {
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    throw error;
  }
}

// プロフィール関連の関数
export async function getProfiles() {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      SELECT * FROM profiles ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch profiles:', error);
    throw error;
  }
}

export async function createProfile(profileData: {
  studentId: string;
  fullName: string;
  kana: string;
  postalCode: string;
  address: string;
  guardianName: string;
  phone: string;
  email: string;
}) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      INSERT INTO profiles (student_id, full_name, kana, postal_code, address, guardian_name, phone, email)
      VALUES (${profileData.studentId}, ${profileData.fullName}, ${profileData.kana}, ${profileData.postalCode}, ${profileData.address}, ${profileData.guardianName}, ${profileData.phone}, ${profileData.email})
      ON CONFLICT (student_id) 
      DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        kana = EXCLUDED.kana,
        postal_code = EXCLUDED.postal_code,
        address = EXCLUDED.address,
        guardian_name = EXCLUDED.guardian_name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to create/update profile:', error);
    throw error;
  }
}

// 書類関連の関数
export async function getDocuments() {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      SELECT * FROM documents ORDER BY uploaded_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    throw error;
  }
}

export async function createDocument(name: string, fileName: string, fileUrl: string, description?: string) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      INSERT INTO documents (name, file_name, file_url, description)
      VALUES (${name}, ${fileName}, ${fileUrl}, ${description || null})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to create document:', error);
    throw error;
  }
}

// 合格証書関連の関数
export async function getCertificates() {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      SELECT * FROM certificates ORDER BY issued_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch certificates:', error);
    throw error;
  }
}

export async function createCertificate(studentId: string, fileName: string, fileUrl: string) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      INSERT INTO certificates (student_id, file_name, file_url)
      VALUES (${studentId}, ${fileName}, ${fileUrl})
      ON CONFLICT (student_id) 
      DO UPDATE SET 
        file_name = EXCLUDED.file_name,
        file_url = EXCLUDED.file_url,
        issued_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to create certificate:', error);
    throw error;
  }
}

// 入学手続金設定関連の関数
export async function getAdmissionFeeSettings() {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      SELECT * FROM admission_fee_settings ORDER BY id DESC LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Failed to fetch admission fee settings:', error);
    throw error;
  }
}

export async function createAdmissionFeeSettings(
  admissionFee: number,
  miscellaneousFee: number,
  gradeFee: number,
  dedicatedDeadline: string,
  combinedDeadline: string,
  notes?: string
) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      INSERT INTO admission_fee_settings (
        admission_fee, miscellaneous_fee, grade_fee, 
        dedicated_deadline, combined_deadline, notes
      ) VALUES (
        ${admissionFee}, ${miscellaneousFee}, ${gradeFee}, 
        ${dedicatedDeadline}, ${combinedDeadline}, ${notes || null}
      )
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to create admission fee settings:', error);
    throw error;
  }
}

export async function updateAdmissionFeeSettings(
  id: number,
  admissionFee: number,
  miscellaneousFee: number,
  gradeFee: number,
  dedicatedDeadline: string,
  combinedDeadline: string,
  notes?: string
) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      UPDATE admission_fee_settings 
      SET 
        admission_fee = ${admissionFee},
        miscellaneous_fee = ${miscellaneousFee},
        grade_fee = ${gradeFee},
        dedicated_deadline = ${dedicatedDeadline},
        combined_deadline = ${combinedDeadline},
        notes = ${notes || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to update admission fee settings:', error);
    throw error;
  }
}

export async function getAdmissionFeeExemptions() {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      SELECT * FROM admission_fee_exemptions 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch admission fee exemptions:', error);
    throw error;
  }
}

export async function createAdmissionFeeExemption(name: string, amount: number) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      INSERT INTO admission_fee_exemptions (exemption_name, exemption_amount)
      VALUES (${name}, ${amount})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to create admission fee exemption:', error);
    throw error;
  }
}

export async function updateAdmissionFeeExemption(id: number, name: string, amount: number, isActive: boolean) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      UPDATE admission_fee_exemptions 
      SET 
        exemption_name = ${name},
        exemption_amount = ${amount},
        is_active = ${isActive},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to update admission fee exemption:', error);
    throw error;
  }
}

export async function deleteAdmissionFeeExemption(id: number) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      DELETE FROM admission_fee_exemptions WHERE id = ${id}
    `;
    return result.rowCount > 0;
  } catch (error) {
    console.error('Failed to delete admission fee exemption:', error);
    throw error;
  }
}

// 学生免除割り当て関連の関数
export async function getStudentExemptionAssignments(studentId: string) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    const result = await sql`
      SELECT sea.*, afe.exemption_name, afe.exemption_amount
      FROM student_exemption_assignments sea
      JOIN admission_fee_exemptions afe ON sea.exemption_id = afe.id
      WHERE sea.student_id = ${studentId} AND afe.is_active = TRUE
      ORDER BY sea.assigned_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Failed to get student exemption assignments:', error);
    throw error;
  }
}

export async function assignExemptionToStudent(studentId: string, exemptionId: number) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    // 既存の割り当てをチェック
    const existing = await sql`
      SELECT id FROM student_exemption_assignments 
      WHERE student_id = ${studentId} AND exemption_id = ${exemptionId}
    `;
    
    if (existing.rows.length > 0) {
      return existing.rows[0]; // 既に割り当て済み
    }
    
    const result = await sql`
      INSERT INTO student_exemption_assignments (student_id, exemption_id)
      VALUES (${studentId}, ${exemptionId})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to assign exemption to student:', error);
    throw error;
  }
}

export async function removeExemptionFromStudent(studentId: string, exemptionId: number) {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    await sql`
      DELETE FROM student_exemption_assignments 
      WHERE student_id = ${studentId} AND exemption_id = ${exemptionId}
    `;
    return true;
  } catch (error) {
    console.error('Failed to remove exemption from student:', error);
    throw error;
  }
}

export async function getAllStudentExemptionAssignments() {
  noStore();
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed: POSTGRES_URL environment variable is not set or database is not accessible');
  }
  
  try {
    // まずテーブルが存在するかチェック
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'student_exemption_assignments'
      );
    `;
    
    if (!tableCheck.rows[0].exists) {
      throw new Error('Table student_exemption_assignments does not exist');
    }
    
    const result = await sql`
      SELECT * FROM student_exemption_assignments
    `;
    return result.rows;
  } catch (error) {
    console.error('Failed to get all student exemption assignments:', error);
    throw error;
  }
}