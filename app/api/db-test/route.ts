import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // 簡単なクエリで接続をテスト
    const result = await sql`SELECT NOW() as current_time, version() as db_version`
    
    console.log('Database connection successful:', result.rows[0])
    
    return NextResponse.json({
      success: true,
      message: 'データベース接続が正常です',
      data: result.rows[0],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'データベース接続に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
