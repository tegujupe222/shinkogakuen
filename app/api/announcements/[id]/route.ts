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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const announcement = announcements.find(a => a.id === id);

    if (!announcement) {
      return NextResponse.json(
        { error: 'お知らせが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(announcement)
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      )
    }

    const index = announcements.findIndex(a => a.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'お知らせが見つかりません' },
        { status: 404 }
      )
    }

    announcements[index] = {
      ...announcements[index],
      title,
      content,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(announcements[index])
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = announcements.findIndex(a => a.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'お知らせが見つかりません' },
        { status: 404 }
      )
    }

    announcements.splice(index, 1)

    return NextResponse.json({ message: '削除されました' })
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
