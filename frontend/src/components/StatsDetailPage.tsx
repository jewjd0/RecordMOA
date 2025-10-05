import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, ArrowLeft, TrendingDown, Target, Clock } from "lucide-react";

const monthlyData = [
  { month: '1월', reviews: 8 },
  { month: '2월', reviews: 12 },
  { month: '3월', reviews: 15 },
  { month: '4월', reviews: 18 },
  { month: '5월', reviews: 22 },
  { month: '6월', reviews: 20 }
];

interface StatsDetailPageProps {
  onBack: () => void;
}

export function StatsDetailPage({ onBack }: StatsDetailPageProps) {
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
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">지난달 대비</span>
                <span className="text-sm font-medium text-green-600">+18% 증가</span>
              </div>
            </div>
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
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp size={16} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-green-800 mb-1">꾸준한 성장세</h4>
                  <p className="text-sm text-green-700">
                    1월부터 5월까지 지속적으로 리뷰 작성이 증가하고 있습니다. 
                    특히 4-5월에 가장 높은 증가율을 보였습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Slight Decline */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TrendingDown size={16} className="text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-yellow-800 mb-1">6월 소폭 감소</h4>
                  <p className="text-sm text-yellow-700">
                    6월에는 22개에서 20개로 소폭 감소했습니다. 
                    여름 휴가철의 영향일 수 있으니 7-8월 패턴을 지켜볼 필요가 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Consistency */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock size={16} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-blue-800 mb-1">일관성 있는 기록</h4>
                  <p className="text-sm text-blue-700">
                    매월 최소 8개 이상의 리뷰를 꾸준히 작성하고 있어 
                    훌륭한 기록 습관을 유지하고 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Average */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">15.8</div>
                <div className="text-sm text-gray-600">월평균 리뷰</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">95</div>
                <div className="text-sm text-gray-600">총 리뷰 수</div>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}