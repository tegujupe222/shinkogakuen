import { NextRequest, NextResponse } from 'next/server'
import { getAnnouncements } from '@/lib/db'

// フォールバック用のお知らせデータ（公開済みのみ）
let fallbackAnnouncements = [
  {
    id: 1,
    title: '合格発表について',
    content: '合格者の発表は3月15日に予定されています。',
    author: '管理者',
    is_published: true,
    published_at: '2024-03-01T10:00:00Z',
    scheduled_publish_at: null,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z'
  },
  {
    id: 2,
    title: '入学手続きについて',
    content: '入学手続きの詳細は後日お知らせいたします。',
    author: '管理者',
    is_published: true,
    published_at: '2024-03-02T14:30:00Z',
    scheduled_publish_at: null,
    created_at: '2024-03-02T14:30:00Z',
    updated_at: '2024-03-02T14:30:00Z'
  }
]

export async function GET() {
  try {
    const announcements = await getAnnouncements(true) // 学生向け
    return NextResponse.json(announcements)
  } catch (error) {
    console.log('Database connection failed, using fallback data')
    // データベース接続エラーの場合はフォールバックデータを使用
    return NextResponse.json(fallbackAnnouncements)
  }
}
