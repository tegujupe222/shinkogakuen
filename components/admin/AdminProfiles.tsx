
import React, { useState, useEffect } from 'react';
import PencilIcon from '../icons/PencilIcon';
import Modal from '../shared/Modal';

interface Profile {
    id: string;
    student_id: string;
    full_name: string;
    kana: string;
    postal_code: string;
    address: string;
    guardian_name: string;
    phone: string;
    email: string;
    created_at: string;
    updated_at: string;
}

const ProfileForm: React.FC<{ 
    profile: Partial<Profile> | null, 
    onSave: (profile: Omit<Profile, 'id' | 'student_id' | 'created_at' | 'updated_at'>) => void, 
    onCancel: () => void 
}> = ({ profile, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        kana: profile?.kana || '',
        postal_code: profile?.postal_code || '',
        address: profile?.address || '',
        guardian_name: profile?.guardian_name || '',
        phone: profile?.phone || '',
        email: profile?.email || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">氏名</label>
                    <input 
                        type="text" 
                        id="full_name" 
                        value={formData.full_name} 
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="kana" className="block text-sm font-medium text-gray-700">フリガナ</label>
                    <input 
                        type="text" 
                        id="kana" 
                        value={formData.kana} 
                        onChange={(e) => setFormData({...formData, kana: e.target.value})} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        required 
                    />
                </div>
            </div>
            <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">郵便番号</label>
                <input 
                    type="text" 
                    id="postal_code" 
                    value={formData.postal_code} 
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    required 
                />
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">住所</label>
                <input 
                    type="text" 
                    id="address" 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    required 
                />
            </div>
            <div>
                <label htmlFor="guardian_name" className="block text-sm font-medium text-gray-700">保護者氏名</label>
                <input 
                    type="text" 
                    id="guardian_name" 
                    value={formData.guardian_name} 
                    onChange={(e) => setFormData({...formData, guardian_name: e.target.value})} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    required 
                />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話番号</label>
                <input 
                    type="tel" 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    required 
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <input 
                    type="email" 
                    id="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    required 
                />
            </div>
            <div className="flex justify-end space-x-3">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    キャンセル
                </button>
                <button 
                    type="submit" 
                    className="bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
                >
                    保存
                </button>
            </div>
        </form>
    );
}

const AdminProfiles: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
    const [message, setMessage] = useState('');

    // プロフィール一覧を取得
    const fetchProfiles = async () => {
        try {
            const response = await fetch('/api/profiles');
            if (response.ok) {
                const data = await response.json();
                setProfiles(data);
            }
        } catch (error) {
            console.error('Failed to fetch profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleOpenModal = (profile?: Profile) => {
        setEditingProfile(profile || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProfile(null);
        setIsModalOpen(false);
        setMessage('');
    };

    const handleSave = async (data: Omit<Profile, 'id' | 'student_id' | 'created_at' | 'updated_at'>) => {
        try {
            const response = await fetch('/api/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    studentId: editingProfile?.student_id || `student${Date.now()}`
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(result.message);
                fetchProfiles(); // 一覧を更新
                handleCloseModal();
            } else {
                setMessage(`エラー: ${result.error}`);
            }
        } catch (error) {
            setMessage('プロフィールの保存に失敗しました');
        }
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">読み込み中...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">学生プロフィール管理</h2>
                <p className="mt-1 text-sm text-gray-600">学生の個人情報を管理します</p>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div></div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    新規作成
                </button>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                    message.includes('エラー') 
                        ? 'bg-red-50 border border-red-200 text-red-800' 
                        : 'bg-green-50 border border-green-200 text-green-800'
                }`}>
                    <p className="text-sm">{message}</p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">プロフィール一覧</h3>
                    
                    {profiles.length > 0 ? (
                        <div className="space-y-4">
                            {profiles.map((profile) => (
                                <div key={profile.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-medium text-blue-600">{profile.full_name}</h4>
                                            <p className="text-sm text-gray-600">受験番号: {profile.student_id}</p>
                                            <p className="text-sm text-gray-600">{profile.email}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                更新日: {new Date(profile.updated_at).toLocaleDateString('ja-JP')}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => handleOpenModal(profile)} 
                                            className="text-gray-400 hover:text-blue-600 p-2"
                                            title="編集"
                                        >
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4">👥</div>
                            <p className="text-gray-500">プロフィールがまだ登録されていません</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title={editingProfile ? 'プロフィールを編集' : 'プロフィールを新規作成'}
            >
                <ProfileForm 
                    profile={editingProfile} 
                    onSave={handleSave} 
                    onCancel={handleCloseModal} 
                />
            </Modal>
        </div>
    );
};

export default AdminProfiles;
