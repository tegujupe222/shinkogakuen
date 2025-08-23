import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../../types';

const AdminStudentProfiles: React.FC = () => {
    const [profiles, setProfiles] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof StudentProfile>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [filterCompleted, setFilterCompleted] = useState<string>('all');

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
            const matchesSearch = 
                profile.student_last_name?.includes(searchTerm) ||
                profile.student_first_name?.includes(searchTerm) ||
                profile.student_id?.includes(searchTerm) ||
                profile.middle_school_name?.includes(searchTerm);
            
            if (filterCompleted === 'all') return matchesSearch;
            if (filterCompleted === 'completed') {
                return matchesSearch && 
                    profile.personal_info_completed && 
                    profile.commute_info_completed && 
                    profile.art_selection_completed && 
                    profile.health_info_completed;
            }
            if (filterCompleted === 'incomplete') {
                return matchesSearch && 
                    (!profile.personal_info_completed || 
                     !profile.commute_info_completed || 
                     !profile.art_selection_completed || 
                     !profile.health_info_completed);
            }
            return matchesSearch;
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
            '個人情報完了',
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
                profile.personal_info_completed ? '完了' : '未完了',
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
            '個人情報完了',
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
            profile.personal_info_completed ? '完了' : '未完了',
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
