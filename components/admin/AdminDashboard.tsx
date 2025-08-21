
import React, { useState, useEffect } from 'react';
import AdminAnnouncements from './AdminAnnouncements';
import AdminDocuments from './AdminDocuments';
import AdminCertificates from './AdminCertificates';
import AdminProfiles from './AdminProfiles';
import MobileMenu from '../shared/MobileMenu';
import TrashIcon from '../icons/TrashIcon';

type Tab = 'announcements' | 'documents' | 'certificates' | 'profiles' | 'students';

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
            component: AdminProfiles 
        },
        { 
            id: 'students', 
            name: '学生アカウント管理', 
            icon: '👨‍🎓',
            component: null 
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
                                            <p>• B列: 受験番号（4桁の数字）</p>
                                            <p>• C列: 氏名</p>
                                            <p>• H列: 出願（専願/併願）</p>
                                            <p>• E列: 性別</p>
                                            <p>• M列: 中学校名</p>
                                            <p>• J列: 推薦の表示</p>
                                            <p>• Z列: 部活動推薦表記</p>
                                            <p>• V列: 合格コース</p>
                                            <p>• O列: 3教科上位10%</p>
                                            <p>• P列: 特進上位5名</p>
                                            <p>• Q列: 進学上位5名</p>
                                            <p>• R列: 部活動推薦入学金免除（1=適用）</p>
                                            <p>• S列: 部活動推薦諸費用免除（1=適用）</p>
                                            <p>• T列: 部活動推薦奨学金支給（1=適用）</p>
                                            <p>• X列: 特待生の表示</p>
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
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        受験番号
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        氏名
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        出願種別
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        性別
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        中学校名
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        合格コース
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        作成日時
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        削除
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {personalResults.map((result) => (
                                                    <tr key={result.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {result.exam_no}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {result.application_type && (
                                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${
                                                                    result.application_type === '専願' 
                                                                        ? 'bg-blue-600' 
                                                                        : 'bg-red-600'
                                                                }`}>
                                                                    {result.application_type}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.gender}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.middle_school}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {result.accepted_course}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(result.created_at).toLocaleDateString()}
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
                                            {users.map((user) => (
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
                    ) : (
                        <ActiveComponent />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
