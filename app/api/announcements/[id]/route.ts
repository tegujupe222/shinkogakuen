import { NextRequest, NextResponse } from 'next/server'
import { getAnnouncements, updateAnnouncement, deleteAnnouncement } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const announcements = await getAnnouncements()
    const announcement = announcements.find(a => a.id.toString() === id)

    if (!announcement) {
      return NextResponse.json(
        { error: 'お知らせが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Failed to fetch announcement:', error)
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

    const updatedAnnouncement = await updateAnnouncement(parseInt(id), title, content)

    if (!updatedAnnouncement) {
      return NextResponse.json(
        { error: 'お知らせが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedAnnouncement)
  } catch (error) {
    console.error('Failed to update announcement:', error)
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
    await deleteAnnouncement(parseInt(id))

    return NextResponse.json({ message: '削除されました' })
  } catch (error) {
    console.error('Failed to delete announcement:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
