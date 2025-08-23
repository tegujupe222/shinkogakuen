import { NextRequest, NextResponse } from 'next/server';
import { removeExemptionFromStudent } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { student_id, exemption_id } = await request.json();

    if (!student_id || !exemption_id) {
      return NextResponse.json(
        { error: '学生IDと免除IDは必須です' },
        { status: 400 }
      );
    }

    await removeExemptionFromStudent(student_id, exemption_id);

    return NextResponse.json({ 
      success: true, 
      message: '学生から免除を削除しました'
    });
  } catch (error) {
    console.error('Failed to remove exemption from student:', error);
    return NextResponse.json(
      { error: '免除の削除に失敗しました' },
      { status: 500 }
    );
  }
}
