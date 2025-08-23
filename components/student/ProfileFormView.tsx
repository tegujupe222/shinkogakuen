import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StudentProfile, FormSetting, StudentResult } from '../../types';

type FormStep = 'personal' | 'commute' | 'art' | 'health';

const ProfileFormView: React.FC = () => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<FormStep>('personal');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [familyCount, setFamilyCount] = useState(1);
    const [formSettings, setFormSettings] = useState<FormSetting[]>([]);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [studentResult, setStudentResult] = useState<StudentResult | null>(null);
    
    const [profile, setProfile] = useState<Partial<StudentProfile>>({});
    
    useEffect(() => {
        if (user?.exam_no) {
            fetchProfile();
            fetchFormSettings();
            fetchStudentResult();
        }
    }, [user?.exam_no]);

    const fetchProfile = async () => {
        if (!user?.exam_no) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/api/profiles/${user.exam_no}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.profile) {
                    setProfile(data.profile);
                    // 家族数を計算
                    let count = 1;
                    for (let i = 2; i <= 6; i++) {
                        if (data.profile[`family${i}_last_name`]) {
                            count = i;
                        }
                    }
                    setFamilyCount(count);
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFormSettings = async () => {
        try {
            console.log('Student: Fetching form settings...');
            const response = await fetch('/api/form-settings');
            console.log('Student: Form settings response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Student: Form settings response data:', data);
                if (data.success) {
                    setFormSettings(data.settings);
                    console.log('Student: Form settings updated:', data.settings);
                }
            }
        } catch (error) {
            console.error('Failed to fetch form settings:', error);
        }
    };

    const fetchStudentResult = async () => {
        if (!user?.exam_no) return;
        
        try {
            const response = await fetch(`/api/results/${user.exam_no}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.result) {
                    setStudentResult(data.result);
                }
            }
        } catch (error) {
            console.error('Failed to fetch student result:', error);
        }
    };

    const handleInputChange = (field: keyof StudentProfile, value: string | boolean) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFamilyInputChange = (familyIndex: number, field: string, value: string) => {
        const fieldName = `family${familyIndex}_${field}` as keyof StudentProfile;
        setProfile(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const addFamilyMember = () => {
        if (familyCount < 6) {
            setFamilyCount(familyCount + 1);
        }
    };

    const isFieldRequired = (fieldKey: string): boolean => {
        const setting = formSettings.find(s => s.field_key === fieldKey);
        return setting?.is_required || false;
    };

    const getFieldError = (fieldKey: string): string | undefined => {
        return validationErrors[fieldKey];
    };

    // 動的フィールド生成関数
    const renderDynamicField = (setting: FormSetting) => {
        const fieldValue = profile[setting.field_key as keyof StudentProfile];
        const hasError = getFieldError(setting.field_key);
        
        // boolean型フィールドの動的検出
        const isBooleanField = setting.field_key === 'has_chronic_illness' || 
                             setting.field_key === 'has_siblings_at_school' ||
                             setting.field_key.includes('_completed') ||
                             setting.field_type === 'checkbox';
        
        // 文字列フィールド用の共通プロパティ
        const commonProps = {
            value: isBooleanField 
                ? (fieldValue === true ? 'あり' : fieldValue === false ? 'なし' : '')
                : (fieldValue as string) || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                let value: string | boolean = e.target.value;
                
                // boolean型フィールドの場合、適切な変換を行う
                if (isBooleanField) {
                    if (value === 'あり' || value === 'true') {
                        value = true;
                    } else if (value === 'なし' || value === 'false') {
                        value = false;
                    }
                }
                
                handleInputChange(setting.field_key as keyof StudentProfile, value);
            },
            className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`,
            required: setting.is_required,
            placeholder: setting.placeholder || undefined
        };

        switch (setting.field_type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'date':
                return (
                    <input
                        type={setting.field_type}
                        {...commonProps}
                    />
                );
            
            case 'textarea':
                return (
                    <textarea
                        {...commonProps}
                        rows={3}
                    />
                );
            
            case 'select':
                const options = setting.options ? setting.options.split(',').map(opt => opt.trim()) : [];
                return (
                    <select {...commonProps}>
                        <option value="">選択してください</option>
                        {options.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                );
            
            case 'checkbox':
                return (
                    <input
                        type="checkbox"
                        checked={fieldValue === true}
                        onChange={(e) => handleInputChange(setting.field_key as keyof StudentProfile, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                );
            
            case 'radio':
                const radioOptions = setting.options ? setting.options.split(',').map(opt => opt.trim()) : [];
                return (
                    <div className="space-y-2">
                        {radioOptions.map((option, index) => (
                            <label key={index} className="flex items-center">
                                <input
                                    type="radio"
                                    name={setting.field_key}
                                    value={option}
                                    checked={fieldValue === option}
                                    onChange={(e) => handleInputChange(setting.field_key as keyof StudentProfile, e.target.value)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            
            default:
                return (
                    <input
                        type="text"
                        {...commonProps}
                    />
                );
        }
    };

    // 合格判定
    const isAccepted = () => {
        if (!studentResult) return false;
        // accepted_courseが存在し、空でない場合は合格
        return studentResult.accepted_course && studentResult.accepted_course.trim() !== '';
    };

    const validateStep = (step: FormStep): boolean => {
        const errors: {[key: string]: string} = {};
        
        // 現在のステップの必須フィールドを取得
        const stepSettings = formSettings.filter(setting => {
            if (step === 'personal') return setting.field_group === 'personal';
            if (step === 'commute') return setting.field_group === 'commute';
            if (step === 'art') return setting.field_group === 'art';
            if (step === 'health') return setting.field_group === 'health';
            return false;
        });

        // 必須フィールドのバリデーション
        stepSettings.forEach(setting => {
            if (setting.is_required) {
                const fieldValue = profile[setting.field_key as keyof StudentProfile];
                
                // boolean型フィールドの動的検出と特別処理
                const isBooleanField = setting.field_key === 'has_chronic_illness' || 
                                     setting.field_key === 'has_siblings_at_school' ||
                                     setting.field_key.includes('_completed') ||
                                     setting.field_type === 'checkbox';
                
                if (isBooleanField) {
                    // boolean型フィールドの場合、undefinedまたはnullの場合のみエラー
                    if (fieldValue === undefined || fieldValue === null) {
                        errors[setting.field_key] = `${setting.field_label}は必須項目です`;
                    }
                } else {
                    // 文字列フィールドの処理
                    if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
                        errors[setting.field_key] = `${setting.field_label}は必須項目です`;
                    }
                }
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const saveForm = async (step: FormStep, isComplete: boolean = false) => {
        if (!user?.exam_no) return;

        // 完了提出時はバリデーションを実行
        if (isComplete && !validateStep(step)) {
            setMessage('必須項目が未入力です。すべての必須項目を入力してください。');
            return;
        }

        setSaving(true);
        setMessage('');
        setValidationErrors({});
        
        try {
            const formData = {
                ...profile,
                student_id: user.exam_no,
                [`${step}_info_completed`]: isComplete
            };

            const response = await fetch('/api/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage('保存しました');
                if (isComplete && step !== 'health') {
                    const steps: FormStep[] = ['personal', 'commute', 'art', 'health'];
                    const currentIndex = steps.indexOf(step);
                    if (currentIndex < steps.length - 1) {
                        setCurrentStep(steps[currentIndex + 1]);
                    }
                }
            } else {
                const data = await response.json();
                setMessage(`エラー: ${data.error}`);
            }
        } catch (error) {
            setMessage('保存中にエラーが発生しました');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">プロフィールを読み込み中...</p>
                </div>
            </div>
        );
    }

    // 不合格の場合は情報なしを表示
    if (!isAccepted()) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">プロフィール</h2>
                    <p className="text-gray-600">個人情報を入力してください</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-center py-8">
                        <p className="text-gray-500">情報がありません</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">プロフィール</h2>
                <p className="text-gray-600">個人情報を入力してください</p>
            </div>

            {/* ステップインジケーター */}
            <div className="mb-6">
                <div className="flex items-center justify-center space-x-4">
                    {[
                        { id: 'personal', name: '個人情報', icon: '👤' },
                        { id: 'commute', name: '通学方法', icon: '🚇' },
                        { id: 'art', name: '芸術科目', icon: '🎨' },
                        { id: 'health', name: '健康情報', icon: '🏥' }
                    ].map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                currentStep === step.id 
                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                    : index < ['personal', 'commute', 'art', 'health'].indexOf(currentStep)
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'bg-gray-200 border-gray-300 text-gray-500'
                            }`}>
                                <span className="text-sm">{step.icon}</span>
                            </div>
                            <span className={`ml-2 text-sm font-medium ${
                                currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                                {step.name}
                            </span>
                            {index < 3 && (
                                <div className="ml-4 w-8 h-0.5 bg-gray-300"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg border ${
                    message.includes('エラー') || message.includes('必須項目')
                        ? 'bg-red-50 border-red-200 text-red-800' 
                        : 'bg-green-50 border-green-200 text-green-800'
                }`}>
                    <p className="font-medium">{message}</p>
                </div>
            )}

            {/* バリデーションエラー表示 */}
            {Object.keys(validationErrors).length > 0 && (
                <div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
                    <p className="font-medium mb-2">以下の項目が未入力です：</p>
                    <ul className="list-disc list-inside space-y-1">
                        {Object.values(validationErrors).map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 個人情報入力フォーム */}
            {currentStep === 'personal' && (
                <div className="space-y-6">
                    {/* 生徒基本情報 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">生徒基本情報</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formSettings
                                .filter(setting => setting.field_group === 'personal')
                                .sort((a, b) => (a.field_order || 0) - (b.field_order || 0))
                                .map(setting => (
                                    <div key={setting.field_key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {setting.field_label}
                                            {setting.is_required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {renderDynamicField(setting)}
                                        {getFieldError(setting.field_key) && (
                                            <p className="mt-1 text-sm text-red-600">{getFieldError(setting.field_key)}</p>
                                        )}
                                        {setting.help_text && (
                                            <p className="mt-1 text-sm text-gray-500">{setting.help_text}</p>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => saveForm('personal', false)}
                            disabled={saving}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            {saving ? '保存中...' : '一時保存'}
                        </button>
                        <button
                            type="button"
                            onClick={() => saveForm('personal', true)}
                            disabled={saving}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? '保存中...' : '提出する'}
                        </button>
                    </div>
                </div>
            )}

            {/* 通学方法フォーム */}
            {currentStep === 'commute' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">通学方法</h3>
                        <div className="space-y-4">
                            {formSettings
                                .filter(setting => setting.field_group === 'commute')
                                .sort((a, b) => (a.field_order || 0) - (b.field_order || 0))
                                .map(setting => (
                                    <div key={setting.field_key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {setting.field_label}
                                            {setting.is_required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {renderDynamicField(setting)}
                                        {getFieldError(setting.field_key) && (
                                            <p className="mt-1 text-sm text-red-600">{getFieldError(setting.field_key)}</p>
                                        )}
                                        {setting.help_text && (
                                            <p className="mt-1 text-sm text-gray-500">{setting.help_text}</p>
                                        )}
                                    </div>
                                ))}


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        JR区間(始)
                                        {isFieldRequired('jr_start') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.jr_start || ''}
                                        onChange={(e) => handleInputChange('jr_start', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('jr_start') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('jr_start')}
                                    />
                                    {getFieldError('jr_start') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('jr_start')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        JR区間(終)
                                        {isFieldRequired('jr_end') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.jr_end || ''}
                                        onChange={(e) => handleInputChange('jr_end', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('jr_end') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('jr_end')}
                                    />
                                    {getFieldError('jr_end') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('jr_end')}</p>
                                    )}
                                </div>
                            </div>

                            {/* 神戸市営地下鉄（西神線） */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        神戸市営地下鉄（西神線）区間(始)
                                        {isFieldRequired('subway_nishin_start') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.subway_nishin_start || ''}
                                        onChange={(e) => handleInputChange('subway_nishin_start', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('subway_nishin_start') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('subway_nishin_start')}
                                    />
                                    {getFieldError('subway_nishin_start') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('subway_nishin_start')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        神戸市営地下鉄（西神線）区間(終)
                                        {isFieldRequired('subway_nishin_end') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.subway_nishin_end || ''}
                                        onChange={(e) => handleInputChange('subway_nishin_end', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('subway_nishin_end') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('subway_nishin_end')}
                                    />
                                    {getFieldError('subway_nishin_end') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('subway_nishin_end')}</p>
                                    )}
                                </div>
                            </div>

                            {/* 神戸市営地下鉄（海岸線） */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        神戸市営地下鉄（海岸線）区間（始）
                                        {isFieldRequired('subway_kaigan_start') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.subway_kaigan_start || ''}
                                        onChange={(e) => handleInputChange('subway_kaigan_start', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('subway_kaigan_start') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('subway_kaigan_start')}
                                    />
                                    {getFieldError('subway_kaigan_start') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('subway_kaigan_start')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        神戸市営地下鉄（海岸線）区間(終)
                                        {isFieldRequired('subway_kaigan_end') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.subway_kaigan_end || ''}
                                        onChange={(e) => handleInputChange('subway_kaigan_end', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('subway_kaigan_end') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('subway_kaigan_end')}
                                    />
                                    {getFieldError('subway_kaigan_end') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('subway_kaigan_end')}</p>
                                    )}
                                </div>
                            </div>

                            {/* 阪急 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        阪急区間(始)
                                        {isFieldRequired('hankyu_start') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.hankyu_start || ''}
                                        onChange={(e) => handleInputChange('hankyu_start', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('hankyu_start') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('hankyu_start')}
                                    />
                                    {getFieldError('hankyu_start') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('hankyu_start')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        阪急区間(終)
                                        {isFieldRequired('hankyu_end') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.hankyu_end || ''}
                                        onChange={(e) => handleInputChange('hankyu_end', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('hankyu_end') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('hankyu_end')}
                                    />
                                    {getFieldError('hankyu_end') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('hankyu_end')}</p>
                                    )}
                                </div>
                            </div>

                            {/* 神戸電鉄 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        神戸電鉄区間(始)
                                        {isFieldRequired('kobe_electric_start') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.kobe_electric_start || ''}
                                        onChange={(e) => handleInputChange('kobe_electric_start', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('kobe_electric_start') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('kobe_electric_start')}
                                    />
                                    {getFieldError('kobe_electric_start') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('kobe_electric_start')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        神戸電鉄区間(終)
                                        {isFieldRequired('kobe_electric_end') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.kobe_electric_end || ''}
                                        onChange={(e) => handleInputChange('kobe_electric_end', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('kobe_electric_end') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('kobe_electric_end')}
                                    />
                                    {getFieldError('kobe_electric_end') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('kobe_electric_end')}</p>
                                    )}
                                </div>
                            </div>

                            {/* 阪神 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        阪神区間(始)
                                        {isFieldRequired('hanshin_start') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.hanshin_start || ''}
                                        onChange={(e) => handleInputChange('hanshin_start', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('hanshin_start') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('hanshin_start')}
                                    />
                                    {getFieldError('hanshin_start') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('hanshin_start')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        阪神区間(終)
                                        {isFieldRequired('hanshin_end') && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.hanshin_end || ''}
                                        onChange={(e) => handleInputChange('hanshin_end', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            getFieldError('hanshin_end') 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        required={isFieldRequired('hanshin_end')}
                                    />
                                    {getFieldError('hanshin_end') && (
                                        <p className="mt-1 text-sm text-red-600">{getFieldError('hanshin_end')}</p>
                                    )}
                                </div>
                            </div>

                            {/* 山陽 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">山陽区間(始)</label>
                                    <input
                                        type="text"
                                        value={profile.sanyo_start || ''}
                                        onChange={(e) => handleInputChange('sanyo_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">山陽区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.sanyo_end || ''}
                                        onChange={(e) => handleInputChange('sanyo_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 神戸市営バス */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">神戸市営バス区間(始)</label>
                                    <input
                                        type="text"
                                        value={profile.kobe_bus_start || ''}
                                        onChange={(e) => handleInputChange('kobe_bus_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">神戸市営バス区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.kobe_bus_end || ''}
                                        onChange={(e) => handleInputChange('kobe_bus_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 山陽バス */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">山陽バス区間(始)</label>
                                    <input
                                        type="text"
                                        value={profile.sanyo_bus_start || ''}
                                        onChange={(e) => handleInputChange('sanyo_bus_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">山陽バス区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.sanyo_bus_end || ''}
                                        onChange={(e) => handleInputChange('sanyo_bus_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 神姫バス */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">神姫バス区間(始)</label>
                                    <input
                                        type="text"
                                        value={profile.shinhi_bus_start || ''}
                                        onChange={(e) => handleInputChange('shinhi_bus_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">神姫バス区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.shinhi_bus_end || ''}
                                        onChange={(e) => handleInputChange('shinhi_bus_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* その他1 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">その他１交通機関名</label>
                                    <input
                                        type="text"
                                        value={profile.other1_transport || ''}
                                        onChange={(e) => handleInputChange('other1_transport', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">その他１区間(始)</label>
                                    <input
                                        type="text"
                                        value={profile.other1_start || ''}
                                        onChange={(e) => handleInputChange('other1_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">その他１区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.other1_end || ''}
                                        onChange={(e) => handleInputChange('other1_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* その他2 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">その他２交通機関名</label>
                                    <input
                                        type="text"
                                        value={profile.other2_transport || ''}
                                        onChange={(e) => handleInputChange('other2_transport', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">その他２区間(始)</label>
                                    <input
                                        type="text"
                                        value={profile.other2_start || ''}
                                        onChange={(e) => handleInputChange('other2_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">その他２区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.other2_end || ''}
                                        onChange={(e) => handleInputChange('other2_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                    <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">経由地</label>
                                <input
                                    type="text"
                                    value={profile.via_station || ''}
                                    onChange={(e) => handleInputChange('via_station', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setCurrentStep('personal')}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            前へ
                        </button>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => saveForm('commute', false)}
                                disabled={saving}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                                {saving ? '保存中...' : '一時保存'}
                            </button>
                            <button
                                type="button"
                                onClick={() => saveForm('commute', true)}
                                disabled={saving}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? '保存中...' : '提出する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 芸術科目選択フォーム */}
            {currentStep === 'art' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">芸術科目選択</h3>
                        <div className="space-y-4">
                            {formSettings
                                .filter(setting => setting.field_group === 'art')
                                .sort((a, b) => (a.field_order || 0) - (b.field_order || 0))
                                .map(setting => (
                                    <div key={setting.field_key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {setting.field_label}
                                            {setting.is_required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {renderDynamicField(setting)}
                                        {getFieldError(setting.field_key) && (
                                            <p className="mt-1 text-sm text-red-600">{getFieldError(setting.field_key)}</p>
                                        )}
                                        {setting.help_text && (
                                            <p className="mt-1 text-sm text-gray-500">{setting.help_text}</p>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setCurrentStep('commute')}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            前へ
                        </button>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => saveForm('art', false)}
                                disabled={saving}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                                {saving ? '保存中...' : '一時保存'}
                            </button>
                            <button
                                type="button"
                                onClick={() => saveForm('art', true)}
                                disabled={saving}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? '保存中...' : '提出する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 健康情報フォーム */}
            {currentStep === 'health' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">健康情報</h3>
                        <div className="space-y-4">
                            {formSettings
                                .filter(setting => setting.field_group === 'health')
                                .sort((a, b) => (a.field_order || 0) - (b.field_order || 0))
                                .map(setting => (
                                    <div key={setting.field_key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {setting.field_label}
                                            {setting.is_required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {renderDynamicField(setting)}
                                        {getFieldError(setting.field_key) && (
                                            <p className="mt-1 text-sm text-red-600">{getFieldError(setting.field_key)}</p>
                                        )}
                                        {setting.help_text && (
                                            <p className="mt-1 text-sm text-gray-500">{setting.help_text}</p>
                                        )}
                                    </div>
                                ))}

                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setCurrentStep('art')}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            前へ
                        </button>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => saveForm('health', false)}
                                disabled={saving}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                                {saving ? '保存中...' : '一時保存'}
                            </button>
                            <button
                                type="button"
                                onClick={() => saveForm('health', true)}
                                disabled={saving}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? '保存中...' : 'すべてのフォームを提出完了です'}
                            </button>
                        </div>
                    </div>
                        </div>
                    )}
        </div>
    );
};

export default ProfileFormView;
