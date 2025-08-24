import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, getUserByEmail } from '@/lib/db'
import crypto from 'crypto'

// パスワードハッシュ化関数
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// フォールバック用のユーザーデータ
const fallbackUsers = [
  {
    id: 1,
    exam_no: '0000',
    email: 'admin@example.com',
    password_hash: hashPassword('admin123'),
    role: 'admin',
    name: '管理者（旧）'
  },
  {
    id: 2,
    exam_no: '9999',
    email: 'admin@shinko.edu.jp',
    password_hash: hashPassword('5896'),
    role: 'admin',
    name: '管理者'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { examNo, password } = await request.json()
    
    console.log('Auth request:', { examNo, hasPassword: !!password });

    let user;
    
    try {
      // 受験番号で認証
      console.log('Attempting exam number authentication:', examNo);
      user = await authenticateUser(examNo, password)
    } catch (dbError) {
      console.log('Database connection failed, using fallback authentication')
      // データベース接続エラーの場合はフォールバック認証を使用
      
      // 管理者アカウント（9999 / 5896）
      if (examNo === '9999' && password === '5896') {
        console.log('Fallback admin authentication successful (9999)');
        user = fallbackUsers[1]
      }
      // 旧管理者アカウント（0000 / admin123）
      else if (examNo === '0000' && password === 'admin123') {
        console.log('Fallback admin authentication successful (0000)');
        user = fallbackUsers[0]
      }
      // その他の学生アカウント（フォールバック認証では対応しない）
    }

    console.log('Authentication result:', { user: user ? { id: user.id, role: user.role } : null });

    if (!user) {
      return NextResponse.json(
        { error: 'ログイン情報が正しくありません' },
        { status: 401 }
      )
    }

    // 実際の運用ではJWTトークンを生成
    const token = `token_${user.id}_${Date.now()}`

    return NextResponse.json({
      user: {
        id: user.id.toString(),
        exam_no: user.exam_no,
        role: user.role,
        name: user.name
      },
      token
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
