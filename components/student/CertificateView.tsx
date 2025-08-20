
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import DownloadIcon from '../icons/DownloadIcon';

const CertificateView: React.FC = () => {
    const { user } = useAuth();
    
    // 仮のデータ（実際の運用ではAPIから取得）
    const mockCertificate = {
        id: '1',
        studentId: '2',
        fileUrl: '/api/certificates/1/download',
        fileName: 'certificate.pdf',
        issuedAt: '2024-03-01T10:00:00Z'
    };
    
    const userCertificate = user?.id === mockCertificate.studentId ? mockCertificate : null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">合格証書</h2>
            {userCertificate ? (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto">
                    <h3 className="text-xl font-semibold text-center text-gray-900">合格証書 (PDF)</h3>
                    <p className="text-center text-gray-600 mt-2">受験番号: {user?.id}</p>
                    <div className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-4 h-96 flex items-center justify-center">
                        <p className="text-gray-500">PDFプレビューエリア</p>
                    </div>
                     <a
                        href={userCertificate.fileUrl}
                        download={userCertificate.fileName}
                        className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        合格証書をダウンロード
                    </a>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
                    <p className="text-gray-500">あなたの合格証書が見つかりませんでした。</p>
                </div>
            )}
        </div>
    );
};

export default CertificateView;
