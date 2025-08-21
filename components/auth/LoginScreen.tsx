
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../shared/Logo';

const LoginScreen: React.FC = () => {
    const [examNo, setExamNo] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const success = await login(examNo, password, 'student');

            if (!success) {
                setError('ログインに失敗しました。IDとパスワードを確認してください。');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('ログイン中にエラーが発生しました。');
        } finally {
            setLoading(false);
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
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="examNo" className="block text-sm font-medium text-gray-700 mb-1">
                                ID（4桁の数字）
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
                                例: 1234（学生）, 9999（管理者）
                            </p>
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                パスワード（4桁の数字）
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                maxLength={4}
                                pattern="[0-9]{4}"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="5678"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                例: 電話番号下4桁（学生）, 5896（管理者）
                            </p>
                        </div>

                        {/* エラーメッセージ */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform shadow-lg ${
                                loading
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02]'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ログイン中...
                                </div>
                            ) : (
                                'ログイン'
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            テスト用アカウント:
                        </p>
                        <div className="text-xs text-gray-500 text-center mt-1 space-y-1">
                            <p>管理者: 9999 / 5896</p>
                            <p>学生: 受験番号 / 電話番号下4桁</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
