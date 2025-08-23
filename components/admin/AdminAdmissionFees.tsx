import React, { useState, useEffect } from 'react';
import { AdmissionFeeSettings, AdmissionFeeExemption } from '../../types';
import Modal from '../shared/Modal';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import PlusIcon from '../icons/PlusIcon';

const AdminAdmissionFees: React.FC = () => {
    const [settings, setSettings] = useState<AdmissionFeeSettings | null>(null);
    const [exemptions, setExemptions] = useState<AdmissionFeeExemption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showExemptionModal, setShowExemptionModal] = useState(false);
    const [editingExemption, setEditingExemption] = useState<AdmissionFeeExemption | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [settingsResponse, exemptionsResponse] = await Promise.all([
                fetch('/api/admission-fee-settings'),
                fetch('/api/admission-fee-exemptions')
            ]);

            if (settingsResponse.ok) {
                const settingsData = await settingsResponse.json();
                setSettings(settingsData.settings);
            }

            if (exemptionsResponse.ok) {
                const exemptionsData = await exemptionsResponse.json();
                setExemptions(exemptionsData.exemptions);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (formData: Partial<AdmissionFeeSettings>) => {
        try {
            const url = settings ? '/api/admission-fee-settings' : '/api/admission-fee-settings';
            const method = settings ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings ? { id: settings.id, ...formData } : formData),
            });

            if (response.ok) {
                setShowSettingsModal(false);
                fetchData();
                alert('設定を保存しました');
            } else {
                const data = await response.json();
                alert(`エラー: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('保存に失敗しました');
        }
    };

    const handleSaveExemption = async (formData: Partial<AdmissionFeeExemption>) => {
        try {
            const url = editingExemption 
                ? `/api/admission-fee-exemptions/${editingExemption.id}`
                : '/api/admission-fee-exemptions';
            
            const method = editingExemption ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowExemptionModal(false);
                setEditingExemption(null);
                fetchData();
                alert('免除設定を保存しました');
            } else {
                const data = await response.json();
                alert(`エラー: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to save exemption:', error);
            alert('保存に失敗しました');
        }
    };

    const handleDeleteExemption = async (id: string) => {
        if (!confirm('この免除設定を削除しますか？')) return;
        
        try {
            const response = await fetch(`/api/admission-fee-exemptions/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchData();
                alert('免除設定を削除しました');
            } else {
                const data = await response.json();
                alert(`エラー: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to delete exemption:', error);
            alert('削除に失敗しました');
        }
    };

    const openExemptionModal = (exemption?: AdmissionFeeExemption) => {
        setEditingExemption(exemption || null);
        setShowExemptionModal(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP').format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">データを読み込み中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">入学手続金管理</h2>
                <p className="text-gray-600">入学手続金の設定と免除項目を管理できます</p>
            </div>

            {/* 基本設定 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">基本設定</h3>
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        編集
                    </button>
                </div>

                {settings ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">手続金内訳</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>入学金</span>
                                    <span className="font-medium">{formatCurrency(settings.admission_fee)}円</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>諸費</span>
                                    <span className="font-medium">{formatCurrency(settings.miscellaneous_fee)}円</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>学年費の一部</span>
                                    <span className="font-medium">{formatCurrency(settings.grade_fee)}円</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold">
                                    <span>計</span>
                                    <span>{formatCurrency(settings.admission_fee + settings.miscellaneous_fee + settings.grade_fee)}円</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">振込期日</h4>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium">専願者:</span>
                                    <span className="ml-2">{formatDate(settings.dedicated_deadline)}</span>
                                </div>
                                <div>
                                    <span className="font-medium">併願者:</span>
                                    <span className="ml-2">{formatDate(settings.combined_deadline)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">基本設定が未設定です</p>
                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            基本設定を作成
                        </button>
                    </div>
                )}

                {/* 注意事項表示 */}
                {settings?.notes && (
                    <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-3">注意事項</h4>
                        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                            <pre className="text-sm text-yellow-800 whitespace-pre-wrap">{settings.notes}</pre>
                        </div>
                    </div>
                )}
            </div>

            {/* 免除設定 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">免除設定</h3>
                    <button
                        onClick={() => openExemptionModal()}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        新規追加
                    </button>
                </div>

                {exemptions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        免除名
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        免除金額
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        状態
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {exemptions.map((exemption) => (
                                    <tr key={exemption.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {exemption.exemption_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatCurrency(exemption.exemption_amount)}円
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                exemption.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {exemption.is_active ? '有効' : '無効'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openExemptionModal(exemption)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExemption(exemption.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">免除設定がありません</p>
                    </div>
                )}
            </div>

            {/* 基本設定編集モーダル */}
            {showSettingsModal && (
                <SettingsModal
                    settings={settings}
                    onSave={handleSaveSettings}
                    onClose={() => setShowSettingsModal(false)}
                />
            )}

            {/* 免除設定編集モーダル */}
            {showExemptionModal && (
                <ExemptionModal
                    exemption={editingExemption}
                    onSave={handleSaveExemption}
                    onClose={() => {
                        setShowExemptionModal(false);
                        setEditingExemption(null);
                    }}
                />
            )}
        </div>
    );
};

// 基本設定編集モーダル
interface SettingsModalProps {
    settings: AdmissionFeeSettings | null;
    onSave: (data: Partial<AdmissionFeeSettings>) => void;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        admission_fee: settings?.admission_fee || 200000,
        miscellaneous_fee: settings?.miscellaneous_fee || 240000,
        grade_fee: settings?.grade_fee || 150000,
        dedicated_deadline: settings?.dedicated_deadline || '2026-02-19',
        combined_deadline: settings?.combined_deadline || '2026-03-24',
        notes: settings?.notes || '• 振込期日までに指定口座にお振込みください\n• 振込手数料はご負担ください\n• 振込人名義は保護者名でお願いします\n• 振込完了後、振込控えを学校までご提出ください'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal 
            isOpen={true}
            onClose={onClose}
            title={settings ? '基本設定を編集' : '基本設定を作成'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">入学金</label>
                        <input
                            type="number"
                            value={formData.admission_fee}
                            onChange={(e) => setFormData({...formData, admission_fee: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">諸費</label>
                        <input
                            type="number"
                            value={formData.miscellaneous_fee}
                            onChange={(e) => setFormData({...formData, miscellaneous_fee: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">学年費の一部</label>
                        <input
                            type="number"
                            value={formData.grade_fee}
                            onChange={(e) => setFormData({...formData, grade_fee: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">専願者振込期日</label>
                        <input
                            type="date"
                            value={formData.dedicated_deadline}
                            onChange={(e) => setFormData({...formData, dedicated_deadline: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">併願者振込期日</label>
                        <input
                            type="date"
                            value={formData.combined_deadline}
                            onChange={(e) => setFormData({...formData, combined_deadline: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">注意事項</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={6}
                        placeholder="注意事項を入力してください"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        改行で区切って複数の注意事項を入力できます
                    </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {settings ? '更新' : '作成'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// 免除設定編集モーダル
interface ExemptionModalProps {
    exemption: AdmissionFeeExemption | null;
    onSave: (data: Partial<AdmissionFeeExemption>) => void;
    onClose: () => void;
}

const ExemptionModal: React.FC<ExemptionModalProps> = ({ exemption, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        exemption_name: exemption?.exemption_name || '',
        exemption_amount: exemption?.exemption_amount || 0,
        is_active: exemption?.is_active !== false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal 
            isOpen={true}
            onClose={onClose}
            title={exemption ? '免除設定を編集' : '新規免除設定を作成'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">免除名</label>
                    <input
                        type="text"
                        value={formData.exemption_name}
                        onChange={(e) => setFormData({...formData, exemption_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">免除金額</label>
                    <input
                        type="number"
                        value={formData.exemption_amount}
                        onChange={(e) => setFormData({...formData, exemption_amount: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                        有効にする
                    </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {exemption ? '更新' : '作成'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AdminAdmissionFees;
