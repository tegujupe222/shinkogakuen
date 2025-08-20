
import React, { useState } from 'react';
import AnnouncementsView from './AnnouncementsView';
import DocumentsView from './DocumentsView';
import CertificateView from './CertificateView';
import ProfileFormView from './ProfileFormView';

type Tab = 'announcements' | 'documents' | 'certificate' | 'profile';

const StudentDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('announcements');

    const tabs = [
        { id: 'announcements', name: 'お知らせ', component: AnnouncementsView },
        { id: 'documents', name: '必要書類', component: DocumentsView },
        { id: 'certificate', name: '合格証書', component: CertificateView },
        { id: 'profile', name: '個人情報記入', component: ProfileFormView },
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AnnouncementsView;

    return (
        <div className="space-y-6">
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
    );
};

export default StudentDashboard;
