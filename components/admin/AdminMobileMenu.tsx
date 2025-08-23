import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface AdminMobileMenuProps {
    tabs: Array<{
        id: string;
        name: string;
        icon: string;
    }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const AdminMobileMenu: React.FC<AdminMobileMenuProps> = ({ tabs, activeTab, onTabChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout } = useAuth();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleTabClick = (tabId: string) => {
        onTabChange(tabId);
        setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <div className="md:hidden">
            {/* ハンバーガーメニューボタン */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={toggleMenu}
                    className="bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                    aria-label="メニューを開く"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* オーバーレイ */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* サイドメニュー */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* ヘッダー */}
                    <div className="bg-blue-600 text-white p-6">
                        <h2 className="text-lg font-semibold">管理者メニュー</h2>
                        <p className="text-blue-100 text-sm mt-1">神港学園高等学校</p>
                    </div>

                    {/* メニューアイテム */}
                    <div className="flex-1 overflow-y-auto">
                        <nav className="p-4">
                            <div className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="text-xl mr-3">{tab.icon}</span>
                                        <span className="font-medium">{tab.name}</span>
                                    </button>
                                ))}
                            </div>
                        </nav>
                    </div>

                    {/* フッター */}
                    <div className="border-t border-gray-200 p-4">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            ログアウト
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMobileMenu;
