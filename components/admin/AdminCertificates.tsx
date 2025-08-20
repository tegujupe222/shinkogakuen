import React, { useState, useCallback } from 'react';
import { Certificate } from '../../types';
import UploadIcon from '../icons/UploadIcon';
import TrashIcon from '../icons/TrashIcon';

const AdminCertificates: React.FC = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' }[]>([]);

    // 仮のユーザーデータ（実際の運用ではAPIから取得）
    const mockUsers = [
        { id: '1', role: 'admin' },
        { id: '2', role: 'student' }
    ];

    const findUserById = (id: string) => mockUsers.find(user => user.id === id);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newCertificates: Certificate[] = [];
        const newFeedback: { message: string; type: 'success' | 'error' }[] = [];

        Array.from(files).forEach((file: File) => {
            const match = file.name.match(/^(\d{4})\.pdf$/i);
            if (match) {
                const studentId = match[1];
                const studentExists = findUserById(studentId);
                if(studentExists && studentExists.role === 'student'){
                    const fileUrl = URL.createObjectURL(file);
                    newCertificates.push({ 
                        id: `cert${Date.now()}${studentId}`, 
                        studentId, 
                        fileUrl, 
                        fileName: file.name,
                        issuedAt: new Date().toISOString()
                    });
                    newFeedback.push({ message: `成功: ${file.name} は受験番号 ${studentId} に紐付けられました。`, type: 'success' });
                } else {
                    newFeedback.push({ message: `エラー: ${file.name} の受験番号 ${studentId} は存在しません。`, type: 'error' });
                }
            } else {
                newFeedback.push({ message: `エラー: ${file.name} のファイル名が不正です。「受験番号4桁.pdf」の形式にしてください。`, type: 'error' });
            }
        });
        
        setCertificates(prev => {
            const updatedCerts = [...prev];
            newCertificates.forEach(newCert => {
                const existingIndex = updatedCerts.findIndex(c => c.studentId === newCert.studentId);
                if (existingIndex > -1) {
                    updatedCerts[existingIndex] = newCert;
                } else {
                    updatedCerts.push(newCert);
                }
            });
            return updatedCerts;
        });
        setFeedback(newFeedback);

    }, []);
    
    const handleDelete = (id: string) => {
        if (window.confirm('この合格証書を削除してもよろしいですか？')) {
            setCertificates(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">合格証書管理</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">合格証書アップロード</h3>
                <p className="text-sm text-gray-600 mt-1">ファイル名は「受験番号4桁.pdf」（例: 1001.pdf）としてください。複数ファイルを選択して一括アップロードできます。</p>
                <div className="mt-4">
                    <label htmlFor="certificate-upload" className="w-full cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        <UploadIcon className="w-5 h-5 mr-2"/>
                        ファイルを選択してアップロード
                    </label>
                    <input id="certificate-upload" name="certificate-upload" type="file" className="sr-only" multiple accept=".pdf" onChange={handleFileUpload} />
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
                    {certificates.map((cert) => (
                         <li key={cert.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                            <p className="text-md font-medium text-gray-800">受験番号: <span className="font-bold">{cert.studentId}</span> ({cert.fileName})</p>
                             <button onClick={() => handleDelete(cert.id)} className="text-gray-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminCertificates;