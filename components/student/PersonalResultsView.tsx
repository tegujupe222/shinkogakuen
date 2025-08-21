import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface StudentResult {
    id: string;
    exam_no: string;
    name: string;
    application_type: string;
    gender: string;
    middle_school: string;
    recommendation: string;
    club_recommendation: string;
    accepted_course: string;
    top_10_percent: string;
    special_advance_top5: string;
    advance_top5: string;
    club_tuition_exemption: boolean;
    club_fee_exemption: boolean;
    club_scholarship: boolean;
    scholarship_student: string;
    created_at: string;
    updated_at: string;
}

const PersonalResultsView: React.FC = () => {
    const { user } = useAuth();
    const [result, setResult] = useState<StudentResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPersonalResult = async () => {
            if (!user?.exam_no) {
                setLoading(false);
                setError('ログイン情報が見つかりません');
                return;
            }

            try {
                const response = await fetch(`/api/results/${user.exam_no}`);
                
                if (response.ok) {
                    const data = await response.json();
                    setResult(data);
                } else if (response.status === 404) {
                    setError('個人結果が見つかりません');
                } else {
                    setError('個人結果の取得に失敗しました');
                }
            } catch (error) {
                console.error('Failed to fetch personal result:', error);
                setError('個人結果の取得中にエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };

        fetchPersonalResult();
    }, [user?.exam_no]);

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

    if (error) {
        return (
            <div className="p-4 sm:p-6">
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">個別お知らせが見つかりません</h3>
                    <p className="text-gray-600 mb-4">
                        {error}
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                            個別お知らせは後日アップロードされます。しばらくお待ちください。
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="p-4 sm:p-6">
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">個別お知らせが見つかりません</h3>
                    <p className="text-gray-600 mb-4">
                        あなたの個別お知らせはまだ準備中です。
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                            個別お知らせは後日アップロードされます。しばらくお待ちください。
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">個別お知らせ</h2>
                <p className="mt-1 text-sm text-gray-600">あなたの合格結果と特典情報</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4 sm:p-6">
                    {/* 出願種別 */}
                    {result.application_type && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">出願種別</h3>
                            <div className={`inline-block px-4 py-2 rounded-lg font-bold text-white ${
                                result.application_type === '専願' 
                                    ? 'bg-blue-600' 
                                    : 'bg-red-600'
                            }`}>
                                {result.application_type}
                            </div>
                        </div>
                    )}

                    {/* 基本情報 */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">受験番号</p>
                                <p className="font-medium">{result.exam_no}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">氏名</p>
                                <p className="font-medium">{result.name}</p>
                            </div>
                            {result.gender && (
                                <div>
                                    <p className="text-sm text-gray-600">性別</p>
                                    <p className="font-medium">{result.gender}</p>
                                </div>
                            )}
                            {result.middle_school && (
                                <div>
                                    <p className="text-sm text-gray-600">中学校名</p>
                                    <p className="font-medium">{result.middle_school}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 合格コース */}
                    {result.accepted_course && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">合格コース</h3>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-800 font-medium">{result.accepted_course}</p>
                            </div>
                        </div>
                    )}

                    {/* 推薦・特典情報 */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">推薦・特典情報</h3>
                        <div className="space-y-3">
                            {result.recommendation && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-blue-800 text-sm font-medium">推薦</p>
                                    <p className="text-blue-900">{result.recommendation}</p>
                                </div>
                            )}
                            {result.club_recommendation && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-purple-800 text-sm font-medium">部活動推薦</p>
                                    <p className="text-purple-900">{result.club_recommendation}</p>
                                </div>
                            )}
                            {result.scholarship_student && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-yellow-800 text-sm font-medium">特待生</p>
                                    <p className="text-yellow-900">{result.scholarship_student}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 成績・ランキング情報 */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">成績・ランキング情報</h3>
                        <div className="space-y-3">
                            {result.top_10_percent && (
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                                    <p className="text-indigo-800 text-sm font-medium">3教科上位10%</p>
                                    <p className="text-indigo-900">{result.top_10_percent}</p>
                                </div>
                            )}
                            {result.special_advance_top5 && (
                                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                                    <p className="text-pink-800 text-sm font-medium">特進上位5名</p>
                                    <p className="text-pink-900">{result.special_advance_top5}</p>
                                </div>
                            )}
                            {result.advance_top5 && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <p className="text-orange-800 text-sm font-medium">進学上位5名</p>
                                    <p className="text-orange-900">{result.advance_top5}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 部活動推薦特典 */}
                    {(result.club_tuition_exemption || result.club_fee_exemption || result.club_scholarship) && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">部活動推薦特典</h3>
                            <div className="space-y-2">
                                {result.club_tuition_exemption && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-green-800 font-medium">✅ 部活動推薦入学金免除</p>
                                    </div>
                                )}
                                {result.club_fee_exemption && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-green-800 font-medium">✅ 部活動推薦諸費用免除</p>
                                    </div>
                                )}
                                {result.club_scholarship && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-green-800 font-medium">✅ 部活動推薦奨学金支給</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 更新日時 */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            最終更新: {new Date(result.updated_at).toLocaleString('ja-JP')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalResultsView;
