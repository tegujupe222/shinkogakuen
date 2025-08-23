import React, { useState, useEffect } from 'react';
import { FormSetting } from '../../types';
import Modal from '../shared/Modal';
import TrashIcon from '../icons/TrashIcon';
import PencilIcon from '../icons/PencilIcon';
import PlusIcon from '../icons/PlusIcon';

const AdminFormSettings: React.FC = () => {
    const [settings, setSettings] = useState<FormSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSetting, setEditingSetting] = useState<FormSetting | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState<string>('all');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            console.log('FormSettings: Fetching settings...');
            const response = await fetch('/api/form-settings');
            console.log('FormSettings: Fetch response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('FormSettings: Fetch response data:', data);
                if (data.success) {
                    setSettings(data.settings);
                    console.log('FormSettings: Settings updated:', data.settings);
                }
            }
        } catch (error) {
            console.error('Failed to fetch form settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSettings = settings.filter(setting => {
        const matchesSearch = 
            setting.field_label.includes(searchTerm) ||
            setting.field_key.includes(searchTerm) ||
            setting.field_group.includes(searchTerm);
        
        if (filterGroup === 'all') return matchesSearch;
        return matchesSearch && setting.field_group === filterGroup;
    });

    const handleSave = async (formData: Partial<FormSetting>) => {
        try {
            const url = editingSetting 
                ? `/api/form-settings/${editingSetting.field_key}`
                : '/api/form-settings';
            
            const method = editingSetting ? 'PUT' : 'POST';
            
            console.log('FormSettings: Saving with method:', method);
            console.log('FormSettings: URL:', url);
            console.log('FormSettings: Form data:', formData);
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            console.log('FormSettings: Response status:', response.status);
            const data = await response.json();
            console.log('FormSettings: Response data:', data);

            if (response.ok) {
                console.log('FormSettings: Save successful');
                setShowModal(false);
                setEditingSetting(null);
                fetchSettings();
            } else {
                console.log('FormSettings: Save failed');
                alert(`エラー: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to save form setting:', error);
            alert('保存に失敗しました');
        }
    };

    const handleDelete = async (fieldKey: string) => {
        if (!confirm('このフォーム設定を削除しますか？')) return;
        
        try {
            const response = await fetch(`/api/form-settings/${fieldKey}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchSettings();
            } else {
                const data = await response.json();
                alert(`エラー: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to delete form setting:', error);
            alert('削除に失敗しました');
        }
    };

    const openEditModal = (setting: FormSetting) => {
        setEditingSetting(setting);
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingSetting(null);
        setShowModal(true);
    };

    const getFieldTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            text: 'テキスト',
            email: 'メール',
            tel: '電話番号',
            date: '日付',
            select: '選択',
            textarea: 'テキストエリア',
            checkbox: 'チェックボックス',
            radio: 'ラジオボタン'
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">フォーム設定を読み込み中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">フォーム設定管理</h2>
                <p className="text-gray-600">プロフィールフォームのフィールドをカスタマイズできます</p>
            </div>

            {/* 検索・フィルター・追加 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="フィールド名、キー、グループで検索"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">グループ</label>
                        <select
                            value={filterGroup}
                            onChange={(e) => setFilterGroup(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">すべて</option>
                            <option value="personal">個人情報</option>
                            <option value="commute">通学方法</option>
                            <option value="art">芸術科目</option>
                            <option value="health">健康情報</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={openCreateModal}
                            className="flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            <PlusIcon className="w-4 h-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">新規フィールド追加</span>
                            <span className="sm:hidden">フィールド追加</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* フォーム設定一覧 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    フィールド名
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    フィールドキー
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    タイプ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    グループ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    設定
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSettings.map((setting) => (
                                <tr key={setting.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {setting.field_label}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {setting.field_key}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getFieldTypeLabel(setting.field_type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {setting.field_group}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-1">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                setting.is_required 
                                                    ? 'bg-red-100 text-red-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {setting.is_required ? '必須' : '任意'}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                setting.is_visible 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {setting.is_visible ? '表示' : '非表示'}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                setting.is_editable 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {setting.is_editable ? '編集可' : '編集不可'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEditModal(setting)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(setting.field_key)}
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
                
                {filteredSettings.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">フォーム設定が見つかりません</p>
                    </div>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
                総件数: {filteredSettings.length}件
            </div>

            {/* フォーム設定編集モーダル */}
            {showModal && (
                <FormSettingModal
                    setting={editingSetting}
                    onSave={handleSave}
                    onClose={() => {
                        setShowModal(false);
                        setEditingSetting(null);
                    }}
                />
            )}
        </div>
    );
};

// フォーム設定編集モーダルコンポーネント
interface FormSettingModalProps {
    setting: FormSetting | null;
    onSave: (data: Partial<FormSetting>) => void;
    onClose: () => void;
}

const FormSettingModal: React.FC<FormSettingModalProps> = ({ setting, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        field_key: setting?.field_key || '',
        field_label: setting?.field_label || '',
        field_type: setting?.field_type || 'text',
        field_group: setting?.field_group || 'personal',
        field_order: setting?.field_order || 0,
        is_required: setting?.is_required || false,
        is_visible: setting?.is_visible !== false,
        is_editable: setting?.is_editable !== false,
        validation_rules: setting?.validation_rules || '',
        field_options: setting?.options || '',
        placeholder: setting?.placeholder || '',
        help_text: setting?.help_text || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal 
            isOpen={true}
            onClose={onClose}
            title={setting ? 'フォーム設定を編集' : '新規フォーム設定を作成'}
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {setting ? 'フォーム設定を編集' : '新規フォーム設定を作成'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">フィールドキー</label>
                            <input
                                type="text"
                                value={formData.field_key}
                                onChange={(e) => setFormData({...formData, field_key: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!!setting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">フィールド名</label>
                            <input
                                type="text"
                                value={formData.field_label}
                                onChange={(e) => setFormData({...formData, field_label: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">フィールドタイプ</label>
                            <select
                                value={formData.field_type}
                                onChange={(e) => setFormData({...formData, field_type: e.target.value as any})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="text">テキスト</option>
                                <option value="email">メール</option>
                                <option value="tel">電話番号</option>
                                <option value="date">日付</option>
                                <option value="select">選択</option>
                                <option value="textarea">テキストエリア</option>
                                <option value="checkbox">チェックボックス</option>
                                <option value="radio">ラジオボタン</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">グループ</label>
                            <select
                                value={formData.field_group}
                                onChange={(e) => setFormData({...formData, field_group: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="personal">個人情報</option>
                                <option value="commute">通学方法</option>
                                <option value="art">芸術科目</option>
                                <option value="health">健康情報</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">表示順序</label>
                            <input
                                type="number"
                                value={formData.field_order}
                                onChange={(e) => setFormData({...formData, field_order: parseInt(e.target.value) || 0})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_required"
                                checked={formData.is_required}
                                onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_required" className="ml-2 block text-sm text-gray-900">
                                必須項目
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_visible"
                                checked={formData.is_visible}
                                onChange={(e) => setFormData({...formData, is_visible: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_visible" className="ml-2 block text-sm text-gray-900">
                                表示する
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_editable"
                                checked={formData.is_editable}
                                onChange={(e) => setFormData({...formData, is_editable: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_editable" className="ml-2 block text-sm text-gray-900">
                                編集可能
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">プレースホルダー</label>
                        <input
                            type="text"
                            value={formData.placeholder}
                            onChange={(e) => setFormData({...formData, placeholder: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ヘルプテキスト</label>
                        <textarea
                            value={formData.help_text}
                            onChange={(e) => setFormData({...formData, help_text: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">選択肢（カンマ区切り）</label>
                        <textarea
                            value={formData.field_options}
                            onChange={(e) => setFormData({...formData, field_options: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="選択肢1,選択肢2,選択肢3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">バリデーションルール</label>
                        <textarea
                            value={formData.validation_rules}
                            onChange={(e) => setFormData({...formData, validation_rules: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="正規表現やバリデーションルール"
                        />
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
                            {setting ? '更新' : '作成'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AdminFormSettings;
