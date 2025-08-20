import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/db'

export async function POST() {
  try {
    await initDatabase()
    return NextResponse.json({ message: 'データベースが正常に初期化されました' })
  } catch (error) {
    console.error('Database initialization failed:', error)
    return NextResponse.json(
      { error: 'データベース初期化に失敗しました' },
      { status: 500 }
    )
  }
}
