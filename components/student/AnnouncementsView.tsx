
import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types';

const AnnouncementsView: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchAnnouncements();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">お知らせ一覧</h2>
                <div className="text-center py-8">
                    <div className="text-gray-500">読み込み中...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">お知らせ一覧</h2>
            {announcements.length > 0 ? (
                announcements.map((ann) => (
                    <div key={ann.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold text-gray-900">{ann.title}</h3>
                            <span className="text-sm text-gray-500">{new Date(ann.createdAt).toLocaleDateString('ja-JP')}</span>
                        </div>
                        <p className="mt-4 text-gray-600 whitespace-pre-wrap">{ann.content}</p>
                    </div>
                ))
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
                    <p className="text-gray-500">現在、お知らせはありません。</p>
                </div>
            )}
        </div>
    );
};

export default AnnouncementsView;
