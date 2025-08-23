
import React, { useState, useEffect } from 'react';
import AdminAnnouncements from './AdminAnnouncements';
import AdminDocuments from './AdminDocuments';
import AdminCertificates from './AdminCertificates';
import AdminStudentProfiles from './AdminStudentProfiles';
import AdminFormSettings from './AdminFormSettings';
import MobileMenu from '../shared/MobileMenu';
import TrashIcon from '../icons/TrashIcon';
import { StudentResult } from '../../types';

type Tab = 'announcements' | 'documents' | 'certificates' | 'profiles' | 'students' | 'personal-results' | 'form-settings';

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
    const [userSearchTerm, setUserSearchTerm] = useState<string>('');
    const [userFilterType, setUserFilterType] = useState<string>('all');
    const [userSortBy, setUserSortBy] = useState<string>('exam_no');
    const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('asc');
    
    // 個人結果管理用の状態
    const [personalResults, setPersonalResults] = useState<StudentResult[]>([]);
    const [loadingPersonalResults, setLoadingPersonalResults] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('exam_no');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [excelUploadStatus, setExcelUploadStatus] = useState<string>('');
    const [excelUploadResults, setExcelUploadResults] = useState<any>(null);
    const [isExcelUploading, setIsExcelUploading] = useState(false);
    const [deletePersonalResultStatus, setDeletePersonalResultStatus] = useState<string>('');
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
            id: 'personal-results', 
            name: '個人結果管理', 
            icon: '📊',
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
        }
    }, [activeTab]);

    // タブが個人結果管理に切り替わった時に個人結果一覧を取得
    useEffect(() => {
        if (activeTab === 'personal-results') {
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
                await fetchPersonalResults();
                closeEditModal();
                alert('個人結果を更新しました。学生画面に反映されます。');
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

    // Excelファイルアップロード処理
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

    // 個人結果のフィルタリング・ソート機能
    const filteredAndSortedPersonalResults = () => {
        let filtered = personalResults;

        // 検索フィルター
        if (searchTerm) {
            filtered = filtered.filter(item => 
                (item.student_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.exam_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.middle_school || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.accepted_course || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.application_course || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // フィルター
        switch (filterType) {
            case 'senkan':
                filtered = filtered.filter(item => item.application_type === '専願');
                break;
            case 'heikan':
                filtered = filtered.filter(item => item.application_type === '併願');
                break;
            case 'accepted':
                filtered = filtered.filter(item => 
                    item.accepted_course && 
                    (!item.application_course || item.accepted_course === item.application_course)
                );
                break;
            case 'mawashi':
                filtered = filtered.filter(item => 
                    item.accepted_course && 
                    item.application_course && 
                    item.accepted_course !== item.application_course
                );
                break;
            case 'rejected':
                filtered = filtered.filter(item => 
                    !item.accepted_course && item.application_course
                );
                break;
            case 'no_result':
                filtered = filtered.filter(item => !item.accepted_course && !item.application_course);
                break;
        }

        // ソート
        filtered.sort((a, b) => {
            let aValue = a[sortBy as keyof StudentResult] || '';
            let bValue = b[sortBy as keyof StudentResult] || '';

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

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // フィルタリング・ソート機能
    const filteredAndSortedUsers = () => {
        let filtered = users;

        // 検索フィルター
        if (userSearchTerm) {
            filtered = filtered.filter(user => 
                user.exam_no.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                (user.phone_last4 && user.phone_last4.includes(userSearchTerm))
            );
        }

        // フィルター
        switch (userFilterType) {
            case 'admin':
                filtered = filtered.filter(user => user.role === 'admin');
                break;
            case 'student':
                filtered = filtered.filter(user => user.role === 'student');
                break;
            case 'has_phone':
                filtered = filtered.filter(user => user.phone_last4);
                break;
            case 'no_phone':
                filtered = filtered.filter(user => !user.phone_last4);
                break;
        }

        // ソート
        filtered.sort((a, b) => {
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

        return filtered;
    };

    const handleUserSort = (field: string) => {
        if (userSortBy === field) {
            setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setUserSortBy(field);
            setUserSortOrder('asc');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* モバイル用ヘッダー */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 md:hidden">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-gray-900">管理画面</h1>
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

            {/* コンテンツエリア */}
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                {activeTab === 'students' ? (
                    <div>
                        {/* データベース接続テスト */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">データベース接続テスト</h3>
                            <button
                                onClick={async () => {
                                    setDbStatus('テスト中...');
                                    try {
                                        const response = await fetch('/api/test-db');
                                        const data = await response.json();
                                        setDbStatus(data.success ? '接続成功' : `エラー: ${data.error}`);
                                    } catch (error) {
                                        setDbStatus('接続エラー');
                                    }
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                接続テスト
                            </button>
                            {dbStatus && (
                                <p className="mt-2 text-sm text-gray-600">{dbStatus}</p>
                            )}
                        </div>

                        {/* CSVアップロード */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">CSVアップロード（学生アカウント作成）</h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                setIsUploading(true);
                                setUploadStatus('アップロード中...');
                                
                                try {
                                    const response = await fetch('/api/upload-students', {
                                        method: 'POST',
                                        body: formData,
                                    });
                                    
                                    const data = await response.json();
                                    
                                    if (response.ok) {
                                        setUploadStatus('アップロード成功');
                                        setUploadResults(data);
                                        // ユーザー一覧を再取得
                                        await fetchUsers();
                                    } else {
                                        setUploadStatus(`エラー: ${data.error}`);
                                    }
                                } catch (error) {
                                    setUploadStatus('アップロード中にエラーが発生しました');
                                } finally {
                                    setIsUploading(false);
                                }
                            }}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CSVファイル（A列: 受験番号、B列: 電話番号）
                                    </label>
                                    <input
                                        type="file"
                                        name="file"
                                        accept=".csv"
                                        required
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {isUploading ? 'アップロード中...' : 'アップロード'}
                                </button>
                            </form>
                            
                            {uploadStatus && (
                                <div className={`mt-4 p-4 rounded-lg border ${
                                    uploadStatus.includes('エラー') 
                                        ? 'bg-red-50 border-red-200 text-red-800' 
                                        : 'bg-green-50 border-green-200 text-green-800'
                                }`}>
                                    <p className="font-medium">{uploadStatus}</p>
                                    {uploadResults && (
                                        <div className="mt-2">
                                            <p>処理結果:</p>
                                            <ul className="list-disc list-inside mt-1">
                                                {uploadResults.results?.map((result: string, index: number) => (
                                                    <li key={index} className="text-sm">{result}</li>
                                                ))}
                                            </ul>
                                            {uploadResults.errors?.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="font-medium text-red-700">エラー:</p>
                                                    <ul className="list-disc list-inside mt-1">
                                                        {uploadResults.errors.map((error: string, index: number) => (
                                                            <li key={index} className="text-sm text-red-600">{error}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
    );
};

export default AdminDashboard;
