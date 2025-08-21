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
    name: '管理者'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email, password, examNo } = await request.json()

    let user;
    
    try {
      // 受験番号が提供されている場合は受験番号で認証
      if (examNo) {
        user = await authenticateUser(examNo, password)
      } else {
        // メールアドレスが提供されている場合はメールアドレスで認証
        const dbUser = await getUserByEmail(email)
        if (dbUser && dbUser.password_hash === hashPassword(password)) {
          user = dbUser
        }
      }
    } catch (dbError) {
      console.log('Database connection failed, using fallback authentication')
      // データベース接続エラーの場合はフォールバック認証を使用
      if (examNo) {
        // 受験番号でのフォールバック認証（管理者のみ）
        if (examNo === '0000' && password === 'admin123') {
          user = fallbackUsers[0]
        }
      } else {
        // メールアドレスでのフォールバック認証
        user = fallbackUsers.find(u => u.email === email && u.password_hash === hashPassword(password))
      }
    }

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
