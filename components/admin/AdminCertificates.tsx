import React, { useState, useEffect } from 'react';

interface Certificate {
    id: string;
    student_id: string;
    file_name: string;
    file_url: string;
    issued_at: string;
    created_at: string;
    updated_at: string;
}

const AdminCertificates: React.FC = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCertificate, setNewCertificate] = useState({
        studentId: '',
        fileName: '',
        fileUrl: '',
        issuedAt: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // 合格証書一覧を取得
    const fetchCertificates = async () => {
        try {
            const response = await fetch('/api/certificates');
            if (response.ok) {
                const data = await response.json();
                setCertificates(data);
            }
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    // 合格証書を作成・更新
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        try {
            const response = await fetch('/api/certificates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId: newCertificate.studentId,
                    fileName: newCertificate.fileName,
                    fileUrl: newCertificate.fileUrl,
                    issuedAt: newCertificate.issuedAt
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setNewCertificate({
                    studentId: '',
                    fileName: '',
                    fileUrl: '',
                    issuedAt: new Date().toISOString().split('T')[0]
                });
                fetchCertificates(); // 一覧を更新
            } else {
                setMessage(`エラー: ${data.error}`);
            }
        } catch (error) {
            setMessage('合格証書の作成・更新に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

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

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">合格証書管理</h2>
                <p className="mt-1 text-sm text-gray-600">学生の合格証書を管理します</p>
            </div>

            {/* 新規作成フォーム */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">合格証書作成・更新</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                                受験番号 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="studentId"
                                value={newCertificate.studentId}
                                onChange={(e) => setNewCertificate(prev => ({ ...prev, studentId: e.target.value }))}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0001"
                                maxLength={4}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-1">
                                ファイル名 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="fileName"
                                value={newCertificate.fileName}
                                onChange={(e) => setNewCertificate(prev => ({ ...prev, fileName: e.target.value }))}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="certificate_0001.pdf"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-1">
                            ファイルURL
                        </label>
                        <input
                            type="url"
                            id="fileUrl"
                            value={newCertificate.fileUrl}
                            onChange={(e) => setNewCertificate(prev => ({ ...prev, fileUrl: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/certificate.pdf"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="issuedAt" className="block text-sm font-medium text-gray-700 mb-1">
                            発行日
                        </label>
                        <input
                            type="date"
                            id="issuedAt"
                            value={newCertificate.issuedAt}
                            onChange={(e) => setNewCertificate(prev => ({ ...prev, issuedAt: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? '処理中...' : '保存'}
                        </button>
                    </div>
                </form>
                
                {message && (
                    <div className={`mt-4 p-3 rounded-lg ${
                        message.includes('エラー') 
                            ? 'bg-red-50 border border-red-200 text-red-800' 
                            : 'bg-green-50 border border-green-200 text-green-800'
                    }`}>
                        <p className="text-sm">{message}</p>
                    </div>
                )}
            </div>

            {/* 合格証書一覧 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">合格証書一覧</h3>
                    
                    {certificates.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            受験番号
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ファイル名
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            発行日
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            更新日
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {certificates.map((cert) => (
                                        <tr key={cert.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {cert.student_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {cert.file_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(cert.issued_at).toLocaleDateString('ja-JP')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(cert.updated_at).toLocaleDateString('ja-JP')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4">🏆</div>
                            <p className="text-gray-500">合格証書がまだ登録されていません</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCertificates;