'use client';

import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../../types';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import DownloadIcon from '../icons/DownloadIcon';
import XIcon from '../icons/XIcon';

const AdminStudentProfiles: React.FC = () => {
    const [profiles, setProfiles] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const response = await fetch('/api/profiles');
            if (response.ok) {
                const data = await response.json();
                setProfiles(data);
            }
        } catch (error) {
            console.error('Failed to fetch profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const filteredAndSortedProfiles = () => {
        let filtered = profiles.filter(profile => {
            const searchLower = searchTerm.toLowerCase();
            return (
                profile.student_id?.toLowerCase().includes(searchLower) ||
                `${profile.student_last_name}${profile.student_first_name}`.toLowerCase().includes(searchLower) ||
                `${profile.student_last_name_kana}${profile.student_first_name_kana}`.toLowerCase().includes(searchLower) ||
                profile.middle_school_name?.toLowerCase().includes(searchLower)
            );
        });

        filtered.sort((a, b) => {
            let aValue = a[sortBy as keyof StudentProfile] || '';
            let bValue = b[sortBy as keyof StudentProfile] || '';

            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    };

    const handleDownloadCSV = () => {
        const headers = [
            '学生ID', '氏名', 'フリガナ', '性別', '生年月日', '出身中学校', '卒業年月日',
            '保護者1氏名', '保護者1電話番号', '保護者1メールアドレス',
            '保護者2氏名', '保護者2電話番号', '保護者2メールアドレス',
            '通学方法', '芸術科目第1希望', '芸術科目第2希望', '持病の有無',
            '個人情報完了', '通学情報完了', '芸術選択完了', '健康情報完了'
        ];

        const csvData = filteredAndSortedProfiles().map(profile => [
            profile.student_id || '',
            `${profile.student_last_name || ''} ${profile.student_first_name || ''}`.trim(),
            `${profile.student_last_name_kana || ''} ${profile.student_first_name_kana || ''}`.trim(),
            profile.gender || '',
            profile.birth_date || '',
            profile.middle_school_name || '',
            profile.graduation_date || '',
            `${profile.guardian1_last_name || ''} ${profile.guardian1_first_name || ''}`.trim(),
            profile.guardian1_phone || '',
            profile.guardian1_email || '',
            `${profile.guardian2_last_name || ''} ${profile.guardian2_first_name || ''}`.trim(),
            profile.guardian2_phone || '',
            profile.guardian2_email || '',
            profile.commute_method || '',
            profile.art_first_choice || '',
            profile.art_second_choice || '',
            profile.has_chronic_illness ? 'あり' : 'なし',
            profile.personal_info_completed ? '完了' : '未完了',
            profile.commute_info_completed ? '完了' : '未完了',
            profile.art_selection_completed ? '完了' : '未完了',
            profile.health_info_completed ? '完了' : '未完了'
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `学生プロフィール_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await fetch('/api/profiles/export-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ profiles: filteredAndSortedProfiles() }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `学生プロフィール_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Failed to download Excel:', error);
            setMessage('Excelファイルのダウンロードに失敗しました');
        }
    };

    const ProfileDetailModal = ({ profile, onClose }: { profile: StudentProfile; onClose: () => void }) => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">プロフィール詳細</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* 基本情報 */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">基本情報</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">学生ID</p>
                                    <p className="font-medium">{profile.student_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">氏名</p>
                                    <p className="font-medium">{profile.student_last_name} {profile.student_first_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">フリガナ</p>
                                    <p className="font-medium">{profile.student_last_name_kana} {profile.student_first_name_kana}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">性別</p>
                                    <p className="font-medium">{profile.gender}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">生年月日</p>
                                    <p className="font-medium">{profile.birth_date}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">出身中学校</p>
                                    <p className="font-medium">{profile.middle_school_name}</p>
                                </div>
                            </div>
                        </div>

                        {/* 保護者情報 */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">保護者情報</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">保護者1氏名</p>
                                    <p className="font-medium">{profile.guardian1_last_name} {profile.guardian1_first_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">保護者1電話番号</p>
                                    <p className="font-medium">{profile.guardian1_phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">保護者1メールアドレス</p>
                                    <p className="font-medium">{profile.guardian1_email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">保護者1との関係</p>
                                    <p className="font-medium">{profile.guardian1_relationship}</p>
                                </div>
                            </div>
                        </div>

                        {/* 通学・芸術科目 */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">通学・芸術科目</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">通学方法</p>
                                    <p className="font-medium">{profile.commute_method}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">芸術科目第1希望</p>
                                    <p className="font-medium">{profile.art_first_choice}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">芸術科目第2希望</p>
                                    <p className="font-medium">{profile.art_second_choice}</p>
                                </div>
                            </div>
                        </div>

                        {/* 健康情報 */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">健康情報</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">持病の有無</p>
                                    <p className="font-medium">{profile.has_chronic_illness ? 'あり' : 'なし'}</p>
                                </div>
                                {profile.has_chronic_illness && (
                                    <div>
                                        <p className="text-sm text-gray-600">持病詳細</p>
                                        <p className="font-medium">{profile.chronic_illness_details}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 進捗状況 */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">進捗状況</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">個人情報</p>
                                    <p className="font-medium">{profile.personal_info_completed ? '完了' : '未完了'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">通学情報</p>
                                    <p className="font-medium">{profile.commute_info_completed ? '完了' : '未完了'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">芸術選択</p>
                                    <p className="font-medium">{profile.art_selection_completed ? '完了' : '未完了'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">健康情報</p>
                                    <p className="font-medium">{profile.health_info_completed ? '完了' : '未完了'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">読み込み中...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">学生プロフィール管理</h2>
                <p className="mt-1 text-sm text-gray-600">学生の詳細プロフィール情報を管理・閲覧</p>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-md ${
                    message.includes('失敗') || message.includes('エラー')
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-green-50 text-green-800 border border-green-200'
                }`}>
                    {message}
                </div>
            )}

            {/* 検索・フィルター・ソート */}
            <div className="mb-6 space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="学生ID、氏名、フリガナ、中学校名で検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        クリア
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">ソート:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="student_id">学生ID</option>
                            <option value="student_last_name">氏名</option>
                            <option value="middle_school_name">中学校名</option>
                            <option value="created_at">作成日時</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>

                    <div className="text-sm text-gray-600">
                        表示: {filteredAndSortedProfiles().length} / {profiles.length}件
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleDownloadCSV}
                            className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                            <DownloadIcon className="h-4 w-4 mr-1" />
                            CSV
                        </button>
                        <button
                            onClick={handleDownloadExcel}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                            <DownloadIcon className="h-4 w-4 mr-1" />
                            Excel
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('student_id')}
                                >
                                    学生ID {sortBy === 'student_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('student_last_name')}
                                >
                                    氏名 {sortBy === 'student_last_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    性別
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('middle_school_name')}
                                >
                                    出身中学校 {sortBy === 'middle_school_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    進捗状況
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('created_at')}
                                >
                                    作成日時 {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedProfiles().map((profile) => (
                                <tr key={profile.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {profile.student_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {profile.student_last_name} {profile.student_first_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {profile.gender}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {profile.middle_school_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-1">
                                            {profile.personal_info_completed && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    個人
                                                </span>
                                            )}
                                            {profile.commute_info_completed && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    通学
                                                </span>
                                            )}
                                            {profile.art_selection_completed && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    芸術
                                                </span>
                                            )}
                                            {profile.health_info_completed && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    健康
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(profile.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedProfile(profile);
                                                    setShowDetailModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="詳細表示"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showDetailModal && selectedProfile && (
                <ProfileDetailModal
                    profile={selectedProfile}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedProfile(null);
                    }}
                />
            )}
        </div>
    );
};

export default AdminStudentProfiles;
