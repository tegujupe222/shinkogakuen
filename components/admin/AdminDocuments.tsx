
import React, { useState, useCallback } from 'react';
import { Document } from '../../types';
import UploadIcon from '../icons/UploadIcon';
import TrashIcon from '../icons/TrashIcon';

const AdminDocuments: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' }[]>([]);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newDocuments: Document[] = [];
        const newFeedback: { message: string; type: 'success' | 'error' }[] = [];

        Array.from(files).forEach((file: File) => {
            const fileUrl = URL.createObjectURL(file);
            newDocuments.push({ 
                id: `doc${Date.now()}`, 
                name: file.name.replace(/\.[^/.]+$/, ""), 
                fileUrl, 
                fileName: file.name,
                uploadedAt: new Date().toISOString()
            });
            newFeedback.push({ message: `成功: ${file.name} がアップロードされました。`, type: 'success' });
        });
        
        setDocuments(prev => [...prev, ...newDocuments]);
        setFeedback(newFeedback);

    }, []);
    
    const handleDelete = (id: string) => {
        if (window.confirm('この書類を削除してもよろしいですか？')) {
            setDocuments(prev => prev.filter(d => d.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">書類管理</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">書類アップロード</h3>
                <p className="text-sm text-gray-600 mt-1">学生がダウンロードできる書類をアップロードしてください。</p>
                <div className="mt-4">
                    <label htmlFor="document-upload" className="w-full cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        <UploadIcon className="w-5 h-5 mr-2"/>
                        ファイルを選択してアップロード
                    </label>
                    <input id="document-upload" name="document-upload" type="file" className="sr-only" multiple accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                </div>
                {feedback.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {feedback.map((item, index) => (
                            <p key={index} className={`text-sm ${item.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {item.message}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <h3 className="text-xl font-bold text-gray-800 px-4 py-4 sm:px-6">アップロード済み一覧</h3>
                <ul role="list" className="divide-y divide-gray-200">
                    {documents.map((doc) => (
                         <li key={doc.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                            <p className="text-md font-medium text-gray-800">{doc.name} ({doc.fileName})</p>
                             <button onClick={() => handleDelete(doc.id)} className="text-gray-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDocuments;
