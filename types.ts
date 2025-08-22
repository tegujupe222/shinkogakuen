
export type UserRole = 'student' | 'admin';

export interface User {
    id: string;
    exam_no?: string;
    email?: string;
    role: UserRole;
    name?: string;
}

export interface AuthenticatedUser extends User {
    // 認証済みユーザーの追加フィールド
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: string;
}

export interface Document {
    id: string;
    name: string;
    fileUrl: string;
    fileName: string;
    uploadedAt: string;
}

export interface Certificate {
    id: string;
    studentId: string;
    fileUrl: string;
    fileName: string;
    issuedAt: string;
}

export interface Profile {
    studentId: string;
    fullName: string;
    kana: string;
    postalCode: string;
    address: string;
    guardianName: string;
    phone: string;
    email: string;
    updatedAt: string;
}

export interface StudentResult {
    id: string;
    exam_no: string;
    name: string;
    application_type: string;
    application_course: string; // G列: 出願時のコース
    gender: string;
    middle_school: string;
    recommendation: string;
    club_recommendation: string;
    accepted_course: string;
    top_10_percent: string;
    special_advance_top5: string;
    advance_top5: string;
    club_tuition_exemption: boolean;
    club_fee_exemption: boolean;
    club_scholarship: boolean;
    scholarship_student: string;
    created_at: string;
    updated_at: string;
}
