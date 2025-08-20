import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db'

// フォールバック用のユーザーデータ
const fallbackUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    password_hash: 'admin123',
    role: 'admin',
    name: '管理者'
  },
  {
    id: 2,
    email: 'student@example.com',
    password_hash: 'student123',
    role: 'student',
    name: '学生'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    let user;
    
    try {
      // まずデータベースからユーザーを取得
      user = await getUserByEmail(email)
    } catch (dbError) {
      console.log('Database connection failed, using fallback authentication')
      // データベース接続エラーの場合はフォールバック認証を使用
      user = fallbackUsers.find(u => u.email === email)
    }

    if (!user || user.password_hash !== password) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      )
    }

    // 実際の運用ではJWTトークンを生成
    const token = `token_${user.id}_${Date.now()}`

    return NextResponse.json({
      user: {
        id: user.id.toString(),
        email: user.email,
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
