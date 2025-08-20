import { NextRequest, NextResponse } from 'next/server'
import { getProfiles, createProfile } from '@/lib/db'

export async function GET() {
  try {
    const profiles = await getProfiles()
    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()

    if (!profileData.studentId || !profileData.fullName || !profileData.email) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    const newProfile = await createProfile(profileData)

    return NextResponse.json(newProfile, { status: 201 })
  } catch (error) {
    console.error('Failed to create profile:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
