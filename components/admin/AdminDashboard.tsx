
import React, { useState, useEffect } from 'react';
import { Announcement, User, Document, Certificate, StudentResult } from '../../types';
import AdminAnnouncements from './AdminAnnouncements';
import AdminCertificates from './AdminCertificates';
import AdminDocuments from './AdminDocuments';
import AdminProfiles from './AdminProfiles';
import AdminStudentProfiles from './AdminStudentProfiles';
import AdminFormSettings from './AdminFormSettings';
import AdminMobileMenu from './AdminMobileMenu';
import TrashIcon from '../icons/TrashIcon';
import PencilIcon from '../icons/PencilIcon';
import PlusIcon from '../icons/PlusIcon';
import UploadIcon from '../icons/UploadIcon';
import DownloadIcon from '../icons/DownloadIcon';
import Modal from '../shared/Modal';
import * as XLSX from 'xlsx';

type Tab = 'announcements' | 'certificates' | 'documents' | 'profiles' | 'personal-results' | 'student-profiles' | 'form-settings';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('announcements');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof User>('exam_no');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');

    // 個人結果管理用の状態
    const [personalResults, setPersonalResults] = useState<StudentResult[]>([]);
    const [personalResultsLoading, setPersonalResultsLoading] = useState(false);
    const [personalResultsSearchTerm, setPersonalResultsSearchTerm] = useState('');
    const [personalResultsSortField, setPersonalResultsSortField] = useState<keyof StudentResult>('created_at');
    const [personalResultsSortDirection, setPersonalResultsSortDirection] = useState<'asc' | 'desc'>('desc');
    const [personalResultsFilterCourse, setPersonalResultsFilterCourse] = useState<string>('all');
    const [showPersonalResultsUploadModal, setShowPersonalResultsUploadModal] = useState(false);
    const [personalResultsUploadFile, setPersonalResultsUploadFile] = useState<File | null>(null);
    const [personalResultsUploading, setPersonalResultsUploading] = useState(false);
    const [personalResultsUploadMessage, setPersonalResultsUploadMessage] = useState('');
    const [editingResult, setEditingResult] = useState<StudentResult | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchPersonalResults();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUsers(data.users);
                }
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPersonalResults = async () => {
        try {
            setPersonalResultsLoading(true);
            const response = await fetch('/api/results');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setPersonalResults(data.results);
                }
            }
        } catch (error) {
            console.error('Failed to fetch personal results:', error);
        } finally {
            setPersonalResultsLoading(false);
        }
    };

    const handleSort = (field: keyof User) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handlePersonalResultsSort = (field: keyof StudentResult) => {
        if (personalResultsSortField === field) {
            setPersonalResultsSortDirection(personalResultsSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setPersonalResultsSortField(field);
            setPersonalResultsSortDirection('asc');
        }
    };

    const filteredAndSortedUsers = users
        .filter(user => 
            user.exam_no?.includes(searchTerm) ||
            user.name?.includes(searchTerm) ||
            user.phone?.includes(searchTerm)
        )
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
            
            return 0;
        });

    const filteredAndSortedPersonalResults = personalResults
        .filter(result => {
            const matchesSearch = 
                result.exam_no.includes(personalResultsSearchTerm) ||
                result.name?.includes(personalResultsSearchTerm) ||
                result.student_id?.includes(personalResultsSearchTerm);
            
            if (personalResultsFilterCourse === 'all') return matchesSearch;
            if (personalResultsFilterCourse === 'pass') {
                return matchesSearch && result.accepted_course && result.accepted_course.trim() !== '';
            }
            if (personalResultsFilterCourse === 'fail') {
                return matchesSearch && result.application_course && (!result.accepted_course || result.accepted_course.trim() === '');
            }
            if (personalResultsFilterCourse === 'course_change') {
                return matchesSearch && result.application_course && result.accepted_course && 
                       result.application_course !== result.accepted_course;
            }
            return matchesSearch;
        })
        .sort((a, b) => {
            const aValue = a[personalResultsSortField];
            const bValue = b[personalResultsSortField];
            
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return personalResultsSortDirection === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            
            return 0;
        });

    const handleCSVUpload = async () => {
        if (!uploadFile) return;

        setUploading(true);
        setUploadMessage('');

        try {
            const formData = new FormData();
            formData.append('file', uploadFile);

            const response = await fetch('/api/upload-users', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setUploadMessage(`成功: ${data.message}`);
                setUploadFile(null);
                fetchUsers();
            } else {
                setUploadMessage(`エラー: ${data.error}`);
            }
        } catch (error) {
            setUploadMessage('アップロードに失敗しました');
        } finally {
            setUploading(false);
        }
    };

    const handlePersonalResultsUpload = async () => {
        if (!personalResultsUploadFile) return;

        setPersonalResultsUploading(true);
        setPersonalResultsUploadMessage('');

        try {
            const formData = new FormData();
            formData.append('file', personalResultsUploadFile);

            const response = await fetch('/api/upload-results', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setPersonalResultsUploadMessage(`成功: ${data.message}`);
                setPersonalResultsUploadFile(null);
                fetchPersonalResults();
            } else {
                setPersonalResultsUploadMessage(`エラー: ${data.error}`);
            }
        } catch (error) {
            setPersonalResultsUploadMessage('アップロードに失敗しました');
        } finally {
            setPersonalResultsUploading(false);
        }
    };

    const deletePersonalResult = async (examNo: string) => {
        if (!confirm('この個人結果を削除しますか？')) return;
        
        try {
            const response = await fetch(`/api/results/${examNo}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setPersonalResults(personalResults.filter(r => r.exam_no !== examNo));
            }
        } catch (error) {
            console.error('Failed to delete personal result:', error);
        }
    };

    const deleteAllPersonalResults = async () => {
        if (!confirm('全ての個人結果を削除しますか？この操作は取り消せません。')) return;
        
        try {
            const response = await fetch('/api/results', {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setPersonalResults([]);
            }
        } catch (error) {
            console.error('Failed to delete all personal results:', error);
        }
    };

    const openEditModal = (result: StudentResult) => {
        setEditingResult(result);
        setShowEditModal(true);
    };

    const handleEditSave = async (updatedResult: Partial<StudentResult>) => {
        if (!editingResult) return;

        try {
            const response = await fetch(`/api/results/${editingResult.exam_no}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedResult),
            });

            if (response.ok) {
                setShowEditModal(false);
                setEditingResult(null);
                fetchPersonalResults();
            }
        } catch (error) {
            console.error('Failed to update personal result:', error);
        }
    };

    const exportPersonalResultsToCSV = () => {
        const headers = [
            '受験番号',
            '学生ID',
            '氏名',
            '性別',
            '出願時のコース',
            '出願種別',
            '推薦',
            '中学校名',
            '3教科上位10%',
            '特進上位5名',
            '進学上位5名',
            '部活動推薦入学金免除',
            '部活動推薦諸費用免除',
            '部活動推薦奨学金支給',
            '合格コース',
            '特待生',
            '部活動推薦表記',
            '作成日時',
            '更新日時'
        ];

        const csvContent = [
            headers.join(','),
            ...filteredAndSortedPersonalResults.map(result => [
                result.exam_no,
                result.student_id || '',
                result.name || '',
                result.gender || '',
                result.application_course || '',
                result.application_type || '',
                result.recommendation || '',
                result.middle_school || '',
                result.top_10_percent || '',
                result.special_advance_top5 || '',
                result.advance_top5 || '',
                result.club_tuition_exemption || '',
                result.club_fee_exemption || '',
                result.club_scholarship || '',
                result.accepted_course || '',
                result.scholarship_student || '',
                result.club_recommendation || '',
                result.created_at,
                result.updated_at
            ].join(','))
        ].join('\n');

        // BOM（Byte Order Mark）を追加してUTF-8エンコーディングを明示
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;
        
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `個人結果_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPersonalResultsToExcel = () => {
        const headers = [
            '受験番号',
            '学生ID',
            '氏名',
            '性別',
            '出願時のコース',
            '出願種別',
            '推薦',
            '中学校名',
            '3教科上位10%',
            '特進上位5名',
            '進学上位5名',
            '部活動推薦入学金免除',
            '部活動推薦諸費用免除',
            '部活動推薦奨学金支給',
            '合格コース',
            '特待生',
            '部活動推薦表記',
            '作成日時',
            '更新日時'
        ];

        const data = filteredAndSortedPersonalResults.map(result => [
            result.exam_no,
            result.student_id || '',
            result.name || '',
            result.gender || '',
            result.application_course || '',
            result.application_type || '',
            result.recommendation || '',
            result.middle_school || '',
            result.top_10_percent || '',
            result.special_advance_top5 || '',
            result.advance_top5 || '',
            result.club_tuition_exemption || '',
            result.club_fee_exemption || '',
            result.club_scholarship || '',
            result.accepted_course || '',
            result.scholarship_student || '',
            result.club_recommendation || '',
            result.created_at,
            result.updated_at
        ]);

        // xlsxライブラリを使用してExcelファイルを作成
        const XLSX = require('xlsx');
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '個人結果');
        
        // Excelファイルをダウンロード
        XLSX.writeFile(workbook, `個人結果_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getStatusLabel = (result: StudentResult) => {
        if (!result.application_course) return '未発表';
        if (!result.accepted_course || result.accepted_course.trim() === '') {
            return '不合格';
        }
        if (result.application_course !== result.accepted_course) {
            return '廻し合格';
        }
        return '合格';
    };

    const getStatusColor = (result: StudentResult) => {
        if (!result.application_course) return 'bg-gray-100 text-gray-800';
        if (!result.accepted_course || result.accepted_course.trim() === '') {
            return 'bg-red-100 text-red-800';
        }
        if (result.application_course !== result.accepted_course) {
            return 'bg-orange-100 text-orange-800';
        }
        return 'bg-green-100 text-green-800';
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">データを読み込み中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">管理画面</h2>
                <p className="text-gray-600">システム全体を管理します</p>
            </div>

            {/* デスクトップ用タブナビゲーション */}
            <div className="hidden md:block border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'announcements', name: 'お知らせ管理', icon: '📢' },
                        { id: 'certificates', name: '合格証書管理', icon: '🏆' },
                        { id: 'documents', name: '書類管理', icon: '📄' },
                        { id: 'profiles', name: 'ユーザー管理', icon: '👥' },
                        { id: 'personal-results', name: '個人結果管理', icon: '📊' },
                        { id: 'student-profiles', name: '学生プロフィール管理', icon: '📝' },
                        { id: 'form-settings', name: 'フォーム設定管理', icon: '⚙️' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* ハンバーガーメニュー */}
            <AdminMobileMenu
                tabs={[
                    { id: 'announcements', name: 'お知らせ管理', icon: '📢' },
                    { id: 'certificates', name: '合格証書管理', icon: '🏆' },
                    { id: 'documents', name: '書類管理', icon: '📄' },
                    { id: 'profiles', name: 'ユーザー管理', icon: '👥' },
                    { id: 'personal-results', name: '個人結果管理', icon: '📊' },
                    { id: 'student-profiles', name: '学生プロフィール管理', icon: '📝' },
                    { id: 'form-settings', name: 'フォーム設定管理', icon: '⚙️' }
                ]}
                activeTab={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId as Tab)}
            />

            {/* タブコンテンツ */}
            {activeTab === 'announcements' && <AdminAnnouncements />}
            {activeTab === 'certificates' && <AdminCertificates />}
            {activeTab === 'documents' && <AdminDocuments />}
            {activeTab === 'profiles' && <AdminProfiles />}
            {activeTab === 'student-profiles' && <AdminStudentProfiles />}
            {activeTab === 'form-settings' && <AdminFormSettings />}

            {/* 個人結果管理タブ */}
            {activeTab === 'personal-results' && (
                <div className="space-y-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">個人結果管理</h3>
                        <p className="text-gray-600">学生の個人結果を管理します</p>
                    </div>

                    {/* 検索・フィルター・アップロード・エクスポート */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
                                <input
                                    type="text"
                                    value={personalResultsSearchTerm}
                                    onChange={(e) => setPersonalResultsSearchTerm(e.target.value)}
                                    placeholder="受験番号、氏名、学生IDで検索"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">合格状況</label>
                                <select
                                    value={personalResultsFilterCourse}
                                    onChange={(e) => setPersonalResultsFilterCourse(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">すべて</option>
                                    <option value="pass">合格</option>
                                    <option value="fail">不合格</option>
                                    <option value="course_change">廻し合格</option>
                                </select>
                            </div>
                            <div className="flex items-end space-x-2">
                                <button
                                    onClick={() => setShowPersonalResultsUploadModal(true)}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <UploadIcon className="w-4 h-4 mr-2" />
                                    Excelアップロード
                                </button>
                                <button
                                    onClick={exportPersonalResultsToCSV}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <DownloadIcon className="w-4 h-4 mr-2" />
                                    CSV出力
                                </button>
                                <button
                                    onClick={exportPersonalResultsToExcel}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <DownloadIcon className="w-4 h-4 mr-2" />
                                    Excel出力
                                </button>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={deleteAllPersonalResults}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4 mr-2" />
                                    全削除
                                </button>
                            </div>
                        </div>
                    </div>

                    {personalResultsUploadMessage && (
                        <div className={`p-4 rounded-lg border ${
                            personalResultsUploadMessage.includes('エラー') 
                                ? 'bg-red-50 border-red-200 text-red-800' 
                                : 'bg-green-50 border-green-200 text-green-800'
                        }`}>
                            <p className="font-medium">{personalResultsUploadMessage}</p>
                        </div>
                    )}

                    {/* 個人結果一覧 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handlePersonalResultsSort('exam_no')}
                                        >
                                            受験番号
                                            {personalResultsSortField === 'exam_no' && (
                                                <span className="ml-1">{personalResultsSortDirection === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handlePersonalResultsSort('name')}
                                        >
                                            氏名
                                            {personalResultsSortField === 'name' && (
                                                <span className="ml-1">{personalResultsSortDirection === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handlePersonalResultsSort('application_course')}
                                        >
                                            出願時のコース
                                            {personalResultsSortField === 'application_course' && (
                                                <span className="ml-1">{personalResultsSortDirection === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handlePersonalResultsSort('accepted_course')}
                                        >
                                            合格コース
                                            {personalResultsSortField === 'accepted_course' && (
                                                <span className="ml-1">{personalResultsSortDirection === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            状況
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handlePersonalResultsSort('created_at')}
                                        >
                                            作成日時
                                            {personalResultsSortField === 'created_at' && (
                                                <span className="ml-1">{personalResultsSortDirection === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAndSortedPersonalResults.map((result) => (
                                        <tr key={result.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {result.exam_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {result.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {result.application_course || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {result.accepted_course || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result)}`}>
                                                    {getStatusLabel(result)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(result.created_at).toLocaleDateString('ja-JP')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => openEditModal(result)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deletePersonalResult(result.exam_no)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {filteredAndSortedPersonalResults.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">個人結果が見つかりません</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                        総件数: {filteredAndSortedPersonalResults.length}件
                    </div>
                </div>
            )}

            {/* CSVアップロードモーダル */}
            {showUploadModal && (
                <Modal 
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    title="CSVファイルアップロード"
                >
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">CSVファイルアップロード</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CSVファイル</label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="text-sm text-gray-600">
                                <p>CSVファイルの形式:</p>
                                <p>A列: 受験番号（4桁）</p>
                                <p>B列: 電話番号</p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleCSVUpload}
                                    disabled={!uploadFile || uploading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? 'アップロード中...' : 'アップロード'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* 個人結果アップロードモーダル */}
            {showPersonalResultsUploadModal && (
                <Modal 
                    isOpen={showPersonalResultsUploadModal}
                    onClose={() => setShowPersonalResultsUploadModal(false)}
                    title="Excelファイルアップロード（個人結果）"
                >
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Excelファイルアップロード（個人結果）</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Excelファイル</label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => setPersonalResultsUploadFile(e.target.files?.[0] || null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="text-sm text-gray-600">
                                <p>Excelファイルの形式:</p>
                                <p>A列: 学生ID</p>
                                <p>B列: 受験番号</p>
                                <p>C列: 氏名</p>
                                <p>E列: 性別</p>
                                <p>G列: 出願時のコース</p>
                                <p>H列: 出願種別</p>
                                <p>J列: 推薦</p>
                                <p>M列: 中学校名</p>
                                <p>O列: 3教科上位10%</p>
                                <p>P列: 特進上位5名</p>
                                <p>Q列: 進学上位5名</p>
                                <p>R列: 部活動推薦入学金免除</p>
                                <p>S列: 部活動推薦諸費用免除</p>
                                <p>T列: 部活動推薦奨学金支給</p>
                                <p>V列: 合格コース</p>
                                <p>X列: 特待生</p>
                                <p>Z列: 部活動推薦表記</p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowPersonalResultsUploadModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handlePersonalResultsUpload}
                                    disabled={!personalResultsUploadFile || personalResultsUploading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {personalResultsUploading ? 'アップロード中...' : 'アップロード'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* 個人結果編集モーダル */}
            {showEditModal && editingResult && (
                <Modal 
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingResult(null);
                    }}
                    title="個人結果を編集"
                >
                    <PersonalResultEditModal
                        result={editingResult}
                        onSave={handleEditSave}
                        onClose={() => {
                            setShowEditModal(false);
                            setEditingResult(null);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
};

// 個人結果編集モーダルコンポーネント
interface PersonalResultEditModalProps {
    result: StudentResult;
    onSave: (data: Partial<StudentResult>) => void;
    onClose: () => void;
}

const PersonalResultEditModal: React.FC<PersonalResultEditModalProps> = ({ result, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        student_id: result.student_id || '',
        name: result.name || '',
        gender: result.gender || '',
        application_course: result.application_course || '',
        application_type: result.application_type || '',
        recommendation: result.recommendation || '',
        middle_school: result.middle_school || '',
        top_10_percent: result.top_10_percent || '',
        special_advance_top5: result.special_advance_top5 || '',
        advance_5: result.advance_top5 || '',
        club_tuition_exemption: result.club_tuition_exemption || '',
        club_fee_exemption: result.club_fee_exemption || '',
        club_scholarship: result.club_scholarship || '',
        accepted_course: result.accepted_course || '',
        scholarship_student: result.scholarship_student || '',
        club_recommendation: result.club_recommendation || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal 
            isOpen={true}
            onClose={onClose}
            title="個人結果を編集"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">個人結果を編集</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">学生ID</label>
                            <input
                                type="text"
                                value={formData.student_id}
                                onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                            <input
                                type="text"
                                value={formData.gender}
                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">出願時のコース</label>
                            <input
                                type="text"
                                value={formData.application_course}
                                onChange={(e) => setFormData({...formData, application_course: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">出願種別</label>
                            <input
                                type="text"
                                value={formData.application_type}
                                onChange={(e) => setFormData({...formData, application_type: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">推薦</label>
                            <input
                                type="text"
                                value={formData.recommendation}
                                onChange={(e) => setFormData({...formData, recommendation: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">中学校名</label>
                            <input
                                type="text"
                                value={formData.middle_school}
                                onChange={(e) => setFormData({...formData, middle_school: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">3教科上位10%</label>
                            <input
                                type="text"
                                value={formData.top_10_percent}
                                onChange={(e) => setFormData({...formData, top_10_percent: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">特進上位5名</label>
                            <input
                                type="text"
                                value={formData.special_advance_top5}
                                onChange={(e) => setFormData({...formData, special_advance_top5: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">進学上位5名</label>
                            <input
                                type="text"
                                value={formData.advance_5}
                                onChange={(e) => setFormData({...formData, advance_5: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦入学金免除</label>
                            <input
                                type="text"
                                value={formData.club_tuition_exemption}
                                onChange={(e) => setFormData({...formData, club_tuition_exemption: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦諸費用免除</label>
                            <input
                                type="text"
                                value={formData.club_fee_exemption}
                                onChange={(e) => setFormData({...formData, club_fee_exemption: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦奨学金支給</label>
                            <input
                                type="text"
                                value={formData.club_scholarship}
                                onChange={(e) => setFormData({...formData, club_scholarship: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">合格コース</label>
                            <input
                                type="text"
                                value={formData.accepted_course}
                                onChange={(e) => setFormData({...formData, accepted_course: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">特待生</label>
                            <input
                                type="text"
                                value={formData.scholarship_student}
                                onChange={(e) => setFormData({...formData, scholarship_student: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦表記</label>
                            <input
                                type="text"
                                value={formData.club_recommendation}
                                onChange={(e) => setFormData({...formData, club_recommendation: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            更新
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AdminDashboard;
