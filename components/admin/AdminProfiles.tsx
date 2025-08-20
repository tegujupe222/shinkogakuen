
import React, { useState } from 'react';
import { Profile } from '../../types';
import PencilIcon from '../icons/PencilIcon';
import Modal from '../shared/Modal';

const ProfileForm: React.FC<{ profile: Partial<Profile> | null, onSave: (profile: Omit<Profile, 'studentId' | 'updatedAt'>) => void, onCancel: () => void }> = ({ profile, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        fullName: profile?.fullName || '',
        kana: profile?.kana || '',
        postalCode: profile?.postalCode || '',
        address: profile?.address || '',
        guardianName: profile?.guardianName || '',
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
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">氏名</label>
                    <input type="text" id="fullName" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="kana" className="block text-sm font-medium text-gray-700">フリガナ</label>
                    <input type="text" id="kana" value={formData.kana} onChange={(e) => setFormData({...formData, kana: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                </div>
            </div>
            <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">郵便番号</label>
                <input type="text" id="postalCode" value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">住所</label>
                <input type="text" id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700">保護者氏名</label>
                <input type="text" id="guardianName" value={formData.guardianName} onChange={(e) => setFormData({...formData, guardianName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話番号</label>
                <input type="tel" id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <input type="email" id="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">キャンセル</button>
                <button type="submit" className="bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">保存</button>
            </div>
        </form>
    );
}

const AdminProfiles: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

    const handleOpenModal = (profile?: Profile) => {
        setEditingProfile(profile || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProfile(null);
        setIsModalOpen(false);
    };

    const handleSave = (data: Omit<Profile, 'studentId' | 'updatedAt'>) => {
        if (editingProfile) {
            // Edit
            setProfiles(prev => prev.map(p => p.studentId === editingProfile.studentId ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
        } else {
            // Create
            const newProfile: Profile = {
                studentId: `student${Date.now()}`,
                ...data,
                updatedAt: new Date().toISOString(),
            };
            setProfiles(prev => [newProfile, ...prev]);
        }
        handleCloseModal();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">学生プロフィール管理</h2>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    新規作成
                </button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {profiles.map((profile) => (
                        <li key={profile.studentId}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-medium text-blue-600 truncate">{profile.fullName}</p>
                                    <div className="ml-2 flex-shrink-0 flex items-center space-x-4">
                                        <span className="text-sm text-gray-500">受験番号: {profile.studentId}</span>
                                        <button onClick={() => handleOpenModal(profile)} className="text-gray-400 hover:text-blue-600"><PencilIcon className="w-5 h-5"/></button>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">{profile.email}</p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProfile ? 'プロフィールを編集' : 'プロフィールを新規作成'}>
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
