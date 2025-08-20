
import React, { useState } from 'react';
import AdminAnnouncements from './AdminAnnouncements';
import AdminDocuments from './AdminDocuments';
import AdminCertificates from './AdminCertificates';
import AdminProfiles from './AdminProfiles';
import MobileMenu from '../shared/MobileMenu';

type Tab = 'announcements' | 'documents' | 'certificates' | 'profiles' | 'students';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('announcements');
    const [dbStatus, setDbStatus] = useState<string>('');
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [uploadResults, setUploadResults] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);

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
                    {activeTab === 'students' ? <StudentAccountManagement /> : <ActiveComponent />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
