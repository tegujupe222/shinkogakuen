
export type UserRole = 'student' | 'admin';

export interface User {
    id: string;
    exam_no?: string;
    email?: string;
    role: UserRole;
    name?: string;
    phone?: string;
    created_at?: string;
    updated_at?: string;
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

export interface StudentResult {
    id: string;
    exam_no: string;
    student_id?: string;
    name?: string;
    gender?: string;
    application_course?: string;
    application_type?: string;
    recommendation?: string;
    middle_school?: string;
    top_10_percent?: string;
    special_advance_top5?: string;
    advance_top5?: string;
    club_tuition_exemption?: string;
    club_fee_exemption?: string;
    club_scholarship?: string;
    accepted_course?: string;
    scholarship_student?: string;
    club_recommendation?: string;
    created_at: string;
    updated_at: string;
}

export interface StudentProfile {
    id: string;
    student_id: string;
    
    // 生徒基本情報
    student_last_name?: string;
    student_first_name?: string;
    student_last_name_kana?: string;
    student_first_name_kana?: string;
    gender?: string;
    birth_date?: string;
    registered_address?: string;
    
    // 生徒現在住所
    student_postal_code?: string;
    student_address?: string;
    student_address_detail?: string;
    student_phone?: string;
    
    // 出身校情報
    middle_school_name?: string;
    graduation_date?: string;
    
    // 保護者1情報
    guardian1_last_name?: string;
    guardian1_first_name?: string;
    guardian1_last_name_kana?: string;
    guardian1_first_name_kana?: string;
    guardian1_postal_code?: string;
    guardian1_address?: string;
    guardian1_address_detail?: string;
    guardian1_phone?: string;
    guardian1_relationship?: string;
    guardian1_relationship_other?: string;
    guardian1_email?: string;
    guardian1_workplace_name?: string;
    guardian1_workplace_postal_code?: string;
    guardian1_workplace_address?: string;
    guardian1_workplace_address_detail?: string;
    guardian1_workplace_phone?: string;
    
    // 保護者2情報
    guardian2_last_name?: string;
    guardian2_first_name?: string;
    guardian2_last_name_kana?: string;
    guardian2_first_name_kana?: string;
    guardian2_postal_code?: string;
    guardian2_address?: string;
    guardian2_address_detail?: string;
    guardian2_phone?: string;
    guardian2_relationship?: string;
    guardian2_relationship_other?: string;
    guardian2_email?: string;
    
    // 書類送付先
    document_recipient_last_name?: string;
    document_recipient_first_name?: string;
    document_recipient_postal_code?: string;
    document_recipient_address?: string;
    document_recipient_address_detail?: string;
    
    // 緊急連絡先
    emergency1_last_name?: string;
    emergency1_first_name?: string;
    emergency1_phone?: string;
    emergency1_relationship?: string;
    emergency1_relationship_other?: string;
    emergency2_last_name?: string;
    emergency2_first_name?: string;
    emergency2_phone?: string;
    emergency2_relationship?: string;
    emergency2_relationship_other?: string;
    
    // 兄弟姉妹情報
    has_siblings_at_school?: boolean;
    
    // 家族情報（最大6人）
    family1_last_name?: string;
    family1_first_name?: string;
    family1_relationship?: string;
    family1_relationship_other?: string;
    family1_birth_date?: string;
    family1_living_status?: string;
    family1_workplace_school?: string;
    
    family2_last_name?: string;
    family2_first_name?: string;
    family2_relationship?: string;
    family2_relationship_other?: string;
    family2_birth_date?: string;
    family2_living_status?: string;
    family2_workplace_school?: string;
    
    family3_last_name?: string;
    family3_first_name?: string;
    family3_relationship?: string;
    family3_relationship_other?: string;
    family3_birth_date?: string;
    family3_living_status?: string;
    family3_workplace_school?: string;
    
    family4_last_name?: string;
    family4_first_name?: string;
    family4_relationship?: string;
    family4_relationship_other?: string;
    family4_birth_date?: string;
    family4_living_status?: string;
    family4_workplace_school?: string;
    
    family5_last_name?: string;
    family5_first_name?: string;
    family5_relationship?: string;
    family5_relationship_other?: string;
    family5_birth_date?: string;
    family5_living_status?: string;
    family5_workplace_school?: string;
    
    family6_last_name?: string;
    family6_first_name?: string;
    family6_relationship?: string;
    family6_relationship_other?: string;
    family6_birth_date?: string;
    family6_living_status?: string;
    family6_workplace_school?: string;
    
    // 通学方法
    commute_method?: string;
    jr_start?: string;
    jr_end?: string;
    subway_nishin_start?: string;
    subway_nishin_end?: string;
    subway_kaigan_start?: string;
    subway_kaigan_end?: string;
    hankyu_start?: string;
    hankyu_end?: string;
    kobe_electric_start?: string;
    kobe_electric_end?: string;
    hanshin_start?: string;
    hanshin_end?: string;
    sanyo_start?: string;
    sanyo_end?: string;
    kobe_bus_start?: string;
    kobe_bus_end?: string;
    sanyo_bus_start?: string;
    sanyo_bus_end?: string;
    shinhi_bus_start?: string;
    shinhi_bus_end?: string;
    other1_transport?: string;
    other1_start?: string;
    other1_end?: string;
    other2_transport?: string;
    other2_start?: string;
    other2_end?: string;
    via_station?: string;
    
    // 芸術科目選択
    art_first_choice?: string;
    art_second_choice?: string;
    
    // 持病・健康情報
    has_chronic_illness?: boolean;
    accommodation_notes?: string;
    family_communication?: string;
    chronic_illness_details?: string;
    
    // フォーム進捗状況
    personal_info_completed?: boolean;
    commute_info_completed?: boolean;
    art_selection_completed?: boolean;
    health_info_completed?: boolean;
    
    created_at: string;
    updated_at: string;
}

export interface FormSetting {
    id: string;
    field_key: string;
    field_label: string;
    field_type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
    field_group: string;
    field_order: number;
    is_required: boolean;
    is_visible: boolean;
    is_editable: boolean;
    validation_rules?: string;
    options?: string;
    placeholder?: string;
    help_text?: string;
    created_at: string;
    updated_at: string;
}

export interface AdmissionFeeSettings {
    id: string;
    admission_fee: number;
    miscellaneous_fee: number;
    grade_fee: number;
    dedicated_deadline: string;
    combined_deadline: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface AdmissionFeeExemption {
    id: string;
    exemption_name: string;
    exemption_amount: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface StudentExemptionAssignment {
    id: string;
    student_id: string;
    exemption_id: string;
    exemption_name: string;
    exemption_amount: number;
    assigned_at: string;
}
