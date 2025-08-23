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
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">個人情報入力</h3>
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
        </div>
    );
};

export default ProfileFormView;
