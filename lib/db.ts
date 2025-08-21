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

    // プロフィールテーブル
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        kana VARCHAR(100) NOT NULL,
        postal_code VARCHAR(10) NOT NULL,
        address TEXT NOT NULL,
        guardian_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 書類テーブル
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        description TEXT,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 合格証書テーブル
    await sql`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 初期データの挿入（管理者アカウント）
    await sql`
      INSERT INTO users (exam_no, password_hash, email, name, role)
      VALUES ('0000', ${hashPassword('admin123')}, 'admin@example.com', '管理者', 'admin')
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