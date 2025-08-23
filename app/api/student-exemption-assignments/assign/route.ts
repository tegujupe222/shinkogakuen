import { NextRequest, NextResponse } from 'next/server';
import { assignExemptionToStudent } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { student_id, exemption_id } = await request.json();

    if (!student_id || !exemption_id) {
      return NextResponse.json(
        { error: '学生IDと免除IDは必須です' },
        { status: 400 }
      );
    }

    const assignment = await assignExemptionToStudent(student_id, exemption_id);

    return NextResponse.json({ 
      success: true, 
      message: '免除を学生に割り当てました',
      assignment 
    });
  } catch (error) {
    console.error('Failed to assign exemption to student:', error);
    return NextResponse.json(
      { error: '免除の割り当てに失敗しました' },
      { status: 500 }
    );
  }
}
