import { NextRequest, NextResponse } from 'next/server'

// 簡易的なユーザーデータ（実際の運用ではデータベースを使用）
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    name: '管理者'
  },
  {
    id: '2',
    email: 'student@example.com',
    password: 'student123',
    role: 'student',
    name: '学生'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = users.find(u => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      )
    }

    // 実際の運用ではJWTトークンを生成
    const token = `token_${user.id}_${Date.now()}`

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      token
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
