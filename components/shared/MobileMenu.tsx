'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface MobileMenuProps {
    tabs: Array<{
        id: string;
        name: string;
        icon: string;
    }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ tabs, activeTab, onTabChange }) => {
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
        <div className="sm:hidden">
            {/* ハンバーガーボタン */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={toggleMenu}
                    className="bg-white rounded-lg shadow-lg p-3 border border-gray-200"
                    aria-label="メニューを開く"
                >
                    <div className="w-6 h-6 flex flex-col justify-center items-center">
                        <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                        <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                        <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                    </div>
                </button>
            </div>

            {/* オーバーレイ */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* メニューパネル */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* メニューアイテム */}
                    <nav className="flex-1 p-4">
                        <div className="space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`w-full flex items-center p-4 rounded-lg transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-2xl mr-4">{tab.icon}</span>
                                    <span className="font-medium">{tab.name}</span>
                                    {activeTab === tab.id && (
                                        <svg className="w-5 h-5 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* ログアウトボタン */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center p-4 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200"
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-medium">ログアウト</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
