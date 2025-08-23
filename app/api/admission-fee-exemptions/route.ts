import { NextRequest, NextResponse } from 'next/server';
import { getAdmissionFeeExemptions, createAdmissionFeeExemption } from '../../../lib/db';

export async function GET() {
  try {
    const exemptions = await getAdmissionFeeExemptions();
    return NextResponse.json({ 
      success: true, 
      exemptions 
    });
  } catch (error) {
    console.error('Failed to fetch admission fee exemptions:', error);
    return NextResponse.json(
      { error: '入学手続金免除設定の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { exemption_name, exemption_amount } = await request.json();

    if (!exemption_name || !exemption_amount) {
      return NextResponse.json(
        { error: '免除名と金額は必須です' },
        { status: 400 }
      );
    }

    const exemption = await createAdmissionFeeExemption(exemption_name, exemption_amount);

    return NextResponse.json({ 
      success: true, 
      message: '入学手続金免除設定を作成しました',
      exemption 
    });
  } catch (error) {
    console.error('Failed to create admission fee exemption:', error);
    return NextResponse.json(
      { error: '入学手続金免除設定の作成に失敗しました' },
      { status: 500 }
    );
  }
}
