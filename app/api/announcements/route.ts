import { NextRequest, NextResponse } from 'next/server'
import { getAnnouncements, createAnnouncement } from '@/lib/db'

export async function GET() {
  try {
    const announcements = await getAnnouncements()
    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
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

    const newAnnouncement = await createAnnouncement(title, content, '管理者')

    return NextResponse.json(newAnnouncement, { status: 201 })
  } catch (error) {
    console.error('Failed to create announcement:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
