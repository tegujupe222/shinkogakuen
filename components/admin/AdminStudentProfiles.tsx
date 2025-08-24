import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../../types';

const AdminStudentProfiles: React.FC = () => {
    const [profiles, setProfiles] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof StudentProfile>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [filterCompleted, setFilterCompleted] = useState<string>('all');
    const [filterGender, setFilterGender] = useState<string>('all');
    const [filterMiddleSchool, setFilterMiddleSchool] = useState<string>('all');
    const [filterDateRange, setFilterDateRange] = useState<{
        start: string;
        end: string;
    }>({ start: '', end: '' });
    const [filterSection, setFilterSection] = useState<string>('all');

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/profiles');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setProfiles(data.profiles);
                }
            }
        } catch (error) {
            console.error('Failed to fetch profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: keyof StudentProfile) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredAndSortedProfiles = profiles
        .filter(profile => {
            // 検索フィルター
            const matchesSearch = 
                profile.student_last_name?.includes(searchTerm) ||
                profile.student_first_name?.includes(searchTerm) ||
                profile.student_id?.includes(searchTerm) ||
                profile.middle_school_name?.includes(searchTerm);
            
            if (!matchesSearch) return false;
            
            // 完了状況フィルター
            if (filterCompleted !== 'all') {
                if (filterCompleted === 'completed') {
                    if (!(profile.personal_info_completed && 
                          profile.commute_info_completed && 
                          profile.art_selection_completed && 
                          profile.health_info_completed)) return false;
                } else if (filterCompleted === 'incomplete') {
                    if (!(!profile.personal_info_completed || 
                          !profile.commute_info_completed || 
                          !profile.art_selection_completed || 
                          !profile.health_info_completed)) return false;
                }
            }
            
            // 性別フィルター
            if (filterGender !== 'all') {
                if (profile.gender !== filterGender) return false;
            }
            
            // 出身中学校フィルター
            if (filterMiddleSchool !== 'all') {
                if (profile.middle_school_name !== filterMiddleSchool) return false;
            }
            
            // セクション別フィルター
            if (filterSection !== 'all') {
                if (filterSection === 'personal' && !profile.personal_info_completed) return false;
                if (filterSection === 'commute' && !profile.commute_info_completed) return false;
                if (filterSection === 'art' && !profile.art_selection_completed) return false;
                if (filterSection === 'health' && !profile.health_info_completed) return false;
            }
            
            // 日付範囲フィルター
            if (filterDateRange.start || filterDateRange.end) {
                const profileDate = new Date(profile.created_at);
                if (filterDateRange.start) {
                    const startDate = new Date(filterDateRange.start);
                    if (profileDate < startDate) return false;
                }
                if (filterDateRange.end) {
                    const endDate = new Date(filterDateRange.end);
                    endDate.setHours(23, 59, 59, 999); // 終了日の23:59:59まで
                    if (profileDate > endDate) return false;
                }
            }
            
            return true;
        })
        .sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            
            if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                return sortDirection === 'asc' 
                    ? (aValue === bValue ? 0 : aValue ? 1 : -1)
                    : (aValue === bValue ? 0 : aValue ? -1 : 1);
            }
            
            return 0;
        });

    const exportToCSV = () => {
        const headers = [
            '学生ID',
            '姓',
            '名',
            '姓（ふりがな）',
            '名（ふりがな）',
            '性別',
            '生年月日',
            '本籍地',
            '郵便番号',
            '住所',
            '番地・部屋番号',
            '電話番号',
            '中学校名',
            '卒業年月日',
            // 保護者1情報
            '保護者1姓',
            '保護者1名',
            '保護者1姓（ふりがな）',
            '保護者1名（ふりがな）',
            '保護者1郵便番号',
            '保護者1住所',
            '保護者1番地・部屋番号',
            '保護者1電話番号',
            '保護者1関係',
            '保護者1関係（その他）',
            '保護者1メールアドレス',
            // 保護者2情報
            '保護者2姓',
            '保護者2名',
            '保護者2姓（ふりがな）',
            '保護者2名（ふりがな）',
            '保護者2郵便番号',
            '保護者2住所',
            '保護者2番地・部屋番号',
            '保護者2電話番号',
            '保護者2関係',
            '保護者2関係（その他）',
            '保護者2メールアドレス',
            // 書類送付先
            '書類送付先姓',
            '書類送付先名',
            '書類送付先郵便番号',
            '書類送付先住所',
            '書類送付先番地・部屋番号',
            // 緊急連絡先
            '緊急連絡先1姓',
            '緊急連絡先1名',
            '緊急連絡先1電話番号',
            '緊急連絡先1関係',
            '緊急連絡先1関係（その他）',
            '緊急連絡先2姓',
            '緊急連絡先2名',
            '緊急連絡先2電話番号',
            '緊急連絡先2関係',
            '緊急連絡先2関係（その他）',
            // 兄弟姉妹情報
            '本校在籍の兄弟姉妹の有無',
            // 家族情報（最大6人）
            '家族1姓',
            '家族1名',
            '家族1関係',
            '家族1関係（その他）',
            '家族1生年月日',
            '家族1同居/別居',
            '家族1勤務先または学校名',
            '家族2姓',
            '家族2名',
            '家族2関係',
            '家族2関係（その他）',
            '家族2生年月日',
            '家族2同居/別居',
            '家族2勤務先または学校名',
            '家族3姓',
            '家族3名',
            '家族3関係',
            '家族3関係（その他）',
            '家族3生年月日',
            '家族3同居/別居',
            '家族3勤務先または学校名',
            '家族4姓',
            '家族4名',
            '家族4関係',
            '家族4関係（その他）',
            '家族4生年月日',
            '家族4同居/別居',
            '家族4勤務先または学校名',
            '家族5姓',
            '家族5名',
            '家族5関係',
            '家族5関係（その他）',
            '家族5生年月日',
            '家族5同居/別居',
            '家族5勤務先または学校名',
            '家族6姓',
            '家族6名',
            '家族6関係',
            '家族6関係（その他）',
            '家族6生年月日',
            '家族6同居/別居',
            '家族6勤務先または学校名',
            '個人情報完了',
            '家庭情報完了',
            '通学方法完了',
            '芸術科目完了',
            '健康情報完了',
            '作成日時',
            '更新日時'
        ];

        const csvContent = [
            headers.join(','),
            ...filteredAndSortedProfiles.map(profile => [
                profile.student_id,
                profile.student_last_name || '',
                profile.student_first_name || '',
                profile.student_last_name_kana || '',
                profile.student_first_name_kana || '',
                profile.gender || '',
                profile.birth_date || '',
                profile.registered_address || '',
                profile.student_postal_code || '',
                profile.student_address || '',
                profile.student_address_detail || '',
                profile.student_phone || '',
                profile.middle_school_name || '',
                profile.graduation_date || '',
                // 保護者1情報
                profile.guardian1_last_name || '',
                profile.guardian1_first_name || '',
                profile.guardian1_last_name_kana || '',
                profile.guardian1_first_name_kana || '',
                profile.guardian1_postal_code || '',
                profile.guardian1_address || '',
                profile.guardian1_address_detail || '',
                profile.guardian1_phone || '',
                profile.guardian1_relationship || '',
                profile.guardian1_relationship_other || '',
                profile.guardian1_email || '',
                // 保護者2情報
                profile.guardian2_last_name || '',
                profile.guardian2_first_name || '',
                profile.guardian2_last_name_kana || '',
                profile.guardian2_first_name_kana || '',
                profile.guardian2_postal_code || '',
                profile.guardian2_address || '',
                profile.guardian2_address_detail || '',
                profile.guardian2_phone || '',
                profile.guardian2_relationship || '',
                profile.guardian2_relationship_other || '',
                profile.guardian2_email || '',
                // 書類送付先
                profile.document_recipient_last_name || '',
                profile.document_recipient_first_name || '',
                profile.document_recipient_postal_code || '',
                profile.document_recipient_address || '',
                profile.document_recipient_address_detail || '',
                // 緊急連絡先
                profile.emergency1_last_name || '',
                profile.emergency1_first_name || '',
                profile.emergency1_phone || '',
                profile.emergency1_relationship || '',
                profile.emergency1_relationship_other || '',
                profile.emergency2_last_name || '',
                profile.emergency2_first_name || '',
                profile.emergency2_phone || '',
                profile.emergency2_relationship || '',
                profile.emergency2_relationship_other || '',
                // 兄弟姉妹情報
                profile.has_siblings_at_school ? 'あり' : 'なし',
                // 家族情報（最大6人）
                profile.family1_last_name || '',
                profile.family1_first_name || '',
                profile.family1_relationship || '',
                profile.family1_relationship_other || '',
                profile.family1_birth_date || '',
                profile.family1_living_status || '',
                profile.family1_workplace_school || '',
                profile.family2_last_name || '',
                profile.family2_first_name || '',
                profile.family2_relationship || '',
                profile.family2_relationship_other || '',
                profile.family2_birth_date || '',
                profile.family2_living_status || '',
                profile.family2_workplace_school || '',
                profile.family3_last_name || '',
                profile.family3_first_name || '',
                profile.family3_relationship || '',
                profile.family3_relationship_other || '',
                profile.family3_birth_date || '',
                profile.family3_living_status || '',
                profile.family3_workplace_school || '',
                profile.family4_last_name || '',
                profile.family4_first_name || '',
                profile.family4_relationship || '',
                profile.family4_relationship_other || '',
                profile.family4_birth_date || '',
                profile.family4_living_status || '',
                profile.family4_workplace_school || '',
                profile.family5_last_name || '',
                profile.family5_first_name || '',
                profile.family5_relationship || '',
                profile.family5_relationship_other || '',
                profile.family5_birth_date || '',
                profile.family5_living_status || '',
                profile.family5_workplace_school || '',
                profile.family6_last_name || '',
                profile.family6_first_name || '',
                profile.family6_relationship || '',
                profile.family6_relationship_other || '',
                profile.family6_birth_date || '',
                profile.family6_living_status || '',
                profile.family6_workplace_school || '',
                profile.personal_info_completed ? '完了' : '未完了',
                profile.family_info_completed ? '完了' : '未完了',
                profile.commute_info_completed ? '完了' : '未完了',
                profile.art_selection_completed ? '完了' : '未完了',
                profile.health_info_completed ? '完了' : '未完了',
                profile.created_at,
                profile.updated_at
            ].join(','))
        ].join('\n');

        // BOM（Byte Order Mark）を追加してUTF-8エンコーディングを明示
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;
        
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `学生プロフィール_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToExcel = () => {
        const headers = [
            '学生ID',
            '姓',
            '名',
            '姓（ふりがな）',
            '名（ふりがな）',
            '性別',
            '生年月日',
            '本籍地',
            '郵便番号',
            '住所',
            '番地・部屋番号',
            '電話番号',
            '中学校名',
            '卒業年月日',
            // 保護者1情報
            '保護者1姓',
            '保護者1名',
            '保護者1姓（ふりがな）',
            '保護者1名（ふりがな）',
            '保護者1郵便番号',
            '保護者1住所',
            '保護者1番地・部屋番号',
            '保護者1電話番号',
            '保護者1関係',
            '保護者1関係（その他）',
            '保護者1メールアドレス',
            // 保護者2情報
            '保護者2姓',
            '保護者2名',
            '保護者2姓（ふりがな）',
            '保護者2名（ふりがな）',
            '保護者2郵便番号',
            '保護者2住所',
            '保護者2番地・部屋番号',
            '保護者2電話番号',
            '保護者2関係',
            '保護者2関係（その他）',
            '保護者2メールアドレス',
            // 書類送付先
            '書類送付先姓',
            '書類送付先名',
            '書類送付先郵便番号',
            '書類送付先住所',
            '書類送付先番地・部屋番号',
            // 緊急連絡先
            '緊急連絡先1姓',
            '緊急連絡先1名',
            '緊急連絡先1電話番号',
            '緊急連絡先1関係',
            '緊急連絡先1関係（その他）',
            '緊急連絡先2姓',
            '緊急連絡先2名',
            '緊急連絡先2電話番号',
            '緊急連絡先2関係',
            '緊急連絡先2関係（その他）',
            // 兄弟姉妹情報
            '本校在籍の兄弟姉妹の有無',
            // 家族情報（最大6人）
            '家族1姓',
            '家族1名',
            '家族1関係',
            '家族1関係（その他）',
            '家族1生年月日',
            '家族1同居/別居',
            '家族1勤務先または学校名',
            '家族2姓',
            '家族2名',
            '家族2関係',
            '家族2関係（その他）',
            '家族2生年月日',
            '家族2同居/別居',
            '家族2勤務先または学校名',
            '家族3姓',
            '家族3名',
            '家族3関係',
            '家族3関係（その他）',
            '家族3生年月日',
            '家族3同居/別居',
            '家族3勤務先または学校名',
            '家族4姓',
            '家族4名',
            '家族4関係',
            '家族4関係（その他）',
            '家族4生年月日',
            '家族4同居/別居',
            '家族4勤務先または学校名',
            '家族5姓',
            '家族5名',
            '家族5関係',
            '家族5関係（その他）',
            '家族5生年月日',
            '家族5同居/別居',
            '家族5勤務先または学校名',
            '家族6姓',
            '家族6名',
            '家族6関係',
            '家族6関係（その他）',
            '家族6生年月日',
            '家族6同居/別居',
            '家族6勤務先または学校名',
            '個人情報完了',
            '家庭情報完了',
            '通学方法完了',
            '芸術科目完了',
            '健康情報完了',
            '作成日時',
            '更新日時'
        ];

        const data = filteredAndSortedProfiles.map(profile => [
            profile.student_id,
            profile.student_last_name || '',
            profile.student_first_name || '',
            profile.student_last_name_kana || '',
            profile.student_first_name_kana || '',
            profile.gender || '',
            profile.birth_date || '',
            profile.registered_address || '',
            profile.student_postal_code || '',
            profile.student_address || '',
            profile.student_address_detail || '',
            profile.student_phone || '',
            profile.middle_school_name || '',
            profile.graduation_date || '',
            // 保護者1情報
            profile.guardian1_last_name || '',
            profile.guardian1_first_name || '',
            profile.guardian1_last_name_kana || '',
            profile.guardian1_first_name_kana || '',
            profile.guardian1_postal_code || '',
            profile.guardian1_address || '',
            profile.guardian1_address_detail || '',
            profile.guardian1_phone || '',
            profile.guardian1_relationship || '',
            profile.guardian1_relationship_other || '',
            profile.guardian1_email || '',
            // 保護者2情報
            profile.guardian2_last_name || '',
            profile.guardian2_first_name || '',
            profile.guardian2_last_name_kana || '',
            profile.guardian2_first_name_kana || '',
            profile.guardian2_postal_code || '',
            profile.guardian2_address || '',
            profile.guardian2_address_detail || '',
            profile.guardian2_phone || '',
            profile.guardian2_relationship || '',
            profile.guardian2_relationship_other || '',
            profile.guardian2_email || '',
            // 書類送付先
            profile.document_recipient_last_name || '',
            profile.document_recipient_first_name || '',
            profile.document_recipient_postal_code || '',
            profile.document_recipient_address || '',
            profile.document_recipient_address_detail || '',
            // 緊急連絡先
            profile.emergency1_last_name || '',
            profile.emergency1_first_name || '',
            profile.emergency1_phone || '',
            profile.emergency1_relationship || '',
            profile.emergency1_relationship_other || '',
            profile.emergency2_last_name || '',
            profile.emergency2_first_name || '',
            profile.emergency2_phone || '',
            profile.emergency2_relationship || '',
            profile.emergency2_relationship_other || '',
            // 兄弟姉妹情報
            profile.has_siblings_at_school ? 'あり' : 'なし',
            // 家族情報（最大6人）
            profile.family1_last_name || '',
            profile.family1_first_name || '',
            profile.family1_relationship || '',
            profile.family1_relationship_other || '',
            profile.family1_birth_date || '',
            profile.family1_living_status || '',
            profile.family1_workplace_school || '',
            profile.family2_last_name || '',
            profile.family2_first_name || '',
            profile.family2_relationship || '',
            profile.family2_relationship_other || '',
            profile.family2_birth_date || '',
            profile.family2_living_status || '',
            profile.family2_workplace_school || '',
            profile.family3_last_name || '',
            profile.family3_first_name || '',
            profile.family3_relationship || '',
            profile.family3_relationship_other || '',
            profile.family3_birth_date || '',
            profile.family3_living_status || '',
            profile.family3_workplace_school || '',
            profile.family4_last_name || '',
            profile.family4_first_name || '',
            profile.family4_relationship || '',
            profile.family4_relationship_other || '',
            profile.family4_birth_date || '',
            profile.family4_living_status || '',
            profile.family4_workplace_school || '',
            profile.family5_last_name || '',
            profile.family5_first_name || '',
            profile.family5_relationship || '',
            profile.family5_relationship_other || '',
            profile.family5_birth_date || '',
            profile.family5_living_status || '',
            profile.family5_workplace_school || '',
            profile.family6_last_name || '',
            profile.family6_first_name || '',
            profile.family6_relationship || '',
            profile.family6_relationship_other || '',
            profile.family6_birth_date || '',
            profile.family6_living_status || '',
            profile.family6_workplace_school || '',
            profile.personal_info_completed ? '完了' : '未完了',
            profile.family_info_completed ? '完了' : '未完了',
            profile.commute_info_completed ? '完了' : '未完了',
            profile.art_selection_completed ? '完了' : '未完了',
            profile.health_info_completed ? '完了' : '未完了',
            profile.created_at,
            profile.updated_at
        ]);

        // xlsxライブラリを使用してExcelファイルを作成
        const XLSX = require('xlsx');
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '学生プロフィール');
        
        // Excelファイルをダウンロード
        XLSX.writeFile(workbook, `学生プロフィール_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const deleteProfile = async (studentId: string) => {
        if (!confirm('このプロフィールを削除しますか？')) return;
        
        try {
            const response = await fetch(`/api/profiles/${studentId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setProfiles(profiles.filter(p => p.student_id !== studentId));
            }
        } catch (error) {
            console.error('Failed to delete profile:', error);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">プロフィールを読み込み中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">学生プロフィール管理</h2>
                <p className="text-gray-600">学生のプロフィール情報を管理します</p>
            </div>

            {/* 検索・フィルター・エクスポート */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="名前、学生ID、中学校名で検索"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">完了状況</label>
                        <select
                            value={filterCompleted}
                            onChange={(e) => setFilterCompleted(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">すべて</option>
                            <option value="completed">完了済み</option>
                            <option value="incomplete">未完了</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                        <select
                            value={filterGender}
                            onChange={(e) => setFilterGender(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">すべて</option>
                            <option value="男">男</option>
                            <option value="女">女</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">セクション別</label>
                        <select
                            value={filterSection}
                            onChange={(e) => setFilterSection(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">すべて</option>
                            <option value="personal">個人情報完了</option>
                            <option value="commute">通学方法完了</option>
                            <option value="art">芸術科目完了</option>
                            <option value="health">健康情報完了</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">出身中学校</label>
                        <select
                            value={filterMiddleSchool}
                            onChange={(e) => setFilterMiddleSchool(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">すべて</option>
                            {Array.from(new Set(profiles.map(p => p.middle_school_name).filter(Boolean))).map(school => (
                                <option key={school} value={school}>{school}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">登録日（開始）</label>
                        <input
                            type="date"
                            value={filterDateRange.start}
                            onChange={(e) => setFilterDateRange(prev => ({
                                ...prev,
                                start: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">登録日（終了）</label>
                        <input
                            type="date"
                            value={filterDateRange.end}
                            onChange={(e) => setFilterDateRange(prev => ({
                                ...prev,
                                end: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterCompleted('all');
                                setFilterGender('all');
                                setFilterMiddleSchool('all');
                                setFilterDateRange({ start: '', end: '' });
                                setFilterSection('all');
                            }}
                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            フィルターリセット
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                            <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="hidden sm:inline">CSV出力</span>
                            <span className="sm:hidden">CSV</span>
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="hidden sm:inline">Excel出力</span>
                            <span className="sm:hidden">Excel</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* プロフィール一覧 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th 
                                        className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('student_id')}
                                    >
                                        <span className="hidden sm:inline">学生ID</span>
                                        <span className="sm:hidden">ID</span>
                                        {sortField === 'student_id' && (
                                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </th>
                                    <th 
                                        className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('student_last_name')}
                                    >
                                        氏名
                                        {sortField === 'student_last_name' && (
                                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </th>
                                    <th 
                                        className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('middle_school_name')}
                                    >
                                        中学校名
                                        {sortField === 'middle_school_name' && (
                                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </th>
                                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        進捗状況
                                    </th>
                                    <th 
                                        className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        作成日時
                                        {sortField === 'created_at' && (
                                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </th>
                                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedProfiles.map((profile) => (
                                <tr key={profile.id} className="hover:bg-gray-50">
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {profile.student_id}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {profile.student_last_name} {profile.student_first_name}
                                    </td>
                                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {profile.middle_school_name || '-'}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                profile.personal_info_completed 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                個人
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                profile.commute_info_completed 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                通学
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                profile.art_selection_completed 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                芸術
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                profile.health_info_completed 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                健康
                                            </span>
                                        </div>
                                    </td>
                                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(profile.created_at).toLocaleDateString('ja-JP')}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => deleteProfile(profile.student_id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredAndSortedProfiles.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">プロフィールが見つかりません</p>
                    </div>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
                総件数: {filteredAndSortedProfiles.length}件
            </div>
        </div>
    );
};

export default AdminStudentProfiles;
