import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = await getUserByEmail(email)

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
