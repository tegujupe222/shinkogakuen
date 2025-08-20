
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
                                        <p className="text-sm text-gray-500">
                                            アップロード日: {new Date(doc.uploadedAt).toLocaleDateString('ja-JP')}
                                        </p>
                                    </div>
                                    <div className="ml-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            PDF
                                        </span>
                                    </div>
                                </div>
                                <a
                                    href={doc.fileUrl}
                                    download={doc.fileName}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    <DownloadIcon className="w-4 h-4 mr-2" />
                                    ダウンロード
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">書類はありません</h3>
                    <p className="text-gray-600">現在、ダウンロード可能な書類はありません。</p>
                </div>
            )}
        </div>
    );
};

export default DocumentsView;
