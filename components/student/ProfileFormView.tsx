import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StudentProfile } from '../../types';

type FormStep = 'personal' | 'commute' | 'art' | 'health';

const ProfileFormView: React.FC = () => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<FormStep>('personal');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [familyCount, setFamilyCount] = useState(1);
    
    const [profile, setProfile] = useState<Partial<StudentProfile>>({});

    useEffect(() => {
        if (user?.exam_no) {
            fetchProfile();
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

    const saveForm = async (step: FormStep, isComplete: boolean = false) => {
        if (!user?.exam_no) return;

        setSaving(true);
        setMessage('');
        
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
                    message.includes('エラー') 
                        ? 'bg-red-50 border-red-200 text-red-800' 
                        : 'bg-green-50 border-green-200 text-green-800'
                }`}>
                    <p className="font-medium">{message}</p>
                </div>
            )}

            {/* 個人情報入力フォーム */}
            {currentStep === 'personal' && (
                <div className="space-y-6">
                    {/* 生徒基本情報 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">生徒基本情報</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">生徒名前(姓)</label>
                                <input
                                    type="text"
                                    value={profile.student_last_name || ''}
                                    onChange={(e) => handleInputChange('student_last_name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">生徒名前(名)</label>
                                <input
                                    type="text"
                                    value={profile.student_first_name || ''}
                                    onChange={(e) => handleInputChange('student_first_name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">生徒名前(ふりがな)(せい)</label>
                                <input
                                    type="text"
                                    value={profile.student_last_name_kana || ''}
                                    onChange={(e) => handleInputChange('student_last_name_kana', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">生徒名前(ふりがな)(めい)</label>
                                <input
                                    type="text"
                                    value={profile.student_first_name_kana || ''}
                                    onChange={(e) => handleInputChange('student_first_name_kana', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                                <select
                                    value={profile.gender || ''}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">選択してください</option>
                                    <option value="男">男</option>
                                    <option value="女">女</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
                                <input
                                    type="date"
                                    value={profile.birth_date || ''}
                                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">本籍地</label>
                                <input
                                    type="text"
                                    value={profile.registered_address || ''}
                                    onChange={(e) => handleInputChange('registered_address', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 生徒現在住所 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">生徒現在住所</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">生徒の現在住所(郵便番号)</label>
                                <input
                                    type="text"
                                    value={profile.student_postal_code || ''}
                                    onChange={(e) => handleInputChange('student_postal_code', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="123-4567"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                                <input
                                    type="tel"
                                    value={profile.student_phone || ''}
                                    onChange={(e) => handleInputChange('student_phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="090-1234-5678"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">生徒の現在住所</label>
                                <input
                                    type="text"
                                    value={profile.student_address || ''}
                                    onChange={(e) => handleInputChange('student_address', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">生徒の現在住所(番地部屋番号)</label>
                                <input
                                    type="text"
                                    value={profile.student_address_detail || ''}
                                    onChange={(e) => handleInputChange('student_address_detail', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 出身校情報 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">出身校情報</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">出身中学校名</label>
                                <input
                                    type="text"
                                    value={profile.middle_school_name || ''}
                                    onChange={(e) => handleInputChange('middle_school_name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">卒業年月日</label>
                                <input
                                    type="date"
                                    value={profile.graduation_date || ''}
                                    onChange={(e) => handleInputChange('graduation_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">通学方法</label>
                                <select
                                    value={profile.commute_method || ''}
                                    onChange={(e) => handleInputChange('commute_method', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">選択してください</option>
                                    <option value="交通機関利用">交通機関利用</option>
                                    <option value="自転車">自転車</option>
                                    <option value="徒歩">徒歩</option>
                                </select>
                            </div>

                            {/* JR */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">JR区間(始)</label>
                                    <input
                                        type="text"
                                        value={profile.jr_start || ''}
                                        onChange={(e) => handleInputChange('jr_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">JR区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.jr_end || ''}
                                        onChange={(e) => handleInputChange('jr_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 神戸市営地下鉄（西神線） */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">神戸市営地下鉄（西神線）区間(始)</label>
                                    <input
                                        type="text"
                                        value={profile.subway_nishin_start || ''}
                                        onChange={(e) => handleInputChange('subway_nishin_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">神戸市営地下鉄（西神線）区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.subway_nishin_end || ''}
                                        onChange={(e) => handleInputChange('subway_nishin_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 神戸市営地下鉄（海岸線） */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">神戸市営地下鉄（海岸線）区間（始）</label>
                                    <input
                                        type="text"
                                        value={profile.subway_kaigan_start || ''}
                                        onChange={(e) => handleInputChange('subway_kaigan_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">神戸市営地下鉄（海岸線）区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.subway_kaigan_end || ''}
                                        onChange={(e) => handleInputChange('subway_kaigan_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 阪急 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">阪急区間(始)</label>
                                    <input
                                        type="text"
                                        value={profile.hankyu_start || ''}
                                        onChange={(e) => handleInputChange('hankyu_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">阪急区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.hankyu_end || ''}
                                        onChange={(e) => handleInputChange('hankyu_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 神戸電鉄 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">神戸電鉄区間(始)</label>
                                    <input
                                        type="text"
                                        value={profile.kobe_electric_start || ''}
                                        onChange={(e) => handleInputChange('kobe_electric_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">神戸電鉄区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.kobe_electric_end || ''}
                                        onChange={(e) => handleInputChange('kobe_electric_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 阪神 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">阪神区間(始)</label>
                                    <input
                                        type="text"
                                        value={profile.hanshin_start || ''}
                                        onChange={(e) => handleInputChange('hanshin_start', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">阪神区間(終)</label>
                                    <input
                                        type="text"
                                        value={profile.hanshin_end || ''}
                                        onChange={(e) => handleInputChange('hanshin_end', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">芸術選択第１希望科目</label>
                                <select
                                    value={profile.art_first_choice || ''}
                                    onChange={(e) => handleInputChange('art_first_choice', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">選択してください</option>
                                    <option value="音楽">音楽</option>
                                    <option value="美術">美術</option>
                                    <option value="書道">書道</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">芸術選択第２希望科目</label>
                                <select
                                    value={profile.art_second_choice || ''}
                                    onChange={(e) => handleInputChange('art_second_choice', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">選択してください</option>
                                    <option value="音楽">音楽</option>
                                    <option value="美術">美術</option>
                                    <option value="書道">書道</option>
                                </select>
                            </div>
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">持病について</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">持病</label>
                                <select
                                    value={profile.has_chronic_illness ? 'あり' : 'なし'}
                                    onChange={(e) => handleInputChange('has_chronic_illness', e.target.value === 'あり')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">選択してください</option>
                                    <option value="あり">あり</option>
                                    <option value="なし">なし</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">宿泊行事について学校へ伝えたいこと</label>
                                <textarea
                                    value={profile.accommodation_notes || ''}
                                    onChange={(e) => handleInputChange('accommodation_notes', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">学校生活について家庭からの連絡</label>
                                <textarea
                                    value={profile.family_communication || ''}
                                    onChange={(e) => handleInputChange('family_communication', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">持病に当てはまるもの</label>
                                <textarea
                                    value={profile.chronic_illness_details || ''}
                                    onChange={(e) => handleInputChange('chronic_illness_details', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                    placeholder="心疾患、川崎病、リウマチ熱、腎臓疾患、肝臓疾患、糖尿病、てんかん、喘息、難聴、弱視、側湾症、色覚異常、アトピー性皮膚炎、発達障害、身体障害、食物アレルギー、薬剤アレルギー、怪我、その他"
                                />
                            </div>
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
