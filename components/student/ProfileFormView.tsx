
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Profile } from '../../types';

const ProfileFormView: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile>({
        studentId: user?.id || '',
        fullName: '',
        kana: '',
        postalCode: '',
        address: '',
        guardianName: '',
        phone: '',
        email: user?.email || '',
        updatedAt: new Date().toISOString()
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile),
            });

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                const error = await response.json();
                alert(`エラー: ${error.error}`);
            }
        } catch (error) {
            console.error('Failed to submit profile:', error);
            alert('プロフィールの送信に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof Profile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    if (isSubmitted) {
        return (
            <div className="p-4 sm:p-6">
                <div className="text-center py-8">
                    <div className="text-green-500 text-6xl mb-4">✅</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">提出完了</h2>
                    <p className="text-gray-600 mb-6">個人情報の提出が完了しました。ありがとうございます。</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 text-sm">
                            提出された情報は管理者が確認いたします。
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">個人情報入力</h2>
                <p className="mt-1 text-sm text-gray-600">入学手続きに必要な情報を入力してください</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本情報 */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                氏名 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                value={profile.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="山田 太郎"
                            />
                        </div>
                        <div>
                            <label htmlFor="kana" className="block text-sm font-medium text-gray-700 mb-1">
                                フリガナ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="kana"
                                value={profile.kana}
                                onChange={(e) => handleChange('kana', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ヤマダ タロウ"
                            />
                        </div>
                    </div>
                </div>

                {/* 住所情報 */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">住所情報</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                郵便番号 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="postalCode"
                                value={profile.postalCode}
                                onChange={(e) => handleChange('postalCode', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="123-4567"
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                住所 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="address"
                                value={profile.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="東京都渋谷区..."
                            />
                        </div>
                    </div>
                </div>

                {/* 連絡先情報 */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">連絡先情報</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 mb-1">
                                保護者氏名 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="guardianName"
                                value={profile.guardianName}
                                onChange={(e) => handleChange('guardianName', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="山田 花子"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                電話番号 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                value={profile.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="090-1234-5678"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                メールアドレス <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={profile.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="example@email.com"
                            />
                        </div>
                    </div>
                </div>

                {/* 送信ボタン */}
                <div className="flex justify-center pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                送信中...
                            </div>
                        ) : (
                            '提出する'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileFormView;
