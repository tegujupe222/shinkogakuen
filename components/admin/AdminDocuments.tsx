
import React, { useState, useEffect, useRef } from 'react';
import UploadIcon from '../icons/UploadIcon';
import TrashIcon from '../icons/TrashIcon';

interface Document {
    id: string;
    name: string;
    file_name: string;
    file_url: string;
    uploaded_at: string;
}

const AdminDocuments: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDocument, setNewDocument] = useState({
        name: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 書類一覧を取得
    const fetchDocuments = async () => {
        try {
            const response = await fetch('/api/documents');
            if (response.ok) {
                const data = await response.json();
                setDocuments(data);
            }
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // ファイル選択ハンドラー
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // PDFファイルのみ許可
            if (file.type !== 'application/pdf') {
                setMessage('PDFファイルのみアップロード可能です');
                return;
            }
            
            // ファイルサイズ制限 (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setMessage('ファイルサイズは10MB以下にしてください');
                return;
            }

            setSelectedFile(file);
            setMessage('');
        }
    };

    // 書類をアップロード
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedFile) {
            setMessage('ファイルを選択してください');
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {
            // 1. ファイルをアップロード
            const formData = new FormData();
            formData.append('file', selectedFile);

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok) {
                setMessage(`エラー: ${uploadResult.error}`);
                return;
            }

            // 2. 書類情報をデータベースに保存
            const documentData = {
                name: newDocument.name,
                fileName: uploadResult.fileName,
                fileUrl: uploadResult.fileUrl
            };

            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(documentData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setNewDocument({
                    name: ''
                });
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                fetchDocuments(); // 一覧を更新
            } else {
                setMessage(`エラー: ${data.error}`);
            }
        } catch (error) {
            setMessage('書類のアップロードに失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 書類を削除
    const handleDelete = async (id: string) => {
        if (!window.confirm('この書類を削除してもよろしいですか？')) {
            return;
        }

        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                fetchDocuments(); // 一覧を更新
            } else {
                setMessage(`エラー: ${data.error}`);
            }
        } catch (error) {
            setMessage('書類の削除に失敗しました');
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
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">書類管理</h2>
                <p className="mt-1 text-sm text-gray-600">学生向けの書類を管理します</p>
            </div>

            {/* 新規アップロードフォーム */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">書類アップロード</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                書類名 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={newDocument.name}
                                onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="入学手続き書類"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                                PDFファイル <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="file"
                                accept=".pdf"
                                onChange={handleFileSelect}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                PDFファイルのみ、最大10MBまで
                            </p>
                        </div>
                    </div>
                    


                    {selectedFile && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                                <strong>選択されたファイル:</strong> {selectedFile.name} 
                                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        </div>
                    )}
                    
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedFile}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            <UploadIcon className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'アップロード中...' : 'アップロード'}
                        </button>
                    </div>
                </form>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                    message.includes('エラー') 
                        ? 'bg-red-50 border border-red-200 text-red-800' 
                        : 'bg-green-50 border border-green-200 text-green-800'
                }`}>
                    <p className="text-sm">{message}</p>
                </div>
            )}

            {/* 書類一覧 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">アップロード済み書類</h3>
                    
                    {documents.length > 0 ? (
                        <div className="space-y-4">
                            {documents.map((document) => (
                                <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-medium text-blue-600">{document.name}</h4>
                                            <p className="text-sm text-gray-600">{document.file_name}</p>

                                            <p className="text-xs text-gray-500 mt-1">
                                                アップロード日: {new Date(document.uploaded_at).toLocaleDateString('ja-JP')}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <a
                                                href={document.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                ダウンロード
                                            </a>
                                            <button
                                                onClick={() => handleDelete(document.id)}
                                                className="text-red-400 hover:text-red-600 p-2"
                                                title="削除"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4">📄</div>
                            <p className="text-gray-500">アップロードされた書類がありません</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDocuments;
