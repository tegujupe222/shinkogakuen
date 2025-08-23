
import React, { useState, useEffect } from 'react';
import AdminAnnouncements from './AdminAnnouncements';
import AdminDocuments from './AdminDocuments';
import AdminCertificates from './AdminCertificates';
import AdminStudentProfiles from './AdminStudentProfiles';
import AdminFormSettings from './AdminFormSettings';
import MobileMenu from '../shared/MobileMenu';
import TrashIcon from '../icons/TrashIcon';
import { StudentResult } from '../../types';

type Tab = 'announcements' | 'documents' | 'certificates' | 'profiles' | 'students' | 'form-settings';

interface User {
    id: string;
    exam_no: string;
    email: string;
    name: string;
    role: string;
    phone_last4: string;
    created_at: string;
    updated_at: string;
}

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('announcements');
    const [dbStatus, setDbStatus] = useState<string>('');
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [uploadResults, setUploadResults] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<string>('');
    const [excelUploadStatus, setExcelUploadStatus] = useState<string>('');
    const [excelUploadResults, setExcelUploadResults] = useState<any>(null);
    const [isExcelUploading, setIsExcelUploading] = useState(false);
    const [personalResults, setPersonalResults] = useState<any[]>([]);
    const [loadingPersonalResults, setLoadingPersonalResults] = useState(false);
    const [deletePersonalResultStatus, setDeletePersonalResultStatus] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('exam_no');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [userSearchTerm, setUserSearchTerm] = useState<string>('');
    const [userFilterType, setUserFilterType] = useState<string>('all');
    const [userSortBy, setUserSortBy] = useState<string>('exam_no');
    const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('asc');
    
    // 個人結果編集用の状態
    const [editingResult, setEditingResult] = useState<StudentResult | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    const tabs = [
        { 
            id: 'announcements', 
            name: 'お知らせ管理', 
            icon: '📢',
            component: AdminAnnouncements 
        },
        { 
            id: 'documents', 
            name: '書類管理', 
            icon: '📄',
            component: AdminDocuments 
        },
        { 
            id: 'certificates', 
            name: '合格証書管理', 
            icon: '🏆',
            component: AdminCertificates 
        },
        { 
            id: 'profiles', 
            name: '学生情報管理', 
            icon: '👥',
            component: AdminStudentProfiles 
        },
        { 
            id: 'students', 
            name: '学生アカウント管理', 
            icon: '👨‍🎓',
            component: null 
        },
        { 
            id: 'form-settings', 
            name: 'フォーム設定管理', 
            icon: '⚙️',
            component: AdminFormSettings 
        },
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdminAnnouncements;

    // ユーザー一覧を取得
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            } else {
                console.error('Failed to fetch users:', data.error);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // ユーザー削除
    const deleteUser = async (examNo: string) => {
        if (!confirm(`アカウント ${examNo} を削除しますか？この操作は取り消せません。`)) {
            return;
        }

        setDeleteStatus('削除中...');
        try {
            const response = await fetch(`/api/users/${examNo}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                setDeleteStatus('削除完了');
                // ユーザー一覧を再取得
                await fetchUsers();
                setTimeout(() => setDeleteStatus(''), 3000);
            } else {
                setDeleteStatus(`エラー: ${data.error}`);
                setTimeout(() => setDeleteStatus(''), 5000);
            }
        } catch (error) {
            setDeleteStatus('削除中にエラーが発生しました');
            setTimeout(() => setDeleteStatus(''), 5000);
        }
    };

    // タブが学生アカウント管理に切り替わった時にユーザー一覧を取得
    useEffect(() => {
        if (activeTab === 'students') {
            fetchUsers();
            fetchPersonalResults();
        }
    }, [activeTab]);

    // 個人結果一覧を取得
    const fetchPersonalResults = async () => {
        setLoadingPersonalResults(true);
        try {
            const response = await fetch('/api/results');
            const data = await response.json();
            if (data.success) {
                setPersonalResults(data.results);
            } else {
                console.error('Failed to fetch personal results:', data.error);
            }
        } catch (error) {
            console.error('Error fetching personal results:', error);
        } finally {
            setLoadingPersonalResults(false);
        }
    };

    // 個人結果削除
    const deletePersonalResult = async (examNo: string) => {
        if (!confirm(`個人結果 ${examNo} を削除しますか？この操作は取り消せません。`)) {
            return;
        }

        setDeletePersonalResultStatus('削除中...');
        try {
            const response = await fetch(`/api/results/${examNo}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                setDeletePersonalResultStatus('削除完了');
                // 個人結果一覧を再取得
                await fetchPersonalResults();
                setTimeout(() => setDeletePersonalResultStatus(''), 3000);
            } else {
                setDeletePersonalResultStatus(`エラー: ${data.error}`);
                setTimeout(() => setDeletePersonalResultStatus(''), 5000);
            }
        } catch (error) {
            setDeletePersonalResultStatus('削除中にエラーが発生しました');
            setTimeout(() => setDeletePersonalResultStatus(''), 5000);
        }
    };

    // 全個人結果削除
    const deleteAllPersonalResults = async () => {
        if (!confirm('全ての個人結果を削除しますか？この操作は取り消せません。')) {
            return;
        }

        setDeletePersonalResultStatus('全削除中...');
        try {
            const response = await fetch('/api/results', {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                setDeletePersonalResultStatus('全削除完了');
                // 個人結果一覧を再取得
                await fetchPersonalResults();
                setTimeout(() => setDeletePersonalResultStatus(''), 3000);
            } else {
                setDeletePersonalResultStatus(`エラー: ${data.error}`);
                setTimeout(() => setDeletePersonalResultStatus(''), 5000);
            }
        } catch (error) {
            setDeletePersonalResultStatus('全削除中にエラーが発生しました');
            setTimeout(() => setDeletePersonalResultStatus(''), 5000);
        }
    };

    // フィルター・ソート機能
    const filteredAndSortedData = () => {
        let filteredData = [...personalResults];

        // 検索フィルター
        if (searchTerm) {
            filteredData = filteredData.filter(item => 
                item.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.exam_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.middle_school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.accepted_course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.application_course?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // タイプフィルター
        if (filterType !== 'all') {
            filteredData = filteredData.filter(item => {
                switch (filterType) {
                    case 'senkan':
                        return item.application_type === '専願';
                    case 'heikan':
                        return item.application_type === '併願';
                    case 'accepted':
                        return item.accepted_course && item.accepted_course.trim() !== '' && 
                               (!item.application_course || item.accepted_course === item.application_course);
                    case 'mawashi':
                        return item.accepted_course && item.accepted_course.trim() !== '' && 
                               item.application_course && item.accepted_course !== item.application_course;
                    case 'rejected':
                        return !item.accepted_course && item.application_course && item.application_course.trim() !== '';
                    case 'no_result':
                        return !item.accepted_course && (!item.application_course || item.application_course.trim() === '');
                    default:
                        return true;
                }
            });
        }

        // ソート
        filteredData.sort((a, b) => {
            let aValue = a[sortBy] || '';
            let bValue = b[sortBy] || '';

            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filteredData;
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // 個人結果編集機能
    const openEditModal = (result: StudentResult) => {
        setEditingResult({ ...result });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingResult(null);
        setIsEditModalOpen(false);
    };

    const handleEditSubmit = async () => {
        if (!editingResult) return;

        setEditLoading(true);
        try {
            const response = await fetch(`/api/results/${editingResult.exam_no}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingResult),
            });

            if (response.ok) {
                // 個人結果一覧を再取得
                await fetchPersonalResults();
                closeEditModal();
            } else {
                const data = await response.json();
                alert(`更新に失敗しました: ${data.error}`);
            }
        } catch (error) {
            alert('更新中にエラーが発生しました');
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditChange = (field: keyof StudentResult, value: string) => {
        if (!editingResult) return;
        setEditingResult(prev => ({
            ...prev!,
            [field]: value
        }));
    };

    // 学生アカウント管理のフィルター・ソート機能
    const filteredAndSortedUsers = () => {
        let filteredData = [...users];

        // 検索フィルター
        if (userSearchTerm) {
            filteredData = filteredData.filter(item => 
                item.exam_no?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                item.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                item.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                item.phone_last4?.toLowerCase().includes(userSearchTerm.toLowerCase())
            );
        }

        // タイプフィルター
        if (userFilterType !== 'all') {
            filteredData = filteredData.filter(item => {
                switch (userFilterType) {
                    case 'admin':
                        return item.role === 'admin';
                    case 'student':
                        return item.role === 'student';
                    case 'has_phone':
                        return item.phone_last4 && item.phone_last4.trim() !== '';
                    case 'no_phone':
                        return !item.phone_last4 || item.phone_last4.trim() === '';
                    default:
                        return true;
                }
            });
        }

        // ソート
        filteredData.sort((a, b) => {
            let aValue = a[userSortBy as keyof User] || '';
            let bValue = b[userSortBy as keyof User] || '';

            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            if (userSortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filteredData;
    };

    const handleUserSort = (field: string) => {
        if (userSortBy === field) {
            setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setUserSortBy(field);
            setUserSortOrder('asc');
        }
    };

    // エクセルファイルアップロード処理
    const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsExcelUploading(true);
        setExcelUploadStatus('');
        setExcelUploadResults(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload-results', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setExcelUploadStatus('エクセルアップロード完了');
                setExcelUploadResults(data);
                // アップロード完了後に個人結果一覧を更新
                await fetchPersonalResults();
            } else {
                setExcelUploadStatus(`エラー: ${data.error}`);
            }
        } catch (error) {
            setExcelUploadStatus('エクセルアップロード中にエラーが発生しました');
        } finally {
            setIsExcelUploading(false);
        }
    };

    const testDatabase = async () => {
        setDbStatus('テスト中...');
        try {
            const response = await fetch('/api/db-test');
            const data = await response.json();
            setDbStatus(data.message);
        } catch (error) {
            setDbStatus('エラー: データベース接続に失敗しました');
        }
    };

    const initDatabase = async () => {
        setDbStatus('初期化中...');
        try {
            const response = await fetch('/api/init', { method: 'POST' });
            const data = await response.json();
            setDbStatus(data.message);
        } catch (error) {
            setDbStatus('エラー: データベース初期化に失敗しました');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadStatus('アップロード中...');
        setUploadResults(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload-students', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setUploadStatus('アップロード完了');
                setUploadResults(data);
                // アップロード完了後にユーザー一覧を更新
                await fetchUsers();
            } else {
                setUploadStatus(`エラー: ${data.error}`);
            }
        } catch (error) {
            setUploadStatus('アップロード中にエラーが発生しました');
        } finally {
            setIsUploading(false);
        }
    };

    const StudentAccountManagement = () => (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">学生アカウント管理</h2>
                <p className="mt-1 text-sm text-gray-600">CSVファイルで学生のログイン情報を一括登録・更新</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">CSVファイルアップロード</h3>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-blue-900 mb-2">CSVファイル形式</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p>• A列: 受験番号（4桁の数字）</p>
                            <p>• B列: 電話番号</p>
                            <p>• 1行目はヘッダー行として扱われます</p>
                            <p>• ログインID: 受験番号そのまま</p>
                            <p>• パスワード: 電話番号の下4桁</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                                className="hidden"
                            />
                            {isUploading ? 'アップロード中...' : 'CSVファイルを選択'}
                        </label>
                        
                        {isUploading && (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-sm text-gray-600">処理中...</span>
                            </div>
                        )}
                    </div>
                </div>

                {uploadStatus && (
                    <div className={`p-4 rounded-lg border ${
                        uploadStatus.includes('エラー') 
                            ? 'bg-red-50 border-red-200 text-red-800' 
                            : 'bg-green-50 border-green-200 text-green-800'
                    }`}>
                        <p className="font-medium">{uploadStatus}</p>
                    </div>
                )}

                {uploadResults && (
                    <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-3">処理結果</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">総件数</p>
                                <p className="text-lg font-semibold">{uploadResults.summary.total}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm text-green-600">成功</p>
                                <p className="text-lg font-semibold text-green-700">{uploadResults.summary.success}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                                <p className="text-sm text-red-600">エラー</p>
                                <p className="text-lg font-semibold text-red-700">{uploadResults.summary.errors}</p>
                            </div>
                        </div>

                        {uploadResults.errors.length > 0 && (
                            <div className="mt-4">
                                <h5 className="font-medium text-red-700 mb-2">エラー詳細</h5>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                                    {uploadResults.errors.map((error: string, index: number) => (
                                        <p key={index} className="text-sm text-red-700 mb-1">{error}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {uploadResults.results.length > 0 && (
                            <div className="mt-4">
                                <h5 className="font-medium text-green-700 mb-2">成功した処理</h5>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                                    {uploadResults.results.slice(0, 10).map((result: string, index: number) => (
                                        <p key={index} className="text-sm text-green-700 mb-1">{result}</p>
                                    ))}
                                    {uploadResults.results.length > 10 && (
                                        <p className="text-sm text-green-600">... 他 {uploadResults.results.length - 10}件</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* モバイル用ヘッダー */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 md:hidden">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-gray-900">管理者ダッシュボード</h1>
                    <div className="text-sm text-gray-500">
                        {tabs.find(tab => tab.id === activeTab)?.name}
                    </div>
                </div>
            </div>

            {/* デスクトップ用タブ */}
            <div className="hidden md:block border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* ハンバーガーメニュー */}
            <MobileMenu 
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId as Tab)}
            />

            {/* データベース管理ボタン（デスクトップのみ） */}
            <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">データベース管理</h3>
                    <div className="flex space-x-4">
                        <button
                            onClick={testDatabase}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            DB接続テスト
                        </button>
                        <button
                            onClick={initDatabase}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            DB初期化
                        </button>
                    </div>
                    {dbStatus && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{dbStatus}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* コンテンツエリア */}
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {activeTab === 'students' ? (
                        <div className="p-4 sm:p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">学生アカウント管理</h2>
                                <p className="mt-1 text-sm text-gray-600">CSVファイルで学生のログイン情報を一括登録・更新</p>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">CSVファイルアップロード（学生アカウント）</h3>
                                    
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <h4 className="font-medium text-blue-900 mb-2">CSVファイル形式</h4>
                                        <div className="text-sm text-blue-800 space-y-1">
                                            <p>• A列: 受験番号（4桁の数字）</p>
                                            <p>• B列: 電話番号</p>
                                            <p>• 1行目はヘッダー行として扱われます</p>
                                            <p>• ログインID: 受験番号そのまま</p>
                                            <p>• パスワード: 電話番号の下4桁</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                                className="hidden"
                                            />
                                            {isUploading ? 'アップロード中...' : 'CSVファイルを選択'}
                                        </label>
                                        
                                        {isUploading && (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                <span className="ml-2 text-sm text-gray-600">処理中...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {uploadStatus && (
                                    <div className={`p-4 rounded-lg border ${
                                        uploadStatus.includes('エラー') 
                                            ? 'bg-red-50 border-red-200 text-red-800' 
                                            : 'bg-green-50 border-green-200 text-green-800'
                                    }`}>
                                        <p className="font-medium">{uploadStatus}</p>
                                    </div>
                                )}

                                {uploadResults && (
                                    <div className="mt-6">
                                        <h4 className="font-medium text-gray-900 mb-3">処理結果</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-600">総件数</p>
                                                <p className="text-lg font-semibold">{uploadResults.summary.total}</p>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <p className="text-sm text-green-600">成功</p>
                                                <p className="text-lg font-semibold text-green-700">{uploadResults.summary.success}</p>
                                            </div>
                                            <div className="bg-red-50 p-3 rounded-lg">
                                                <p className="text-sm text-red-600">エラー</p>
                                                <p className="text-lg font-semibold text-red-700">{uploadResults.summary.errors}</p>
                                            </div>
                                        </div>

                                        {uploadResults.errors.length > 0 && (
                                            <div className="mt-4">
                                                <h5 className="font-medium text-red-700 mb-2">エラー詳細</h5>
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                                                    {uploadResults.errors.map((error: string, index: number) => (
                                                        <p key={index} className="text-sm text-red-700 mb-1">{error}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {uploadResults.results.length > 0 && (
                                            <div className="mt-4">
                                                <h5 className="font-medium text-green-700 mb-2">成功した処理</h5>
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                                                    {uploadResults.results.slice(0, 10).map((result: string, index: number) => (
                                                        <p key={index} className="text-sm text-green-700 mb-1">{result}</p>
                                                    ))}
                                                    {uploadResults.results.length > 10 && (
                                                        <p className="text-sm text-green-600">... 他 {uploadResults.results.length - 10}件</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* エクセルファイルアップロード（個人結果） */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">エクセルファイルアップロード（個人結果）</h3>
                                    
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                        <h4 className="font-medium text-green-900 mb-2">エクセルファイル形式</h4>
                                        <div className="text-sm text-green-800 space-y-1">
                                            <p>• A列: 学生ID</p>
                                            <p>• B列: 受験番号</p>
                                            <p>• C列: 氏名</p>
                                            <p>• E列: 性別</p>
                                            <p>• G列: 出願時のコース</p>
                                            <p>• H列: 出願種別（専願/併願）</p>
                                            <p>• J列: 推薦</p>
                                            <p>• M列: 中学校名</p>
                                            <p>• O列: 3教科上位10%</p>
                                            <p>• P列: 特進上位5名</p>
                                            <p>• Q列: 進学上位5名</p>
                                            <p>• R列: 部活動推薦入学金免除</p>
                                            <p>• S列: 部活動推薦諸費用免除</p>
                                            <p>• T列: 部活動推薦奨学金支給</p>
                                            <p>• V列: 合格コース</p>
                                            <p>• X列: 特待生</p>
                                            <p>• Z列: 部活動推薦表記</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls"
                                                onChange={handleExcelUpload}
                                                disabled={isExcelUploading}
                                                className="hidden"
                                            />
                                            {isExcelUploading ? 'アップロード中...' : 'エクセルファイルを選択'}
                                        </label>
                                        
                                        {isExcelUploading && (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                                <span className="ml-2 text-sm text-gray-600">処理中...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {excelUploadStatus && (
                                    <div className={`p-4 rounded-lg border ${
                                        excelUploadStatus.includes('エラー') 
                                            ? 'bg-red-50 border-red-200 text-red-800' 
                                            : 'bg-green-50 border-green-200 text-green-800'
                                    }`}>
                                        <p className="font-medium">{excelUploadStatus}</p>
                                    </div>
                                )}

                                {excelUploadResults && (
                                    <div className="mt-6">
                                        <h4 className="font-medium text-gray-900 mb-3">処理結果</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-600">総件数</p>
                                                <p className="text-lg font-semibold">{excelUploadResults.summary.total}</p>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <p className="text-sm text-green-600">成功</p>
                                                <p className="text-lg font-semibold text-green-700">{excelUploadResults.summary.processed}</p>
                                            </div>
                                            <div className="bg-red-50 p-3 rounded-lg">
                                                <p className="text-sm text-red-600">エラー</p>
                                                <p className="text-lg font-semibold text-red-700">{excelUploadResults.summary.errors}</p>
                                            </div>
                                        </div>

                                        {excelUploadResults.errors.length > 0 && (
                                            <div className="mt-4">
                                                <h5 className="font-medium text-red-700 mb-2">エラー詳細</h5>
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                                                    {excelUploadResults.errors.map((error: string, index: number) => (
                                                        <p key={index} className="text-sm text-red-700 mb-1">{error}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {excelUploadResults.results.length > 0 && (
                                            <div className="mt-4">
                                                <h5 className="font-medium text-green-700 mb-2">成功した処理</h5>
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                                                    {excelUploadResults.results.slice(0, 10).map((result: string, index: number) => (
                                                        <p key={index} className="text-sm text-green-700 mb-1">{result}</p>
                                                    ))}
                                                    {excelUploadResults.results.length > 10 && (
                                                        <p className="text-sm text-green-600">... 他 {excelUploadResults.results.length - 10}件</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 個人結果管理 */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">個人結果管理</h3>
                                    <button
                                        onClick={deleteAllPersonalResults}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        全削除
                                    </button>
                                </div>

                                {/* 検索・フィルター・ソート */}
                                <div className="mb-6 space-y-4">
                                    {/* 検索バー */}
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="学生ID、受験番号、氏名、中学校名、合格結果で検索..."
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

                                    {/* フィルター・ソート */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        {/* フィルター */}
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm font-medium text-gray-700">フィルター:</label>
                                            <select
                                                value={filterType}
                                                onChange={(e) => setFilterType(e.target.value)}
                                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">全て</option>
                                                <option value="senkan">専願のみ</option>
                                                <option value="heikan">併願のみ</option>
                                                <option value="accepted">合格者</option>
                                                <option value="mawashi">廻し合格者</option>
                                                <option value="rejected">不合格者</option>
                                                <option value="no_result">結果未発表</option>
                                            </select>
                                        </div>

                                        {/* ソート */}
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm font-medium text-gray-700">ソート:</label>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="student_id">学生ID</option>
                                                <option value="exam_no">受験番号</option>
                                                <option value="name">氏名</option>
                                                <option value="application_type">出願種別</option>
                                                <option value="application_course">出願時コース</option>
                                                <option value="accepted_course">合格結果</option>
                                                <option value="created_at">作成日時</option>
                                            </select>
                                            <button
                                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                                className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                            >
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </button>
                                        </div>

                                        {/* 結果件数 */}
                                        <div className="text-sm text-gray-600">
                                            表示: {filteredAndSortedData().length} / {personalResults.length}件
                                        </div>
                                    </div>
                                </div>

                                {deletePersonalResultStatus && (
                                    <div className={`mb-6 p-4 rounded-lg border ${
                                        deletePersonalResultStatus.includes('エラー') 
                                            ? 'bg-red-50 border-red-200 text-red-800' 
                                            : 'bg-green-50 border-green-200 text-green-800'
                                    }`}>
                                        <p className="font-medium">{deletePersonalResultStatus}</p>
                                    </div>
                                )}

                                {loadingPersonalResults ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">個人結果一覧を読み込み中...</p>
                                    </div>
                                ) : (
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
                                                        onClick={() => handleSort('exam_no')}
                                                    >
                                                        受験番号 {sortBy === 'exam_no' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                    </th>
                                                    <th 
                                                        scope="col" 
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('name')}
                                                    >
                                                        氏名 {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                    </th>
                                                    <th 
                                                        scope="col" 
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('application_type')}
                                                    >
                                                        出願種別 {sortBy === 'application_type' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                    </th>
                                                    <th 
                                                        scope="col" 
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('application_course')}
                                                    >
                                                        出願時コース {sortBy === 'application_course' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        性別
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        中学校名
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        推薦
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        特待生
                                                    </th>
                                                    <th 
                                                        scope="col" 
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('accepted_course')}
                                                    >
                                                        合格結果 {sortBy === 'accepted_course' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                    </th>
                                                    <th 
                                                        scope="col" 
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('created_at')}
                                                    >
                                                        作成日時 {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        編集
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        削除
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredAndSortedData().map((result, index) => (
                                                    <tr key={result.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                                                            {result.student_id || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-blue-50">
                                                            {result.exam_no}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {result.name || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {result.application_type ? (
                                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${
                                                                    result.application_type === '専願' 
                                                                        ? 'bg-blue-600' 
                                                                        : 'bg-red-600'
                                                                }`}>
                                                                    {result.application_type}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-500">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.application_course || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.gender || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.middle_school || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.recommendation || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.scholarship_student || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {result.accepted_course ? (
                                                                result.application_course && result.accepted_course !== result.application_course ? (
                                                                    <span className="text-orange-600 font-medium">廻し合格: {result.accepted_course}</span>
                                                                ) : (
                                                                    <span className="text-green-600 font-medium">{result.accepted_course}</span>
                                                                )
                                                            ) : result.application_course ? (
                                                                <span className="text-red-600 font-medium">不合格</span>
                                                            ) : (
                                                                <span className="text-gray-500">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(result.created_at).toLocaleDateString('ja-JP')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <button
                                                                onClick={() => openEditModal(result)}
                                                                className="text-blue-600 hover:text-blue-900 mr-2"
                                                                title="編集"
                                                            >
                                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <button
                                                                onClick={() => deletePersonalResult(result.exam_no)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="削除"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* ユーザー一覧管理 */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">ユーザー一覧管理</h3>
                                    <button
                                        onClick={() => setUserSearchTerm('')}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        クリア
                                    </button>
                                </div>

                                {/* 検索・フィルター・ソート */}
                                <div className="mb-6 space-y-4">
                                    {/* 検索バー */}
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="受験番号、名前、ログインID、電話番号で検索..."
                                                value={userSearchTerm}
                                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setUserSearchTerm('')}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                        >
                                            クリア
                                        </button>
                                    </div>

                                    {/* フィルター・ソート */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        {/* フィルター */}
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm font-medium text-gray-700">フィルター:</label>
                                            <select
                                                value={userFilterType}
                                                onChange={(e) => setUserFilterType(e.target.value)}
                                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">全て</option>
                                                <option value="admin">管理者のみ</option>
                                                <option value="student">学生のみ</option>
                                                <option value="has_phone">電話番号あり</option>
                                                <option value="no_phone">電話番号なし</option>
                                            </select>
                                        </div>

                                        {/* ソート */}
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm font-medium text-gray-700">ソート:</label>
                                            <select
                                                value={userSortBy}
                                                onChange={(e) => setUserSortBy(e.target.value)}
                                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="exam_no">受験番号</option>
                                                <option value="name">名前</option>
                                                <option value="email">ログインID</option>
                                                <option value="phone_last4">電話番号</option>
                                                <option value="role">ロール</option>
                                                <option value="created_at">作成日時</option>
                                            </select>
                                            <button
                                                onClick={() => handleUserSort(userSortBy)}
                                                className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                            >
                                                {userSortOrder === 'asc' ? '↑' : '↓'}
                                            </button>
                                        </div>

                                        {/* 結果件数 */}
                                        <div className="text-sm text-gray-600">
                                            表示: {filteredAndSortedUsers().length} / {users.length}件
                                        </div>
                                    </div>
                                </div>

                                {deleteStatus && (
                                    <div className={`mt-6 p-4 rounded-lg border ${
                                        deleteStatus.includes('エラー') 
                                            ? 'bg-red-50 border-red-200 text-red-800' 
                                            : 'bg-green-50 border-green-200 text-green-800'
                                    }`}>
                                        <p className="font-medium">{deleteStatus}</p>
                                    </div>
                                )}

                                {loadingUsers ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">ユーザー一覧を読み込み中...</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        受験番号
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        名前
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ログインID
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        電話番号
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ロール
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        作成日時
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        更新日時
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        削除
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredAndSortedUsers().map((user) => (
                                                    <tr key={user.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {user.exam_no}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {user.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {user.email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {user.phone_last4}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {user.role}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(user.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(user.updated_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <button
                                                                onClick={() => deleteUser(user.exam_no)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="削除"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <ActiveComponent />
                    )}
                </div>
            </div>

            {/* 個人結果編集モーダル */}
            {isEditModalOpen && editingResult && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">個人結果編集</h3>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {/* 基本情報 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">学生ID</label>
                                    <input
                                        type="text"
                                        value={editingResult.student_id || ''}
                                        onChange={(e) => handleEditChange('student_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">受験番号</label>
                                    <input
                                        type="text"
                                        value={editingResult.exam_no || ''}
                                        onChange={(e) => handleEditChange('exam_no', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
                                    <input
                                        type="text"
                                        value={editingResult.name || ''}
                                        onChange={(e) => handleEditChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                                    <select
                                        value={editingResult.gender || ''}
                                        onChange={(e) => handleEditChange('gender', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">選択してください</option>
                                        <option value="男">男</option>
                                        <option value="女">女</option>
                                    </select>
                                </div>
                            </div>

                            {/* 出願情報 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">出願種別</label>
                                    <select
                                        value={editingResult.application_type || ''}
                                        onChange={(e) => handleEditChange('application_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">選択してください</option>
                                        <option value="専願">専願</option>
                                        <option value="併願">併願</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">出願時コース</label>
                                    <input
                                        type="text"
                                        value={editingResult.application_course || ''}
                                        onChange={(e) => handleEditChange('application_course', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">合格コース</label>
                                    <input
                                        type="text"
                                        value={editingResult.accepted_course || ''}
                                        onChange={(e) => handleEditChange('accepted_course', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">中学校名</label>
                                    <input
                                        type="text"
                                        value={editingResult.middle_school || ''}
                                        onChange={(e) => handleEditChange('middle_school', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 推薦・特典情報 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">推薦</label>
                                    <input
                                        type="text"
                                        value={editingResult.recommendation || ''}
                                        onChange={(e) => handleEditChange('recommendation', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">特待生</label>
                                    <input
                                        type="text"
                                        value={editingResult.scholarship_student || ''}
                                        onChange={(e) => handleEditChange('scholarship_student', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">3教科上位10%</label>
                                    <input
                                        type="text"
                                        value={editingResult.top_10_percent || ''}
                                        onChange={(e) => handleEditChange('top_10_percent', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">特進上位5名</label>
                                    <input
                                        type="text"
                                        value={editingResult.special_advance_top5 || ''}
                                        onChange={(e) => handleEditChange('special_advance_top5', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">進学上位5名</label>
                                    <input
                                        type="text"
                                        value={editingResult.advance_top5 || ''}
                                        onChange={(e) => handleEditChange('advance_top5', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦表記</label>
                                    <input
                                        type="text"
                                        value={editingResult.club_recommendation || ''}
                                        onChange={(e) => handleEditChange('club_recommendation', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 部活動推薦免除情報 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦入学金免除</label>
                                    <input
                                        type="text"
                                        value={editingResult.club_tuition_exemption || ''}
                                        onChange={(e) => handleEditChange('club_tuition_exemption', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦諸費用免除</label>
                                    <input
                                        type="text"
                                        value={editingResult.club_fee_exemption || ''}
                                        onChange={(e) => handleEditChange('club_fee_exemption', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦奨学金支給</label>
                                    <input
                                        type="text"
                                        value={editingResult.club_scholarship || ''}
                                        onChange={(e) => handleEditChange('club_scholarship', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={closeEditModal}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                disabled={editLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {editLoading ? '更新中...' : '更新'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default AdminDashboard;
