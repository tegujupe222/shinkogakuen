
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
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">合格証書</h2>
                <p className="mt-1 text-sm text-gray-600">あなたの合格証書を確認・ダウンロードできます</p>
            </div>
            
            {userCertificate ? (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 sm:p-6">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">🏆</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">合格証書</h3>
                            <p className="text-gray-600">受験番号: {user?.id}</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="text-center">
                                <div className="text-gray-400 text-4xl mb-2">📄</div>
                                <p className="text-gray-600 text-sm">PDFファイル</p>
                                <p className="text-gray-500 text-xs mt-1">
                                    発行日: {new Date(userCertificate.issuedAt).toLocaleDateString('ja-JP')}
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <a
                                href={userCertificate.fileUrl}
                                download={userCertificate.fileName}
                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                合格証書をダウンロード
                            </a>
                            
                            <div className="text-center">
                                <p className="text-xs text-gray-500">
                                    ダウンロードしたPDFファイルは印刷してご利用ください
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🏆</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">合格証書が見つかりません</h3>
                    <p className="text-gray-600 mb-4">
                        あなたの合格証書はまだ準備中です。
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                            合格証書は後日アップロードされます。しばらくお待ちください。
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificateView;
