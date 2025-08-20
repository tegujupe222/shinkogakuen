
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        {/* ロゴ */}
                        <div className="flex items-center mr-4">
                            <Logo size="md" />
                        </div>
                        
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                                神港学園高等学校
                            </h1>
                            <h2 className="text-sm text-gray-600 leading-tight">
                                {title || '合格者お知らせサイト'}
                            </h2>
                        </div>
                        {user && (
                            <span className="ml-6 text-sm text-gray-600">
                                ようこそ、{user.name}さん
                            </span>
                        )}
                    </div>
                    
                    {/* デスクトップ用ログアウトボタン（モバイルでは完全に非表示） */}
                    <div className="hidden md:block">
                        <button
                            onClick={logout}
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium shadow-sm"
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
