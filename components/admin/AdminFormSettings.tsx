'use client';

import React, { useState, useEffect } from 'react';
import { FormSetting } from '../../types';
import PlusIcon from '../icons/PlusIcon';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import XIcon from '../icons/XIcon';

const AdminFormSettings: React.FC = () => {
    const [formSettings, setFormSettings] = useState<FormSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingField, setEditingField] = useState<FormSetting | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        fetchFormSettings();
    }, []);

    const fetchFormSettings = async () => {
        try {
            const response = await fetch('/api/form-settings');
            if (response.ok) {
                const data = await response.json();
                setFormSettings(data);
            }
        } catch (error) {
            console.error('Failed to fetch form settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData: Partial<FormSetting>) => {
        try {
            const response = await fetch('/api/form-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage('保存しました');
                setTimeout(() => setMessage(''), 3000);
                setEditingField(null);
                setShowAddForm(false);
                fetchFormSettings();
            } else {
                setMessage('保存に失敗しました');
            }
        } catch (error) {
            setMessage('エラーが発生しました');
        }
    };

    const handleDelete = async (fieldKey: string) => {
        if (!confirm('このフィールドを削除しますか？')) return;

        try {
            const response = await fetch(`/api/form-settings/${fieldKey}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMessage('削除しました');
                setTimeout(() => setMessage(''), 3000);
                fetchFormSettings();
            } else {
                setMessage('削除に失敗しました');
            }
        } catch (error) {
            setMessage('エラーが発生しました');
        }
    };

    const fieldTypes = [
        { value: 'text', label: 'テキスト' },
        { value: 'email', label: 'メールアドレス' },
        { value: 'tel', label: '電話番号' },
        { value: 'date', label: '日付' },
        { value: 'select', label: 'セレクトボックス' },
        { value: 'textarea', label: 'テキストエリア' },
        { value: 'checkbox', label: 'チェックボックス' },
        { value: 'radio', label: 'ラジオボタン' },
    ];

    const fieldGroups = [
        { value: 'personal', label: '個人情報' },
        { value: 'guardian1', label: '保護者1情報' },
        { value: 'guardian2', label: '保護者2情報' },
        { value: 'commute', label: '通学方法' },
        { value: 'art', label: '芸術科目選択' },
        { value: 'health', label: '健康情報' },
        { value: 'custom', label: 'カスタム' },
    ];

    const FormFieldEditor = ({ field, onSave, onCancel }: {
        field?: Partial<FormSetting>;
        onSave: (data: Partial<FormSetting>) => void;
        onCancel: () => void;
    }) => {
        const [formData, setFormData] = useState<Partial<FormSetting>>(field || {
            field_type: 'text',
            field_group: 'personal',
            field_order: 1,
            is_required: false,
            is_visible: true,
            is_editable: true,
        });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(formData);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            {field ? 'フィールド編集' : '新規フィールド追加'}
                        </h3>
                        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    フィールドキー <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.field_key || ''}
                                    onChange={(e) => setFormData({ ...formData, field_key: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={!!field}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    フィールドラベル <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.field_label || ''}
                                    onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    フィールドタイプ <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.field_type || 'text'}
                                    onChange={(e) => setFormData({ ...formData, field_type: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    {fieldTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    フィールドグループ <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.field_group || 'personal'}
                                    onChange={(e) => setFormData({ ...formData, field_group: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    {fieldGroups.map(group => (
                                        <option key={group.value} value={group.value}>
                                            {group.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    表示順序 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.field_order || 1}
                                    onChange={(e) => setFormData({ ...formData, field_order: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_required"
                                    checked={formData.is_required || false}
                                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
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
                                    checked={formData.is_visible !== false}
                                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
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
                                    checked={formData.is_editable !== false}
                                    onChange={(e) => setFormData({ ...formData, is_editable: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_editable" className="ml-2 block text-sm text-gray-900">
                                    編集可能
                                </label>
                            </div>
                        </div>

                        {(formData.field_type === 'select' || formData.field_type === 'radio') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    選択肢（カンマ区切り）
                                </label>
                                <input
                                    type="text"
                                    value={formData.options || ''}
                                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="選択肢1,選択肢2,選択肢3"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                プレースホルダー
                            </label>
                            <input
                                type="text"
                                value={formData.placeholder || ''}
                                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ヘルプテキスト
                            </label>
                            <textarea
                                value={formData.help_text || ''}
                                onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                保存
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
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
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">フォーム設定管理</h2>
                <p className="mt-1 text-sm text-gray-600">学生プロフィールフォームのフィールドをカスタマイズ</p>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-md ${
                    message.includes('失敗') || message.includes('エラー')
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-green-50 text-green-800 border border-green-200'
                }`}>
                    {message}
                </div>
            )}

            <div className="mb-4 flex justify-between items-center">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        新規フィールド追加
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    フィールド
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    タイプ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    グループ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    順序
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
                            {formSettings.map((setting) => (
                                <tr key={setting.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {setting.field_label}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {setting.field_key}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {fieldTypes.find(t => t.value === setting.field_type)?.label || setting.field_type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {fieldGroups.find(g => g.value === setting.field_group)?.label || setting.field_group}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {setting.field_order}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex space-x-2">
                                            {setting.is_required && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    必須
                                                </span>
                                            )}
                                            {!setting.is_visible && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    非表示
                                                </span>
                                            )}
                                            {!setting.is_editable && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    読み取り専用
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setEditingField(setting)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="編集"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(setting.field_key)}
                                                className="text-red-600 hover:text-red-900"
                                                title="削除"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddForm && (
                <FormFieldEditor
                    onSave={handleSave}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {editingField && (
                <FormFieldEditor
                    field={editingField}
                    onSave={handleSave}
                    onCancel={() => setEditingField(null)}
                />
            )}
        </div>
    );
};

export default AdminFormSettings;
