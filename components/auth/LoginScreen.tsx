
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../shared/Logo';

const LoginScreen: React.FC = () => {
    const [loginType, setLoginType] = useState<'admin' | 'student'>('student');
    const [examNo, setExamNo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loginType === 'student') {
            await login(examNo, password, 'student');
        } else {
            await login(email, password, 'admin');
        }
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
                    
                    {/* ログインタイプ切り替え */}
                    <div className="mb-6">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => setLoginType('student')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    loginType === 'student'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                学生ログイン
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginType('admin')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    loginType === 'admin'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                管理者ログイン
                            </button>
                        </div>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        {loginType === 'student' ? (
                            <div>
                                <label htmlFor="examNo" className="block text-sm font-medium text-gray-700 mb-1">
                                    受験番号（4桁）
                                </label>
                                <input
                                    type="text"
                                    id="examNo"
                                    value={examNo}
                                    onChange={(e) => setExamNo(e.target.value)}
                                    required
                                    maxLength={4}
                                    pattern="[0-9]{4}"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="1234"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    例: 1234
                                </p>
                            </div>
                        ) : (
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
                                    placeholder="admin@example.com"
                                />
                            </div>
                        )}
                        
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
                                placeholder={loginType === 'student' ? '電話番号下4桁' : 'パスワードを入力'}
                            />
                            {loginType === 'student' && (
                                <p className="mt-1 text-xs text-gray-500">
                                    電話番号の下4桁を入力してください
                                </p>
                            )}
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
                            <p>学生: 受験番号 / 電話番号下4桁</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
