
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../shared/Logo';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200">
                    <div className="text-center mb-8">
                        {/* ロゴ */}
                        <div className="flex justify-center mb-6">
                            <Logo size="lg" />
                        </div>
                        
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            神港学園高等学校
                        </h1>
                        <h2 className="text-lg text-gray-700">
                            合格者お知らせサイト
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            ログインしてください
                        </p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                メールアドレス
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="example@email.com"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                パスワード
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="パスワードを入力"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                        >
                            ログイン
                        </button>
                    </form>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            テスト用アカウント:
                        </p>
                        <div className="text-xs text-gray-500 text-center mt-1 space-y-1">
                            <p>管理者: admin@example.com / admin123</p>
                            <p>学生: student@example.com / student123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
