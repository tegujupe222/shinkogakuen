
import React from 'react';
import DownloadIcon from '../icons/DownloadIcon';

const DocumentsView: React.FC = () => {
    // 仮のデータ（実際の運用ではAPIから取得）
    const documents = [
        {
            id: '1',
            name: '入学手続き書類',
            fileUrl: '/api/documents/1/download',
            fileName: 'admission_forms.pdf',
            uploadedAt: '2024-03-01T10:00:00Z'
        },
        {
            id: '2',
            name: '健康診断書',
            fileUrl: '/api/documents/2/download',
            fileName: 'health_check.pdf',
            uploadedAt: '2024-03-02T14:30:00Z'
        }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">書類ダウンロード</h2>
            {documents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.name}</h3>
                            <p className="text-sm text-gray-600 mb-4">{new Date(doc.uploadedAt).toLocaleDateString('ja-JP')}</p>
                            <a
                                href={doc.fileUrl}
                                download={doc.fileName}
                                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                            >
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                ダウンロード
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
                    <p className="text-gray-500">現在、ダウンロード可能な書類はありません。</p>
                </div>
            )}
        </div>
    );
};

export default DocumentsView;
