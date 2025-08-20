
import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types';
import Modal from '../shared/Modal';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import PlusIcon from '../icons/PlusIcon';

const AnnouncementForm: React.FC<{ announcement: Partial<Announcement> | null, onSave: (ann: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'author'>) => void, onCancel: () => void }> = ({ announcement, onSave, onCancel }) => {
    const [title, setTitle] = useState(announcement?.title || '');
    const [content, setContent] = useState(announcement?.content || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, content });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">タイトル</label>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">内容</label>
                <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={5} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">キャンセル</button>
                <button type="submit" className="bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">保存</button>
            </div>
        </form>
    );
}

const AdminAnnouncements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [loading, setLoading] = useState(true);

    // お知らせ一覧を取得
    const fetchAnnouncements = async () => {
        try {
            const response = await fetch('/api/announcements');
            if (response.ok) {
                const data = await response.json();
                setAnnouncements(data);
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleOpenModal = (ann?: Announcement) => {
        setEditingAnnouncement(ann || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingAnnouncement(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'author'>) => {
        try {
            if (editingAnnouncement) {
                // 編集
                const response = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    await fetchAnnouncements();
                }
            } else {
                // 新規作成
                const response = await fetch('/api/announcements', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    await fetchAnnouncements();
                }
            }
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save announcement:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('このお知らせを削除してもよろしいですか？')) {
            try {
                const response = await fetch(`/api/announcements/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    await fetchAnnouncements();
                }
            } catch (error) {
                console.error('Failed to delete announcement:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">お知らせ管理</h2>
                </div>
                <div className="text-center py-8">
                    <div className="text-gray-500">読み込み中...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">お知らせ管理</h2>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    新規作成
                </button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {announcements.map((ann) => (
                        <li key={ann.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-medium text-blue-600 truncate">{ann.title}</p>
                                    <div className="ml-2 flex-shrink-0 flex items-center space-x-4">
                                        <span className="text-sm text-gray-500">{new Date(ann.createdAt).toLocaleDateString('ja-JP')}</span>
                                        <button onClick={() => handleOpenModal(ann)} className="text-gray-400 hover:text-blue-600"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(ann.id)} className="text-gray-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">{ann.content.substring(0, 100)}...</p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingAnnouncement ? 'お知らせを編集' : 'お知らせを新規作成'}>
                <AnnouncementForm 
                  announcement={editingAnnouncement} 
                  onSave={handleSave} 
                  onCancel={handleCloseModal} 
                />
            </Modal>
        </div>
    );
};

export default AdminAnnouncements;
