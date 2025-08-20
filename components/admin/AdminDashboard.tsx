
import React, { useState } from 'react';
import Header from '../shared/Header';
import AdminAnnouncements from './AdminAnnouncements';
import AdminDocuments from './AdminDocuments';
import AdminCertificates from './AdminCertificates';
import AdminProfiles from './AdminProfiles';

type Tab = 'announcements' | 'documents' | 'certificates' | 'profiles';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('announcements');

    const renderContent = () => {
        switch (activeTab) {
            case 'announcements':
                return <AdminAnnouncements />;
            case 'documents':
                return <AdminDocuments />;
            case 'certificates':
                return <AdminCertificates />;
            case 'profiles':
                return <AdminProfiles />;
            default:
                return <AdminAnnouncements />;
        }
    };
    
    const tabClasses = (tabName: Tab) => 
        `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
            activeTab === tabName 
            ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`;

    return (
        <div className="min-h-screen bg-gray-100">
            <Header title="管理者ダッシュボード" />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            <button onClick={() => setActiveTab('announcements')} className={tabClasses('announcements')}>
                                お知らせ管理
                            </button>
                            <button onClick={() => setActiveTab('documents')} className={tabClasses('documents')}>
                                書類管理
                            </button>
                            <button onClick={() => setActiveTab('certificates')} className={tabClasses('certificates')}>
                                合格証書管理
                            </button>
                            <button onClick={() => setActiveTab('profiles')} className={tabClasses('profiles')}>
                                個人情報管理
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

export default AdminDashboard;
