import { NextRequest, NextResponse } from 'next/server';
import { getStudentExemptionAssignments } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const assignments = await getStudentExemptionAssignments(studentId);
    
    return NextResponse.json({ 
      success: true, 
      assignments 
    });
  } catch (error) {
    console.error('Failed to get student exemption assignments:', error);
    return NextResponse.json(
      { error: '学生免除割り当ての取得に失敗しました' },
      { status: 500 }
    );
  }
}
