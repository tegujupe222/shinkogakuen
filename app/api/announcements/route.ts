import { NextRequest, NextResponse } from 'next/server'
import { getAnnouncements, createAnnouncement } from '@/lib/db'

// フォールバック用のお知らせデータ
let fallbackAnnouncements = [
  {
    id: 1,
    title: '合格発表について',
    content: '合格者の発表は3月15日に予定されています。',
    author: '管理者',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z'
  },
  {
    id: 2,
    title: '入学手続きについて',
    content: '入学手続きの詳細は後日お知らせいたします。',
    author: '管理者',
    created_at: '2024-03-02T14:30:00Z',
    updated_at: '2024-03-02T14:30:00Z'
  }
]

export async function GET() {
  try {
    const announcements = await getAnnouncements()
    return NextResponse.json(announcements)
  } catch (error) {
    console.log('Database connection failed, using fallback data')
    // データベース接続エラーの場合はフォールバックデータを使用
    return NextResponse.json(fallbackAnnouncements)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, is_published, scheduled_publish_at } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      )
    }

    try {
      const newAnnouncement = await createAnnouncement(
        title, 
        content, 
        '管理者',
        is_published || false,
        scheduled_publish_at || null
      )
      return NextResponse.json(newAnnouncement, { status: 201 })
    } catch (dbError) {
      console.log('Database connection failed, using fallback storage')
      // データベース接続エラーの場合はフォールバックストレージを使用
      const newAnnouncement = {
        id: Date.now(),
        title,
        content,
        author: '管理者',
        is_published: is_published || false,
        published_at: is_published ? new Date().toISOString() : null,
        scheduled_publish_at: scheduled_publish_at || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      fallbackAnnouncements.unshift(newAnnouncement)
      return NextResponse.json(newAnnouncement, { status: 201 })
    }
  } catch (error) {
    console.error('Failed to create announcement:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
