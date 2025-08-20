import { NextRequest, NextResponse } from 'next/server'

// 簡易的なお知らせデータ（実際の運用ではデータベースを使用）
let announcements = [
  {
    id: '1',
    title: '合格発表について',
    content: '合格者の発表は3月15日に予定されています。',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    author: '管理者'
  },
  {
    id: '2',
    title: '入学手続きについて',
    content: '入学手続きの詳細は後日お知らせいたします。',
    createdAt: '2024-03-02T14:30:00Z',
    updatedAt: '2024-03-02T14:30:00Z',
    author: '管理者'
  }
]

export async function GET() {
  try {
    return NextResponse.json(announcements)
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      )
    }

    const newAnnouncement = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: '管理者'
    }

    announcements.unshift(newAnnouncement)

    return NextResponse.json(newAnnouncement, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
