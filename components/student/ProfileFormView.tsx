
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 実際の運用ではAPIに送信
        console.log('Profile submitted:', profile);
        setIsSubmitted(true);
    };

    const handleChange = (field: keyof Profile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    if (isSubmitted) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">個人情報提出完了</h2>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-green-800">個人情報の提出が完了しました。ありがとうございます。</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">個人情報入力</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">氏名 *</label>
                        <input
                            type="text"
                            id="fullName"
                            value={profile.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="kana" className="block text-sm font-medium text-gray-700">フリガナ *</label>
                        <input
                            type="text"
                            id="kana"
                            value={profile.kana}
                            onChange={(e) => handleChange('kana', e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">郵便番号 *</label>
                    <input
                        type="text"
                        id="postalCode"
                        value={profile.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">住所 *</label>
                    <input
                        type="text"
                        id="address"
                        value={profile.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700">保護者氏名 *</label>
                    <input
                        type="text"
                        id="guardianName"
                        value={profile.guardianName}
                        onChange={(e) => handleChange('guardianName', e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話番号 *</label>
                    <input
                        type="tel"
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス *</label>
                    <input
                        type="email"
                        id="email"
                        value={profile.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        提出する
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileFormView;
