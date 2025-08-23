
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
            <div className="p-6">
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
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">お知らせ一覧</h2>
                <p className="mt-1 text-sm text-gray-600">最新のお知らせをお届けします</p>
            </div>
            
            {announcements.length > 0 ? (
                <div className="space-y-4">
                    {announcements.map((ann) => (
                        <div key={ann.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 leading-tight pr-4">
                                        {ann.title}
                                    </h3>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                                        {new Date(ann.createdAt).toLocaleDateString('ja-JP', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {ann.content}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">
                                        投稿者: {ann.author}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📢</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">お知らせはありません</h3>
                    <p className="text-gray-600">現在、新しいお知らせはありません。</p>
                </div>
            )}
        </div>
    );
};

export default AnnouncementsView;
