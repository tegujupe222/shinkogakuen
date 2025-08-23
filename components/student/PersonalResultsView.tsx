import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StudentResult } from '../../types';

const PersonalResultsView: React.FC = () => {
    const { user } = useAuth();
    const [personalResult, setPersonalResult] = useState<StudentResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.exam_no) {
            fetchPersonalResult();
        }
    }, [user]);

    const fetchPersonalResult = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/results/${user?.exam_no}`);
            const data = await response.json();

            if (response.ok && data.success) {
                setPersonalResult(data.result);
            } else {
                setError('個人結果が見つかりません');
            }
        } catch (error) {
            setError('個人結果の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">個人結果を読み込み中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">{error}</p>
                </div>
            </div>
        );
    }

    if (!personalResult) {
        return (
            <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">個人結果はまだ公開されていません。</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">個人結果</h2>
                <p className="text-gray-600">あなたの受験結果をお知らせします</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* 基本情報 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">基本情報</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">学生ID</label>
                            <p className="text-gray-900">{personalResult.student_id || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">受験番号</label>
                            <p className="text-gray-900">{personalResult.exam_no}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
                            <p className="text-gray-900">{personalResult.name || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                            <p className="text-gray-900">{personalResult.gender || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* 出願情報 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">出願情報</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">出願種別</label>
                            <p className="text-gray-900">
                                {personalResult.application_type ? (
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${
                                        personalResult.application_type === '専願' 
                                            ? 'bg-blue-600' 
                                            : 'bg-red-600'
                                    }`}>
                                        {personalResult.application_type}
                                    </span>
                                ) : '-'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">出願時コース</label>
                            <p className="text-gray-900">{personalResult.application_course || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">中学校名</label>
                            <p className="text-gray-900">{personalResult.middle_school || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">推薦</label>
                            <p className="text-gray-900">{personalResult.recommendation || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* 合格結果 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">合格結果</h3>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">合格コース</label>
                        <div className="text-lg">
                            {personalResult.accepted_course ? (
                                personalResult.application_course && personalResult.accepted_course !== personalResult.application_course ? (
                                    <span className="text-orange-600 font-medium">廻し合格: {personalResult.accepted_course}</span>
                                ) : (
                                    <span className="text-green-600 font-medium">{personalResult.accepted_course}</span>
                                )
                            ) : personalResult.application_course ? (
                                <span className="text-red-600 font-medium">不合格</span>
                            ) : (
                                <span className="text-gray-500">結果未発表</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 特典・奨学金情報 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">特典・奨学金情報</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">特待生</label>
                            <p className="text-gray-900">{personalResult.scholarship_student || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">3教科上位10%</label>
                            <p className="text-gray-900">{personalResult.top_10_percent || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">特進上位5名</label>
                            <p className="text-gray-900">{personalResult.special_advance_top5 || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">進学上位5名</label>
                            <p className="text-gray-900">{personalResult.advance_top5 || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* 部活動推薦情報 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">部活動推薦情報</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦表記</label>
                            <p className="text-gray-900">{personalResult.club_recommendation || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦入学金免除</label>
                            <p className="text-gray-900">{personalResult.club_tuition_exemption || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦諸費用免除</label>
                            <p className="text-gray-900">{personalResult.club_fee_exemption || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">部活動推薦奨学金支給</label>
                            <p className="text-gray-900">{personalResult.club_scholarship || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={fetchPersonalResult}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    最新情報に更新
                </button>
            </div>
        </div>
    );
};

export default PersonalResultsView;
