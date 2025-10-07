import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, ArrowLeft, TrendingDown, Target, Clock } from "lucide-react";
import { getRecordsByUser, Record } from "../lib/firestore";
import { auth } from "../lib/firebase";

interface MonthlyData {
  month: string;
  reviews: number;
}

interface StatsDetailPageProps {
  onBack: () => void;
}

export function StatsDetailPage({ onBack }: StatsDetailPageProps) {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [monthlyAverage, setMonthlyAverage] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);
  const [insights, setInsights] = useState({
    hasGrowth: false,
    hasDecline: false,
    isConsistent: false,
    growthText: '',
    declineText: '',
    consistencyText: ''
  });

  useEffect(() => {
    loadDetailedStats();
  }, []);

  const loadDetailedStats = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const { data, error } = await getRecordsByUser(auth.currentUser.uid);

      if (error || !data) {
        console.error('Failed to load stats:', error);
        setLoading(false);
        return;
      }

      calculateDetailedStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDetailedStats = (data: Record[]) => {
    setTotalRecords(data.length);

    // 월별 데이터 (최근 6개월)
    const monthlyMap = new Map<string, number>();
    const now = new Date();

    // 최근 6개월 초기화
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, 0);
    }

    // 데이터 집계
    data.forEach(record => {
      if (record.created_at) {
        const date = record.created_at.toDate();
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap.has(key)) {
          monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
        }
      }
    });

    // 월별 데이터 생성
    const monthly: MonthlyData[] = [];
    monthlyMap.forEach((count, key) => {
      const [year, month] = key.split('-');
      monthly.push({
        month: `${parseInt(month)}월`,
        reviews: count
      });
    });

    setMonthlyData(monthly);

    // 월평균
    const total = monthly.reduce((sum, m) => sum + m.reviews, 0);
    const average = monthly.length > 0 ? total / monthly.length : 0;
    setMonthlyAverage(Math.round(average * 10) / 10);

    // 성장률 계산
    if (monthly.length >= 2) {
      const lastMonth = monthly[monthly.length - 1]?.reviews || 0;
      const prevMonth = monthly[monthly.length - 2]?.reviews || 0;
      if (prevMonth > 0) {
        const rate = ((lastMonth - prevMonth) / prevMonth) * 100;
        setGrowthRate(Math.round(rate * 10) / 10);
      }
    }

    // 인사이트 생성
    generateInsights(monthly);
  };

  const generateInsights = (monthly: MonthlyData[]) => {
    if (monthly.length < 3) {
      setInsights({
        hasGrowth: false,
        hasDecline: false,
        isConsistent: false,
        growthText: '',
        declineText: '',
        consistencyText: '데이터가 충분하지 않습니다.'
      });
      return;
    }

    // 성장 추세 확인 (앞 3개월과 뒤 3개월 비교)
    const firstHalf = monthly.slice(0, 3).reduce((sum, m) => sum + m.reviews, 0) / 3;
    const secondHalf = monthly.slice(-3).reduce((sum, m) => sum + m.reviews, 0) / 3;
    const hasGrowth = secondHalf > firstHalf * 1.1; // 10% 이상 증가

    // 최근 감소 확인
    const lastMonth = monthly[monthly.length - 1]?.reviews || 0;
    const prevMonth = monthly[monthly.length - 2]?.reviews || 0;
    const hasDecline = lastMonth < prevMonth;

    // 일관성 확인 (매월 최소 1개 이상)
    const isConsistent = monthly.every(m => m.reviews > 0);

    const growthText = hasGrowth
      ? `최근 3개월간 꾸준한 증가세를 보이고 있습니다. 처음 3개월 평균 ${firstHalf.toFixed(1)}개에서 최근 3개월 평균 ${secondHalf.toFixed(1)}개로 증가했습니다.`
      : '';

    const declineText = hasDecline
      ? `이번 달은 ${prevMonth}개에서 ${lastMonth}개로 감소했습니다. 지속적인 기록을 위해 다시 힘내보세요!`
      : '';

    const consistencyText = isConsistent
      ? `매월 꾸준히 리뷰를 작성하고 있어 훌륭한 기록 습관을 유지하고 있습니다.`
      : '일부 기간에 리뷰가 작성되지 않았습니다. 꾸준한 기록을 목표로 해보세요.';

    setInsights({
      hasGrowth,
      hasDecline,
      isConsistent,
      growthText,
      declineText,
      consistencyText
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="p-4 border-b border-gray-200 bg-card">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft size={20} />
            </button>
            <h1>월별 리뷰 변화 상세</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">통계 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-card">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft size={20} />
          </button>
          <h1>월별 리뷰 변화 상세</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        
        {/* Monthly Trend Chart */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              월별 리뷰 변화
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reviews" 
                    stroke="#5E7F19" 
                    strokeWidth={3}
                    dot={{ fill: '#5E7F19', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {monthlyData.length >= 2 && (
              <div className={`mt-4 p-3 rounded-lg border ${
                growthRate > 0
                  ? 'bg-green-50 border-green-100'
                  : growthRate < 0
                  ? 'bg-red-50 border-red-100'
                  : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">지난달 대비</span>
                  <span className={`text-sm font-medium ${
                    growthRate > 0
                      ? 'text-green-600'
                      : growthRate < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}>
                    {growthRate > 0 ? '+' : ''}{growthRate}% {growthRate > 0 ? '증가' : growthRate < 0 ? '감소' : '동일'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights Section */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target size={20} />
              인사이트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Growth Pattern */}
            {insights.hasGrowth && insights.growthText && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-green-800 mb-1">꾸준한 성장세</h4>
                    <p className="text-sm text-green-700">
                      {insights.growthText}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Slight Decline */}
            {insights.hasDecline && insights.declineText && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <TrendingDown size={16} className="text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-yellow-800 mb-1">최근 감소</h4>
                    <p className="text-sm text-yellow-700">
                      {insights.declineText}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Consistency */}
            <div className={`p-4 rounded-lg border ${
              insights.isConsistent
                ? 'bg-blue-50 border-blue-100'
                : 'bg-gray-50 border-gray-100'
            }`}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  insights.isConsistent ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Clock size={16} className={insights.isConsistent ? 'text-blue-600' : 'text-gray-600'} />
                </div>
                <div className="flex-1">
                  <h4 className={insights.isConsistent ? 'text-blue-800 mb-1' : 'text-gray-800 mb-1'}>
                    {insights.isConsistent ? '일관성 있는 기록' : '기록 일관성'}
                  </h4>
                  <p className={`text-sm ${insights.isConsistent ? 'text-blue-700' : 'text-gray-700'}`}>
                    {insights.consistencyText}
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Average */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{monthlyAverage}</div>
                <div className="text-sm text-gray-600">월평균 리뷰</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalRecords}</div>
                <div className="text-sm text-gray-600">총 리뷰 수</div>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}