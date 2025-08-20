
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC<{ title?: string }> = ({ title = '合格者お知らせサイト' }) => {
    const { logout, user } = useAuth();

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    <div className="flex items-center space-x-4">
                       {user && <span className="text-gray-600 text-sm">ようこそ, {user.name}さん</span>}
                       <button
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
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
