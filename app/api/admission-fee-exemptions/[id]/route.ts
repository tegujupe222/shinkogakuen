import { NextRequest, NextResponse } from 'next/server';
import { updateAdmissionFeeExemption, deleteAdmissionFeeExemption } from '../../../../lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { exemption_name, exemption_amount, is_active } = await request.json();

    if (!exemption_name || !exemption_amount) {
      return NextResponse.json(
        { error: '免除名と金額は必須です' },
        { status: 400 }
      );
    }

    const exemption = await updateAdmissionFeeExemption(
      parseInt(id),
      exemption_name,
      exemption_amount,
      is_active !== false
    );

    return NextResponse.json({ 
      success: true, 
      message: '入学手続金免除設定を更新しました',
      exemption 
    });
  } catch (error) {
    console.error('Failed to update admission fee exemption:', error);
    return NextResponse.json(
      { error: '入学手続金免除設定の更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const success = await deleteAdmissionFeeExemption(parseInt(id));

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: '入学手続金免除設定を削除しました'
      });
    } else {
      return NextResponse.json(
        { error: '入学手続金免除設定が見つかりません' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Failed to delete admission fee exemption:', error);
    return NextResponse.json(
      { error: '入学手続金免除設定の削除に失敗しました' },
      { status: 500 }
    );
  }
}
