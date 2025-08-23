'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StudentProfile } from '../../types';

type FormStep = 'personal' | 'commute' | 'art' | 'health';

const ProfileFormView: React.FC = () => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<FormStep>('personal');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [profile, setProfile] = useState<Partial<StudentProfile>>({
        student_last_name: '',
        student_first_name: '',
        student_last_name_kana: '',
        student_first_name_kana: '',
        gender: '',
        birth_date: '',
        registered_address: '',
        student_postal_code: '',
        student_address: '',
        student_address_detail: '',
        student_phone: '',
        middle_school_name: '',
        graduation_date: '',
        guardian1_last_name: '',
        guardian1_first_name: '',
        guardian1_last_name_kana: '',
        guardian1_first_name_kana: '',
        guardian1_postal_code: '',
        guardian1_address: '',
        guardian1_address_detail: '',
        guardian1_phone: '',
        guardian1_relationship: '',
        guardian1_relationship_other: '',
        guardian1_email: '',
        has_chronic_illness: false,
        accommodation_notes: '',
        family_communication: '',
        chronic_illness_details: ''
    });

    useEffect(() => {
        if (user?.exam_no) {
            fetchProfile();
        }
    }, [user?.exam_no]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`/api/profiles/${user?.exam_no}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched profile data:', data); // デバッグ用
                setProfile(prev => ({
                    ...prev,
                    ...data
                }));
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    // シンプルで確実な入力処理関数
    const handleInput = (field: keyof StudentProfile, value: string) => {
        console.log('Input change:', field, value);
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveForm = async (step: FormStep, isComplete: boolean = false) => {
        if (!user?.exam_no) return;

        setSaving(true);
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
                setTimeout(() => setMessage(''), 3000);
                if (isComplete && step !== 'health') {
                    // 次のステップに進む
                    const steps: FormStep[] = ['personal', 'commute', 'art', 'health'];
                    const currentIndex = steps.indexOf(step);
                    if (currentIndex < steps.length - 1) {
                        setCurrentStep(steps[currentIndex + 1]);
                    }
                }
            } else {
                setMessage('保存に失敗しました');
            }
        } catch (error) {
            setMessage('エラーが発生しました');
        } finally {
            setSaving(false);
        }
    };

    const PersonalInfoForm = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">個人情報入力</h3>
            
            {/* 生徒基本情報 */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">生徒基本情報</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            生徒名前(姓) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={profile.student_last_name || ''}
                            onChange={(e) => handleInput('student_last_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            生徒名前(名) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={profile.student_first_name || ''}
                            onChange={(e) => handleInput('student_first_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            生徒名前(ふりがな)(姓)
                        </label>
                        <input
                            type="text"
                            value={profile.student_last_name_kana || ''}
                            onChange={(e) => handleInput('student_last_name_kana', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            生徒名前(ふりがな)(名)
                        </label>
                        <input
                            type="text"
                            value={profile.student_first_name_kana || ''}
                            onChange={(e) => handleInput('student_first_name_kana', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                        <select
                            value={profile.gender || ''}
                            onChange={(e) => handleInput('gender', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            onChange={(e) => handleInput('birth_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* 生徒現在住所 */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">生徒の現在住所</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label>
                        <input
                            type="text"
                            value={profile.student_postal_code || ''}
                            onChange={(e) => handleInput('student_postal_code', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="123-4567"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                        <input
                            type="text"
                            value={profile.student_address || ''}
                            onChange={(e) => handleInput('student_address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">番地・部屋番号</label>
                        <input
                            type="text"
                            value={profile.student_address_detail || ''}
                            onChange={(e) => handleInput('student_address_detail', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                        <input
                            type="tel"
                            value={profile.student_phone || ''}
                            onChange={(e) => handleInput('student_phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* 出身校情報 */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">出身校情報</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">出身中学校名</label>
                        <input
                            type="text"
                            value={profile.middle_school_name || ''}
                            onChange={(e) => handleInput('middle_school_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">卒業年月日</label>
                        <input
                            type="date"
                            value={profile.graduation_date || ''}
                            onChange={(e) => handleInput('graduation_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* 保護者1情報 */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">保護者1情報</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">保護者1名前(姓)</label>
                        <input
                            type="text"
                            value={profile.guardian1_last_name || ''}
                            onChange={(e) => handleInput('guardian1_last_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">保護者1名前(名)</label>
                        <input
                            type="text"
                            value={profile.guardian1_first_name || ''}
                            onChange={(e) => handleInput('guardian1_first_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">保護者1名前(ふりがな)(姓)</label>
                        <input
                            type="text"
                            value={profile.guardian1_last_name_kana || ''}
                            onChange={(e) => handleInput('guardian1_last_name_kana', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">保護者1名前(ふりがな)(名)</label>
                        <input
                            type="text"
                            value={profile.guardian1_first_name_kana || ''}
                            onChange={(e) => handleInput('guardian1_first_name_kana', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">保護者1現在住所(郵便番号)</label>
                        <input
                            type="text"
                            value={profile.guardian1_postal_code || ''}
                            onChange={(e) => handleInput('guardian1_postal_code', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">保護者1現在住所</label>
                        <input
                            type="text"
                            value={profile.guardian1_address || ''}
                            onChange={(e) => handleInput('guardian1_address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">保護者1現在住所(番地・部屋番号)</label>
                        <input
                            type="text"
                            value={profile.guardian1_address_detail || ''}
                            onChange={(e) => handleInput('guardian1_address_detail', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">保護者1電話番号</label>
                        <input
                            type="tel"
                            value={profile.guardian1_phone || ''}
                            onChange={(e) => handleInput('guardian1_phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">保護者1と生徒本人との関係</label>
                        <select
                            value={profile.guardian1_relationship || ''}
                            onChange={(e) => handleInput('guardian1_relationship', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">選択してください</option>
                            <option value="父">父</option>
                            <option value="母">母</option>
                            <option value="祖父">祖父</option>
                            <option value="祖母">祖母</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>
                    {profile.guardian1_relationship === 'その他' && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">保護者1と生徒本人との関係(その他の場合)</label>
                            <input
                                type="text"
                                value={profile.guardian1_relationship_other || ''}
                                onChange={(e) => handleInput('guardian1_relationship_other', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">保護者1メールアドレス</label>
                        <input
                            type="email"
                            value={profile.guardian1_email || ''}
                            onChange={(e) => handleInput('guardian1_email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => saveForm('personal', false)}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                    {saving ? '保存中...' : '一時保存'}
                </button>
                <button
                    onClick={() => saveForm('personal', true)}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? '保存中...' : '提出する'}
                </button>
            </div>
        </div>
    );

    const CommuteForm = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">通学方法</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">通学方法</label>
                        <select
                            value={profile.commute_method || ''}
                            onChange={(e) => handleInput('commute_method', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">選択してください</option>
                            <option value="交通機関利用">交通機関利用</option>
                            <option value="自転車">自転車</option>
                            <option value="徒歩">徒歩</option>
                        </select>
                    </div>
                </div>

                {/* JR */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">JR区間(始)</label>
                        <input
                            type="text"
                            value={profile.jr_start || ''}
                            onChange={(e) => handleInput('jr_start', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">JR区間(終)</label>
                        <input
                            type="text"
                            value={profile.jr_end || ''}
                            onChange={(e) => handleInput('jr_end', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* 神戸市営地下鉄（西神線） */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">神戸市営地下鉄（西神線）区間(始)</label>
                        <input
                            type="text"
                            value={profile.subway_nishin_start || ''}
                            onChange={(e) => handleInput('subway_nishin_start', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">神戸市営地下鉄（西神線）区間(終)</label>
                        <input
                            type="text"
                            value={profile.subway_nishin_end || ''}
                            onChange={(e) => handleInput('subway_nishin_end', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* その他の交通機関も同様に追加 */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">経由地</label>
                    <textarea
                        value={profile.via_station || ''}
                        onChange={(e) => handleInput('via_station', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                    />
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => setCurrentStep('personal')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                    戻る
                </button>
                <div className="space-x-2">
                    <button
                        onClick={() => saveForm('commute', false)}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                    >
                        {saving ? '保存中...' : '一時保存'}
                    </button>
                    <button
                        onClick={() => saveForm('commute', true)}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? '保存中...' : '提出する'}
                    </button>
                </div>
            </div>
        </div>
    );

    const ArtForm = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">芸術科目選択</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">芸術選択第１希望科目</label>
                        <select
                            value={profile.art_first_choice || ''}
                            onChange={(e) => handleInput('art_first_choice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            onChange={(e) => handleInput('art_second_choice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onClick={() => setCurrentStep('commute')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                    戻る
                </button>
                <div className="space-x-2">
                    <button
                        onClick={() => saveForm('art', false)}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                    >
                        {saving ? '保存中...' : '一時保存'}
                    </button>
                    <button
                        onClick={() => saveForm('art', true)}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? '保存中...' : '提出する'}
                    </button>
                </div>
            </div>
        </div>
    );

    const HealthForm = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">持病について</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">持病</label>
                        <select
                            value={profile.has_chronic_illness ? 'true' : 'false'}
                            onChange={(e) => handleInput('has_chronic_illness', e.target.value === 'true')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">選択してください</option>
                            <option value="true">あり</option>
                            <option value="false">なし</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">宿泊行事について学校へ伝えたいこと</label>
                        <textarea
                            value={profile.accommodation_notes || ''}
                            onChange={(e) => handleInput('accommodation_notes', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">学校生活について家庭からの連絡</label>
                        <textarea
                            value={profile.family_communication || ''}
                            onChange={(e) => handleInput('family_communication', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>
                    
                    {profile.has_chronic_illness && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">持病に当てはまるもの</label>
                            <textarea
                                value={profile.chronic_illness_details || ''}
                                onChange={(e) => handleInput('chronic_illness_details', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="心疾患、川崎病、リウマチ熱、腎臓疾患、肝臓疾患、糖尿病、てんかん、喘息、難聴、弱視、側湾症、色覚異常、アトピー性皮膚炎、発達障害、身体障害、食物アレルギー、薬剤アレルギー、怪我、その他"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => setCurrentStep('art')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                    戻る
                </button>
                <div className="space-x-2">
                    <button
                        onClick={() => saveForm('health', false)}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                    >
                        {saving ? '保存中...' : '一時保存'}
                    </button>
                    <button
                        onClick={() => saveForm('health', true)}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                        {saving ? '保存中...' : 'すべてのフォームを提出完了です'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderCurrentForm = () => {
        switch (currentStep) {
            case 'personal':
                return <PersonalInfoForm />;
            case 'commute':
                return <CommuteForm />;
            case 'art':
                return <ArtForm />;
            case 'health':
                return <HealthForm />;
            default:
                return <PersonalInfoForm />;
        }
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">プロフィール入力</h2>
                <p className="mt-1 text-sm text-gray-600">段階的に情報を入力してください</p>
            </div>

            {/* 進捗インジケーター */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    {['personal', 'commute', 'art', 'health'].map((step, index) => (
                        <div key={step} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                currentStep === step 
                                    ? 'bg-blue-600 text-white' 
                                    : index < ['personal', 'commute', 'art', 'health'].indexOf(currentStep)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-300 text-gray-600'
                            }`}>
                                {index + 1}
                            </div>
                            {index < 3 && (
                                <div className={`w-16 h-1 mx-2 ${
                                    index < ['personal', 'commute', 'art', 'health'].indexOf(currentStep)
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>個人情報</span>
                    <span>通学方法</span>
                    <span>芸術選択</span>
                    <span>健康情報</span>
                </div>
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

            {renderCurrentForm()}
        </div>
    );
};

export default ProfileFormView;
