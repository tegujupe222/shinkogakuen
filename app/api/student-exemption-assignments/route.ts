import { NextRequest, NextResponse } from 'next/server';
import { getAllStudentExemptionAssignments } from '@/lib/db';

export async function GET() {
  try {
    const assignments = await getAllStudentExemptionAssignments();
    
    return NextResponse.json({ 
      success: true, 
      assignments 
    });
  } catch (error) {
    console.error('Failed to get student exemption assignments:', error);
    return NextResponse.json(
      { error: '学生免除割り当ての取得に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
