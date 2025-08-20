
import React, { useState } from 'react';
import AnnouncementsView from './AnnouncementsView';
import DocumentsView from './DocumentsView';
import CertificateView from './CertificateView';
import ProfileFormView from './ProfileFormView';

type Tab = 'announcements' | 'documents' | 'certificate' | 'profile';

const StudentDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('announcements');

    const tabs = [
        { 
            id: 'announcements', 
            name: 'お知らせ', 
            icon: '📢',
            component: AnnouncementsView 
        },
        { 
            id: 'documents', 
            name: '必要書類', 
            icon: '📄',
            component: DocumentsView 
        },
        { 
            id: 'certificate', 
            name: '合格証書', 
            icon: '🏆',
            component: CertificateView 
        },
        { 
            id: 'profile', 
            name: '個人情報', 
            icon: '👤',
            component: ProfileFormView 
        },
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AnnouncementsView;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* モバイル用ヘッダー */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 sm:hidden">
                <h1 className="text-lg font-semibold text-gray-900">合格者向け情報</h1>
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

            {/* モバイル用タブ */}
            <div className="sm:hidden bg-white border-b border-gray-200">
                <div className="px-4 py-2">
                    <nav className="flex space-x-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex-1 py-3 px-2 text-center text-xs font-medium rounded-lg transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <div className="text-lg mb-1">{tab.icon}</div>
                                <div>{tab.name}</div>
                            </button>
                        ))}
                    </nav>
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

export default StudentDashboard;
