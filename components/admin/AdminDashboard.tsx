
import React, { useState, useEffect } from 'react';
import { Announcement, User, Document, Certificate, StudentResult } from '../../types';
import AdminAnnouncements from './AdminAnnouncements';
import AdminCertificates from './AdminCertificates';
import AdminDocuments from './AdminDocuments';

import AdminStudentProfiles from './AdminStudentProfiles';
import AdminFormSettings from './AdminFormSettings';
import AdminAdmissionFees from './AdminAdmissionFees';
import AdminMobileMenu from './AdminMobileMenu';
import TrashIcon from '../icons/TrashIcon';
import PencilIcon from '../icons/PencilIcon';
import PlusIcon from '../icons/PlusIcon';
import UploadIcon from '../icons/UploadIcon';
import DownloadIcon from '../icons/DownloadIcon';
import Modal from '../shared/Modal';
import * as XLSX from 'xlsx';

type Tab = 'announcements' | 'certificates' | 'documents' | 'personal-results' | 'student-profiles' | 'form-settings' | 'admission-fees' | 'login-settings';

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

    const [personalResultsFilterDateRange, setPersonalResultsFilterDateRange] = useState<{
        start: string;
        end: string;
    }>({ start: '', end: '' });
    const [showPersonalResultsUploadModal, setShowPersonalResultsUploadModal] = useState(false);
    const [personalResultsUploadFile, setPersonalResultsUploadFile] = useState<File | null>(null);
    const [personalResultsUploading, setPersonalResultsUploading] = useState(false);
    const [personalResultsUploadMessage, setPersonalResultsUploadMessage] = useState('');
    const [editingResult, setEditingResult] = useState<StudentResult | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // ログイン設定用の状態
    const [showLoginSettingsUploadModal, setShowLoginSettingsUploadModal] = useState(false);
    const [loginSettingsUploadFile, setLoginSettingsUploadFile] = useState<File | null>(null);
    const [loginSettingsUploading, setLoginSettingsUploading] = useState(false);
    const [loginSettingsUploadMessage, setLoginSettingsUploadMessage] = useState('');
    
    // 手動ユーザー追加用の状態
    const [showManualUserModal, setShowManualUserModal] = useState(false);
    const [manualUserData, setManualUserData] = useState({
        examNo: '',
        password: '',
        role: 'student'
    });
    const [manualUserMessage, setManualUserMessage] = useState('');
    const [manualUserLoading, setManualUserLoading] = useState(false);

    // ユーザー削除用の状態
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteUserLoading, setDeleteUserLoading] = useState(false);
    const [deleteUserMessage, setDeleteUserMessage] = useState('');

    // 学生全削除用の状態
    const [showDeleteAllStudentsModal, setShowDeleteAllStudentsModal] = useState(false);
    const [deleteAllStudentsLoading, setDeleteAllStudentsLoading] = useState(false);
    const [deleteAllStudentsMessage, setDeleteAllStudentsMessage] = useState('');

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
            // 検索フィルター
            const matchesSearch = 
                result.exam_no.includes(personalResultsSearchTerm) ||
                result.name?.includes(personalResultsSearchTerm) ||
                result.student_id?.includes(personalResultsSearchTerm);
            
            if (!matchesSearch) return false;
            
            // 合格状況フィルター
            if (personalResultsFilterCourse !== 'all') {
                if (personalResultsFilterCourse === 'pass') {
                    if (!(result.accepted_course && result.accepted_course.trim() !== '')) return false;
                } else if (personalResultsFilterCourse === 'fail') {
                    if (!(result.application_course && (!result.accepted_course || result.accepted_course.trim() === ''))) return false;
                } else if (personalResultsFilterCourse === 'course_change') {
                    if (!(result.application_course && result.accepted_course && result.application_course !== result.accepted_course)) return false;
                }
            }
            

            
            // 日付範囲フィルター
            if (personalResultsFilterDateRange.start || personalResultsFilterDateRange.end) {
                const resultDate = new Date(result.created_at);
                if (personalResultsFilterDateRange.start) {
                    const startDate = new Date(personalResultsFilterDateRange.start);
                    if (resultDate < startDate) return false;
                }
                if (personalResultsFilterDateRange.end) {
                    const endDate = new Date(personalResultsFilterDateRange.end);
                    endDate.setHours(23, 59, 59, 999); // 終了日の23:59:59まで
                    if (resultDate > endDate) return false;
                }
            }
            
            return true;
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

    // ログイン設定用のCSVアップロード処理
    const handleLoginSettingsUpload = async () => {
        if (!loginSettingsUploadFile) return;

        setLoginSettingsUploading(true);
        setLoginSettingsUploadMessage('');

        try {
            const formData = new FormData();
            formData.append('file', loginSettingsUploadFile);

            const response = await fetch('/api/upload-login-settings', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setLoginSettingsUploadMessage(`ログイン設定を更新しました。更新件数: ${data.updatedCount}件`);
                setLoginSettingsUploadFile(null);
                setShowLoginSettingsUploadModal(false);
            } else {
                setLoginSettingsUploadMessage(`エラー: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to upload login settings:', error);
            setLoginSettingsUploadMessage('アップロード中にエラーが発生しました');
        } finally {
            setLoginSettingsUploading(false);
        }
    };

    // 手動ユーザー追加処理
    const handleManualUserAdd = async () => {
        if (!manualUserData.examNo || !manualUserData.password) {
            setManualUserMessage('受験番号とパスワードを入力してください');
            return;
        }

        if (!/^\d{4}$/.test(manualUserData.examNo)) {
            setManualUserMessage('受験番号は4桁の数字で入力してください');
            return;
        }

        if (!/^\d{4}$/.test(manualUserData.password)) {
            setManualUserMessage('パスワードは4桁の数字で入力してください');
            return;
        }

        setManualUserLoading(true);
        setManualUserMessage('');

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exam_no: manualUserData.examNo,
                    password: manualUserData.password,
                    role: manualUserData.role
                })
            });

            const data = await response.json();

            if (data.success) {
                setManualUserMessage('ユーザーを追加しました');
                setManualUserData({
                    examNo: '',
                    password: '',
                    role: 'student'
                });
                setShowManualUserModal(false);
                fetchUsers(); // ユーザーリストを更新
            } else {
                setManualUserMessage(`エラー: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to add manual user:', error);
            setManualUserMessage('ユーザー追加中にエラーが発生しました');
        } finally {
            setManualUserLoading(false);
        }
    };

    // ユーザー削除処理
    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        setDeleteUserLoading(true);
        setDeleteUserMessage('');

        try {
            const response = await fetch(`/api/users/${userToDelete.exam_no}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setDeleteUserMessage('ユーザーを削除しました');
                setUserToDelete(null);
                setShowDeleteUserModal(false);
                fetchUsers(); // ユーザーリストを更新
            } else {
                setDeleteUserMessage(`エラー: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            setDeleteUserMessage('ユーザー削除中にエラーが発生しました');
        } finally {
            setDeleteUserLoading(false);
        }
    };

    // 学生全削除処理
    const handleDeleteAllStudents = async () => {
        setDeleteAllStudentsLoading(true);
        setDeleteAllStudentsMessage('');

        try {
            const response = await fetch('/api/users/delete-all-students', {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setDeleteAllStudentsMessage(`学生アカウントを${data.deletedCount}件削除しました`);
                setShowDeleteAllStudentsModal(false);
                fetchUsers(); // ユーザーリストを更新
            } else {
                setDeleteAllStudentsMessage(`エラー: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to delete all students:', error);
            setDeleteAllStudentsMessage('学生全削除中にエラーが発生しました');
        } finally {
            setDeleteAllStudentsLoading(false);
        }
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
                        { id: 'personal-results', name: '個人結果管理', icon: '📊' },
                        { id: 'student-profiles', name: '学生プロフィール管理', icon: '📝' },
                        { id: 'form-settings', name: 'フォーム設定管理', icon: '⚙️' },
                        { id: 'admission-fees', name: '入学手続金管理', icon: '💰' },
                        { id: 'login-settings', name: 'ログイン設定', icon: '🔐' }
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
                    { id: 'personal-results', name: '個人結果管理', icon: '📊' },
                    { id: 'student-profiles', name: '学生プロフィール管理', icon: '📝' },
                    { id: 'form-settings', name: 'フォーム設定管理', icon: '⚙️' },
                    { id: 'admission-fees', name: '入学手続金管理', icon: '💰' },
                    { id: 'login-settings', name: 'ログイン設定', icon: '🔐' }
                ]}
                activeTab={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId as Tab)}
            />

            {/* タブコンテンツ */}
            {activeTab === 'announcements' && <AdminAnnouncements />}
            {activeTab === 'certificates' && <AdminCertificates />}
            {activeTab === 'documents' && <AdminDocuments />}
            {activeTab === 'student-profiles' && <AdminStudentProfiles />}
            {activeTab === 'form-settings' && <AdminFormSettings />}
            {activeTab === 'admission-fees' && <AdminAdmissionFees />}

            {/* ログイン設定タブ */}
            {activeTab === 'login-settings' && (
                <div className="space-y-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">ログイン設定</h3>
                        <p className="text-gray-600">学生のログインIDとパスワードを設定します</p>
                    </div>

                    {/* CSVアップロード */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">CSVアップロード</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">
                                    CSVファイルの形式：<br />
                                    A列：受験番号（4桁の数字）<br />
                                    B列：電話番号（パスワードは電話番号の下4桁）
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setLoginSettingsUploadFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <button
                                    onClick={handleLoginSettingsUpload}
                                    disabled={!loginSettingsUploadFile || loginSettingsUploading}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <UploadIcon className="w-4 h-4 mr-2" />
                                    {loginSettingsUploading ? 'アップロード中...' : 'アップロード'}
                                </button>
                            </div>
                            {loginSettingsUploadMessage && (
                                <div className={`p-4 rounded-lg border ${
                                    loginSettingsUploadMessage.includes('エラー')
                                        ? 'bg-red-50 border-red-200 text-red-800'
                                        : 'bg-green-50 border-green-200 text-green-800'
                                }`}>
                                    <p className="font-medium">{loginSettingsUploadMessage}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 手動ユーザー追加 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">手動ユーザー追加</h4>
                            <button
                                onClick={() => setShowManualUserModal(true)}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                ユーザー追加
                            </button>
                        </div>
                        <p className="text-sm text-gray-600">
                            受験番号（4桁）とパスワード（4桁）を手動で入力してユーザーを追加できます。
                        </p>
                    </div>

                    {/* ユーザー一覧 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">ユーザー一覧</h4>
                            <button
                                onClick={() => setShowDeleteAllStudentsModal(true)}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                学生全削除
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            受験番号
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            名前
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ロール
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            作成日
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.exam_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    user.role === 'admin' 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {user.role === 'admin' ? '管理者' : '学生'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString('ja-JP') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => {
                                                        setUserToDelete(user);
                                                        setShowDeleteUserModal(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                    disabled={user.role === 'admin'}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 個人結果管理タブ */}
            {activeTab === 'personal-results' && (
                <div className="space-y-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">個人結果管理</h3>
                        <p className="text-gray-600">学生の個人結果を管理します</p>
                    </div>

                    {/* 検索・フィルター */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">登録日（開始）</label>
                                <input
                                    type="date"
                                    value={personalResultsFilterDateRange.start}
                                    onChange={(e) => setPersonalResultsFilterDateRange(prev => ({
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
                                    value={personalResultsFilterDateRange.end}
                                    onChange={(e) => setPersonalResultsFilterDateRange(prev => ({
                                        ...prev,
                                        end: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setPersonalResultsSearchTerm('');
                                        setPersonalResultsFilterCourse('all');

                                        setPersonalResultsFilterDateRange({ start: '', end: '' });
                                    }}
                                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    フィルターリセット
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-wrap gap-4">
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
                            <button
                                onClick={deleteAllPersonalResults}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                全削除
                            </button>
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

            {/* 手動ユーザー追加モーダル */}
            <ManualUserModal
                isOpen={showManualUserModal}
                onClose={() => setShowManualUserModal(false)}
                onSubmit={handleManualUserAdd}
                data={manualUserData}
                setData={setManualUserData}
                loading={manualUserLoading}
                message={manualUserMessage}
            />

            {/* ユーザー削除モーダル */}
            <DeleteUserModal
                isOpen={showDeleteUserModal}
                onClose={() => setShowDeleteUserModal(false)}
                onConfirm={handleDeleteUser}
                user={userToDelete}
                loading={deleteUserLoading}
                message={deleteUserMessage}
            />

            {/* 学生全削除モーダル */}
            <DeleteAllStudentsModal
                isOpen={showDeleteAllStudentsModal}
                onClose={() => setShowDeleteAllStudentsModal(false)}
                onConfirm={handleDeleteAllStudents}
                loading={deleteAllStudentsLoading}
                message={deleteAllStudentsMessage}
                studentCount={users.filter(user => user.role === 'student').length}
            />
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

// 手動ユーザー追加モーダル
const ManualUserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    data: {
        examNo: string;
        password: string;
        role: string;
    };
    setData: (data: any) => void;
    loading: boolean;
    message: string;
}> = ({ isOpen, onClose, onSubmit, data, setData, loading, message }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ユーザー追加">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ユーザー追加</h3>
                
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                受験番号 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.examNo}
                                onChange={(e) => setData({...data, examNo: e.target.value})}
                                placeholder="4桁の数字"
                                maxLength={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                パスワード <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.password}
                                onChange={(e) => setData({...data, password: e.target.value})}
                                placeholder="4桁の数字"
                                maxLength={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ロール <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) => setData({...data, role: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="student">学生</option>
                                <option value="admin">管理者</option>
                            </select>
                        </div>
                    </div>

                    {message && (
                        <div className={`mt-4 p-3 rounded-lg border ${
                            message.includes('エラー')
                                ? 'bg-red-50 border-red-200 text-red-800'
                                : 'bg-green-50 border-green-200 text-green-800'
                        }`}>
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            disabled={loading}
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? '追加中...' : '追加'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

// ユーザー削除モーダル
const DeleteUserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    user: User | null;
    loading: boolean;
    message: string;
}> = ({ isOpen, onClose, onConfirm, user, loading, message }) => {
    if (!isOpen || !user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ユーザー削除">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ユーザー削除の確認</h3>
                
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        以下のユーザーを削除しますか？この操作は取り消せません。
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-700">受験番号:</span>
                                <span className="text-sm text-gray-900">{user.exam_no}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-700">名前:</span>
                                <span className="text-sm text-gray-900">{user.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-700">ロール:</span>
                                <span className="text-sm text-gray-900">
                                    {user.role === 'admin' ? '管理者' : '学生'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg border ${
                            message.includes('エラー')
                                ? 'bg-red-50 border-red-200 text-red-800'
                                : 'bg-green-50 border-green-200 text-green-800'
                        }`}>
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        disabled={loading}
                    >
                        キャンセル
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? '削除中...' : '削除'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// 学生全削除モーダル
const DeleteAllStudentsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
    message: string;
    studentCount: number;
}> = ({ isOpen, onClose, onConfirm, loading, message, studentCount }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="学生全削除">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">学生全削除の確認</h3>
                
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    注意: この操作は取り消せません
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>以下の操作を実行します：</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>学生アカウント {studentCount}件 を削除</li>
                                        <li>関連するプロフィールデータを削除</li>
                                        <li>関連する合格証書データを削除</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600">
                        本当に全ての学生アカウントを削除しますか？この操作は取り消せません。
                    </p>

                    {message && (
                        <div className={`p-3 rounded-lg border ${
                            message.includes('エラー')
                                ? 'bg-red-50 border-red-200 text-red-800'
                                : 'bg-green-50 border-green-200 text-green-800'
                        }`}>
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        disabled={loading}
                    >
                        キャンセル
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? '削除中...' : '全削除'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AdminDashboard;
