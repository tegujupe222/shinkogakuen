import { NextRequest, NextResponse } from 'next/server';
import { getAdmissionFeeSettings, createAdmissionFeeSettings, updateAdmissionFeeSettings } from '../../../lib/db';

export async function GET() {
  try {
    const settings = await getAdmissionFeeSettings();
    return NextResponse.json({ 
      success: true, 
      settings 
    });
  } catch (error) {
    console.error('Failed to fetch admission fee settings:', error);
    return NextResponse.json(
      { error: '入学手続金設定の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admission_fee, miscellaneous_fee, grade_fee, dedicated_deadline, combined_deadline, notes } = await request.json();

    if (!admission_fee || !miscellaneous_fee || !grade_fee || !dedicated_deadline || !combined_deadline) {
      return NextResponse.json(
        { error: 'すべての項目は必須です' },
        { status: 400 }
      );
    }

    const settings = await createAdmissionFeeSettings(
      admission_fee,
      miscellaneous_fee,
      grade_fee,
      dedicated_deadline,
      combined_deadline,
      notes
    );

    return NextResponse.json({ 
      success: true, 
      message: '入学手続金設定を作成しました',
      settings 
    });
  } catch (error) {
    console.error('Failed to create admission fee settings:', error);
    return NextResponse.json(
      { error: '入学手続金設定の作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, admission_fee, miscellaneous_fee, grade_fee, dedicated_deadline, combined_deadline, notes } = await request.json();

    if (!id || !admission_fee || !miscellaneous_fee || !grade_fee || !dedicated_deadline || !combined_deadline) {
      return NextResponse.json(
        { error: 'すべての項目は必須です' },
        { status: 400 }
      );
    }

    const settings = await updateAdmissionFeeSettings(
      id,
      admission_fee,
      miscellaneous_fee,
      grade_fee,
      dedicated_deadline,
      combined_deadline,
      notes
    );

    return NextResponse.json({ 
      success: true, 
      message: '入学手続金設定を更新しました',
      settings 
    });
  } catch (error) {
    console.error('Failed to update admission fee settings:', error);
    return NextResponse.json(
      { error: '入学手続金設定の更新に失敗しました' },
      { status: 500 }
    );
  }
}
