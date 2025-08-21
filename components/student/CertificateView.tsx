
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import DownloadIcon from '../icons/DownloadIcon';

interface Certificate {
    id: string;
    student_id: string;
    file_name: string;
    file_url: string;
    issued_at: string;
    created_at: string;
    updated_at: string;
}

const CertificateView: React.FC = () => {
    const { user } = useAuth();
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            if (!user?.exam_no) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/certificates/${user.exam_no}`);
                
                if (response.ok) {
                    const data = await response.json();
                    setCertificate(data);
                } else if (response.status === 404) {
                    setError('合格証書が見つかりません');
                } else {
                    setError('合格証書の取得に失敗しました');
                }
            } catch (error) {
                console.error('Failed to fetch certificate:', error);
                setError('合格証書の取得中にエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };

        fetchCertificate();
    }, [user?.exam_no]);

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
                    <div className="text-gray-400 text-6xl mb-4">🏆</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">合格証書が見つかりません</h3>
                    <p className="text-gray-600 mb-4">
                        {error}
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                            合格証書は後日アップロードされます。しばらくお待ちください。
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!certificate) {
        return (
            <div className="p-4 sm:p-6">
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
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">合格証書</h2>
                <p className="mt-1 text-sm text-gray-600">あなたの合格証書を確認・ダウンロードできます</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4 sm:p-6">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">合格証書</h3>
                        <p className="text-gray-600">受験番号: {user?.exam_no}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="text-center">
                            <div className="text-gray-400 text-4xl mb-2">📄</div>
                            <p className="text-gray-600 text-sm">{certificate.file_name}</p>
                            <p className="text-gray-500 text-xs mt-1">
                                発行日: {new Date(certificate.issued_at).toLocaleDateString('ja-JP')}
                            </p>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <a
                            href={certificate.file_url}
                            download={certificate.file_name}
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
        </div>
    );
};

export default CertificateView;
