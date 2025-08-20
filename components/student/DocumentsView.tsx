
import React, { useState, useEffect } from 'react';
import DownloadIcon from '../icons/DownloadIcon';

interface Document {
    id: string;
    name: string;
    file_name: string;
    file_url: string;
    uploaded_at: string;
}

const DocumentsView: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await fetch('/api/documents');
                
                if (response.ok) {
                    const data = await response.json();
                    setDocuments(data);
                } else {
                    setError('書類の取得に失敗しました');
                }
            } catch (error) {
                console.error('Failed to fetch documents:', error);
                setError('書類の取得中にエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

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

    if (error) {
        return (
            <div className="p-4 sm:p-6">
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">書類の取得に失敗しました</h3>
                    <p className="text-gray-600 mb-4">
                        {error}
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm">
                            しばらく時間をおいてから再度お試しください。
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">書類ダウンロード</h2>
                <p className="mt-1 text-sm text-gray-600">入学手続きに必要な書類をダウンロードできます</p>
            </div>
            
            {documents.length > 0 ? (
                <div className="space-y-4">
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {doc.name}
                                        </h3>
                                        {/* doc.description is removed as per new schema */}
                                        <p className="text-xs text-gray-500">
                                            アップロード日: {new Date(doc.uploaded_at).toLocaleDateString('ja-JP')}
                                        </p>
                                    </div>
                                    <div className="ml-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            PDF
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {doc.file_url ? (
                                        <a
                                            href={doc.file_url}
                                            download={doc.file_name}
                                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                        >
                                            <DownloadIcon className="w-4 h-4 mr-2" />
                                            ダウンロード
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-500">
                                            ファイルURLが設定されていません
                                        </span>
                                    )}
                                    
                                    {doc.file_url && (
                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            プレビュー
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">書類はありません</h3>
                    <p className="text-gray-600">現在、ダウンロード可能な書類はありません。</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <p className="text-blue-800 text-sm">
                            書類は後日アップロードされます。しばらくお待ちください。
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsView;
