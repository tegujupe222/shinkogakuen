import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AdmissionFeeSettings, AdmissionFeeExemption, StudentResult } from '../../types';

const AdmissionFeeView: React.FC = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<AdmissionFeeSettings | null>(null);
    const [exemptions, setExemptions] = useState<AdmissionFeeExemption[]>([]);
    const [studentResult, setStudentResult] = useState<StudentResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.exam_no) {
            fetchData();
        }
    }, [user?.exam_no]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [settingsResponse, exemptionsResponse, resultResponse] = await Promise.all([
                fetch('/api/admission-fee-settings'),
                fetch('/api/admission-fee-exemptions'),
                fetch(`/api/results/${user?.exam_no}`)
            ]);

            if (settingsResponse.ok) {
                const settingsData = await settingsResponse.json();
                setSettings(settingsData.settings);
            }

            if (exemptionsResponse.ok) {
                const exemptionsData = await exemptionsResponse.json();
                setExemptions(exemptionsData.exemptions);
            }

            if (resultResponse.ok) {
                const resultData = await resultResponse.json();
                if (resultData.success && resultData.result) {
                    setStudentResult(resultData.result);
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
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

    const getApplicationType = () => {
        if (!studentResult) return 'unknown';
        return studentResult.application_type?.includes('専願') ? 'dedicated' : 'combined';
    };

    const getDeadline = () => {
        if (!settings) return null;
        const applicationType = getApplicationType();
        return applicationType === 'dedicated' ? settings.dedicated_deadline : settings.combined_deadline;
    };

    const getTotalAmount = () => {
        if (!settings) return 0;
        return settings.admission_fee + settings.miscellaneous_fee + settings.grade_fee;
    };

    const getApplicableExemptions = () => {
        if (!studentResult) return [];
        
        // 学生の結果に基づいて適用可能な免除を判定
        const applicableExemptions: AdmissionFeeExemption[] = [];
        
        exemptions.forEach(exemption => {
            // 特待生の場合
            if (exemption.exemption_name.includes('特待生') && studentResult.scholarship_student === '特待生') {
                applicableExemptions.push(exemption);
            }
            // 部活動推薦の場合
            if (exemption.exemption_name.includes('部活動推薦') && studentResult.club_recommendation) {
                applicableExemptions.push(exemption);
            }
            // その他の免除条件に応じて判定
            // ここに追加の判定ロジックを実装
        });
        
        return applicableExemptions;
    };

    const getFinalAmount = () => {
        const totalAmount = getTotalAmount();
        const applicableExemptions = getApplicableExemptions();
        const exemptionAmount = applicableExemptions.reduce((sum, exemption) => sum + exemption.exemption_amount, 0);
        return Math.max(0, totalAmount - exemptionAmount);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">入学手続金情報を読み込み中...</p>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <p className="text-gray-500">入学手続金情報が設定されていません</p>
                </div>
            </div>
        );
    }

    const deadline = getDeadline();
    const totalAmount = getTotalAmount();
    const applicableExemptions = getApplicableExemptions();
    const finalAmount = getFinalAmount();
    const applicationType = getApplicationType();

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">入学手続金お知らせ</h2>
                <p className="text-gray-600">入学手続金の詳細をご確認ください</p>
            </div>

            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">手続金内訳</h3>
                <div className="space-y-3">
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
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                        <span>計</span>
                        <span>{formatCurrency(totalAmount)}円</span>
                    </div>
                </div>
            </div>

            {/* 免除情報 */}
            {applicableExemptions.length > 0 && (
                <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">適用免除</h3>
                    <div className="space-y-3">
                        {applicableExemptions.map((exemption) => (
                            <div key={exemption.id} className="flex justify-between">
                                <span className="text-green-800">{exemption.exemption_name}</span>
                                <span className="font-medium text-green-800">-{formatCurrency(exemption.exemption_amount)}円</span>
                            </div>
                        ))}
                        <div className="border-t border-green-300 pt-3 flex justify-between font-bold text-lg text-green-900">
                            <span>最終支払額</span>
                            <span>{formatCurrency(finalAmount)}円</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 振込期日 */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">振込期日</h3>
                <div className="space-y-2">
                    <div>
                        <span className="font-medium text-blue-800">出願種別:</span>
                        <span className="ml-2 text-blue-800">
                            {applicationType === 'dedicated' ? '専願' : '併願'}
                        </span>
                    </div>
                    {deadline && (
                        <div>
                            <span className="font-medium text-blue-800">振込期日:</span>
                            <span className="ml-2 text-blue-800 font-bold">{formatDate(deadline)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">注意事項</h3>
                {settings?.notes ? (
                    <div className="space-y-2 text-yellow-800">
                        {settings.notes.split('\n').map((note, index) => (
                            <div key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{note.trim()}</span>
                            </div>
                        ))}
                        {applicableExemptions.length > 0 && (
                            <div className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>免除が適用されている場合は、免除後の金額をお振込みください</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <ul className="space-y-2 text-yellow-800">
                        <li>• 振込期日までに指定口座にお振込みください</li>
                        <li>• 振込手数料はご負担ください</li>
                        <li>• 振込人名義は保護者名でお願いします</li>
                        <li>• 振込完了後、振込控えを学校までご提出ください</li>
                        {applicableExemptions.length > 0 && (
                            <li>• 免除が適用されている場合は、免除後の金額をお振込みください</li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdmissionFeeView;
