import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/db'

export async function POST() {
  try {
    console.log('Starting database initialization...')
    
    await initDatabase()
    
    console.log('Database initialization completed successfully')
    
    return NextResponse.json({ 
      success: true,
      message: 'データベースが正常に初期化されました',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database initialization failed:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'データベース初期化に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GETメソッドでも初期化できるようにする
export async function GET() {
  return POST()
}
