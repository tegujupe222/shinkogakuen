
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AnnouncementsView from './AnnouncementsView';
import CertificateView from './CertificateView';
import DocumentsView from './DocumentsView';
import ProfileFormView from './ProfileFormView';
import PersonalResultsView from './PersonalResultsView';
import MobileMenu from '../shared/MobileMenu';

type Tab = 'announcements' | 'personal-results' | 'certificate' | 'documents' | 'profile';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('announcements');

    const tabs = [
        { 
            id: 'announcements', 
            name: 'お知らせ', 
            icon: '📢',
            component: AnnouncementsView 
        },
        { 
            id: 'personal-results', 
            name: '個別お知らせ', 
            icon: '📋',
            component: PersonalResultsView 
        },
        { 
            id: 'certificate', 
            name: '合格証書', 
            icon: '🏆',
            component: CertificateView 
        },
        { 
            id: 'documents', 
            name: '書類ダウンロード', 
            icon: '📄',
            component: DocumentsView 
        },
        { 
            id: 'profile', 
            name: 'プロフィール', 
            icon: '👤',
            component: ProfileFormView 
        },
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AnnouncementsView;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* モバイル用ヘッダー */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 md:hidden">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-gray-900">合格者向け情報</h1>
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <ActiveComponent />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
