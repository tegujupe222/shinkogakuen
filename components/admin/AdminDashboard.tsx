
import React, { useState } from 'react';
import AdminAnnouncements from './AdminAnnouncements';
import AdminDocuments from './AdminDocuments';
import AdminCertificates from './AdminCertificates';
import AdminProfiles from './AdminProfiles';
import MobileMenu from '../shared/MobileMenu';

type Tab = 'announcements' | 'documents' | 'certificates' | 'profiles';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('announcements');
    const [dbStatus, setDbStatus] = useState<string>('');

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* モバイル用ヘッダー */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sm:hidden">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-gray-900">管理者ダッシュボード</h1>
                    <div className="text-sm text-gray-500">
                        {tabs.find(tab => tab.id === activeTab)?.name}
                    </div>
                </div>
            </div>

            {/* デスクトップ用タブ */}
            <div className="hidden sm:block border-b border-gray-200 bg-white">
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
            <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                    <ActiveComponent />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
