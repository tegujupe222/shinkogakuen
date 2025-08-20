
import React, { useState } from 'react';
import Header from '../shared/Header';
import AnnouncementsView from './AnnouncementsView';
import DocumentsView from './DocumentsView';
import CertificateView from './CertificateView';
import ProfileFormView from './ProfileFormView';

type Tab = 'announcements' | 'documents' | 'certificate' | 'profile';

const StudentDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('announcements');

    const renderContent = () => {
        switch (activeTab) {
            case 'announcements':
                return <AnnouncementsView />;
            case 'documents':
                return <DocumentsView />;
            case 'certificate':
                return <CertificateView />;
            case 'profile':
                return <ProfileFormView />;
            default:
                return <AnnouncementsView />;
        }
    };

    const tabClasses = (tabName: Tab) => 
        `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
            activeTab === tabName 
            ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`;

    return (
        <div className="min-h-screen bg-gray-100">
            <Header title="合格者向け情報" />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            <button onClick={() => setActiveTab('announcements')} className={tabClasses('announcements')}>
                                お知らせ
                            </button>
                            <button onClick={() => setActiveTab('documents')} className={tabClasses('documents')}>
                                必要書類
                            </button>
                            <button onClick={() => setActiveTab('certificate')} className={tabClasses('certificate')}>
                                合格証書
                            </button>
                            <button onClick={() => setActiveTab('profile')} className={tabClasses('profile')}>
                                個人情報記入
                            </button>
                        </nav>
                    </div>
                    <div className="mt-6">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
