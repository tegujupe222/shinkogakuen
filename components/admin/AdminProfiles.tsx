
import React, { useState } from 'react';
import { StudentProfile } from '../../types';
import PencilIcon from '../icons/PencilIcon';
import Modal from '../shared/Modal';

const ProfileForm: React.FC<{ profile: Partial<StudentProfile> | null, onSave: (profile: Omit<StudentProfile, 'student_id' | 'updated_at'>) => void, onCancel: () => void }> = ({ profile, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        student_last_name: profile?.student_last_name || '',
        student_first_name: profile?.student_first_name || '',
        student_last_name_kana: profile?.student_last_name_kana || '',
        student_first_name_kana: profile?.student_first_name_kana || '',
        student_postal_code: profile?.student_postal_code || '',
        student_address: profile?.student_address || '',
        student_address_detail: profile?.student_address_detail || '',
        student_phone: profile?.student_phone || '',
        guardian1_last_name: profile?.guardian1_last_name || '',
        guardian1_first_name: profile?.guardian1_first_name || '',
        guardian1_email: profile?.guardian1_email || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: profile?.id || '',
            created_at: profile?.created_at || new Date().toISOString()
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="student_last_name" className="block text-sm font-medium text-gray-700">生徒氏名(姓)</label>
                    <input type="text" id="student_last_name" value={formData.student_last_name} onChange={(e) => setFormData({...formData, student_last_name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="student_first_name" className="block text-sm font-medium text-gray-700">生徒氏名(名)</label>
                    <input type="text" id="student_first_name" value={formData.student_first_name} onChange={(e) => setFormData({...formData, student_first_name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="student_last_name_kana" className="block text-sm font-medium text-gray-700">生徒フリガナ(姓)</label>
                    <input type="text" id="student_last_name_kana" value={formData.student_last_name_kana} onChange={(e) => setFormData({...formData, student_last_name_kana: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="student_first_name_kana" className="block text-sm font-medium text-gray-700">生徒フリガナ(名)</label>
                    <input type="text" id="student_first_name_kana" value={formData.student_first_name_kana} onChange={(e) => setFormData({...formData, student_first_name_kana: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                </div>
            </div>
            <div>
                <label htmlFor="student_postal_code" className="block text-sm font-medium text-gray-700">郵便番号</label>
                <input type="text" id="student_postal_code" value={formData.student_postal_code} onChange={(e) => setFormData({...formData, student_postal_code: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="student_address" className="block text-sm font-medium text-gray-700">住所</label>
                <input type="text" id="student_address" value={formData.student_address} onChange={(e) => setFormData({...formData, student_address: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="student_address_detail" className="block text-sm font-medium text-gray-700">番地・部屋番号</label>
                <input type="text" id="student_address_detail" value={formData.student_address_detail} onChange={(e) => setFormData({...formData, student_address_detail: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="student_phone" className="block text-sm font-medium text-gray-700">電話番号</label>
                <input type="tel" id="student_phone" value={formData.student_phone} onChange={(e) => setFormData({...formData, student_phone: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="guardian1_last_name" className="block text-sm font-medium text-gray-700">保護者氏名(姓)</label>
                    <input type="text" id="guardian1_last_name" value={formData.guardian1_last_name} onChange={(e) => setFormData({...formData, guardian1_last_name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="guardian1_first_name" className="block text-sm font-medium text-gray-700">保護者氏名(名)</label>
                    <input type="text" id="guardian1_first_name" value={formData.guardian1_first_name} onChange={(e) => setFormData({...formData, guardian1_first_name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                </div>
            </div>
            <div>
                <label htmlFor="guardian1_email" className="block text-sm font-medium text-gray-700">保護者メールアドレス</label>
                <input type="email" id="guardian1_email" value={formData.guardian1_email} onChange={(e) => setFormData({...formData, guardian1_email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">キャンセル</button>
                <button type="submit" className="bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">保存</button>
            </div>
        </form>
    );
}

const AdminProfiles: React.FC = () => {
    const [profiles, setProfiles] = useState<StudentProfile[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<StudentProfile | null>(null);

    const handleOpenModal = (profile?: StudentProfile) => {
        setEditingProfile(profile || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProfile(null);
        setIsModalOpen(false);
    };

    const handleSave = (data: Omit<StudentProfile, 'student_id' | 'updated_at'>) => {
        if (editingProfile) {
            // Edit
            setProfiles(prev => prev.map(p => p.student_id === editingProfile.student_id ? { ...p, ...data, updated_at: new Date().toISOString() } : p));
        } else {
            // Create
            const newProfile: StudentProfile = {
                student_id: `student${Date.now()}`,
                ...data,
                updated_at: new Date().toISOString(),
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
                        <li key={profile.student_id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-medium text-blue-600 truncate">{profile.student_last_name} {profile.student_first_name}</p>
                                    <div className="ml-2 flex-shrink-0 flex items-center space-x-4">
                                        <span className="text-sm text-gray-500">受験番号: {profile.student_id}</span>
                                        <button onClick={() => handleOpenModal(profile)} className="text-gray-400 hover:text-blue-600"><PencilIcon className="w-5 h-5"/></button>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">{profile.guardian1_email}</p>
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
