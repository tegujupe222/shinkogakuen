
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = '合格者お知らせサイト' }) => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                        {user && (
                            <span className="ml-4 text-sm text-gray-600">
                                ようこそ、{user.name}さん
                            </span>
                        )}
                    </div>
                    
                    {/* デスクトップ用ログアウトボタン（モバイルでは非表示） */}
                    <div className="hidden sm:block">
                        <button
                            onClick={logout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
