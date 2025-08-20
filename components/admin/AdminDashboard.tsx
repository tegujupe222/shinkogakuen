
import React, { useState } from 'react';
import Header from '../shared/Header';
import AdminAnnouncements from './AdminAnnouncements';
import AdminDocuments from './AdminDocuments';
import AdminCertificates from './AdminCertificates';
import AdminProfiles from './AdminProfiles';

type Tab = 'announcements' | 'documents' | 'certificates' | 'profiles';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('announcements');
    const [dbStatus, setDbStatus] = useState<'idle' | 'testing' | 'initializing' | 'success' | 'error'>('idle');
    const [dbMessage, setDbMessage] = useState('');

    const tabs = [
        { id: 'announcements', name: 'お知らせ管理', component: AdminAnnouncements },
        { id: 'profiles', name: '学生プロフィール', component: AdminProfiles },
        { id: 'documents', name: '書類管理', component: AdminDocuments },
        { id: 'certificates', name: '合格証書管理', component: AdminCertificates },
    ];

    const testDatabase = async () => {
        setDbStatus('testing');
        setDbMessage('データベース接続をテスト中...');
        
        try {
            const response = await fetch('/api/db-test');
            const data = await response.json();
            
            if (data.success) {
                setDbStatus('success');
                setDbMessage('データベース接続が正常です');
            } else {
                setDbStatus('error');
                setDbMessage(`接続エラー: ${data.error}`);
            }
        } catch (error) {
            setDbStatus('error');
            setDbMessage('接続テストに失敗しました');
        }
    };

    const initializeDatabase = async () => {
        setDbStatus('initializing');
        setDbMessage('データベースを初期化中...');
        
        try {
            const response = await fetch('/api/init', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                setDbStatus('success');
                setDbMessage('データベースが正常に初期化されました');
            } else {
                setDbStatus('error');
                setDbMessage(`初期化エラー: ${data.error}`);
            }
        } catch (error) {
            setDbStatus('error');
            setDbMessage('初期化に失敗しました');
        }
    };

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdminAnnouncements;

    return (
        <div className="min-h-screen bg-gray-100">
            <Header title="管理者ダッシュボード" />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">管理者ダッシュボード</h1>
                        <div className="flex space-x-2">
                            <button
                                onClick={testDatabase}
                                disabled={dbStatus === 'testing' || dbStatus === 'initializing'}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {dbStatus === 'testing' ? 'テスト中...' : 'DB接続テスト'}
                            </button>
                            <button
                                onClick={initializeDatabase}
                                disabled={dbStatus === 'testing' || dbStatus === 'initializing'}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {dbStatus === 'initializing' ? '初期化中...' : 'DB初期化'}
                            </button>
                        </div>
                    </div>

                    {dbMessage && (
                        <div className={`p-4 rounded-md ${
                            dbStatus === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                            dbStatus === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                            'bg-blue-50 border border-blue-200 text-blue-800'
                        }`}>
                            {dbMessage}
                        </div>
                    )}

                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
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

                    <div className="mt-6">
                        <ActiveComponent />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
