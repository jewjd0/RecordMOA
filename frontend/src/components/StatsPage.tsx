import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, Star } from "lucide-react";

interface StatsPageProps {
  onShowDetail?: () => void;
}

const categoryData = [
  { name: '영상', value: 45, color: '#5E7F19' },
  { name: '도서', value: 30, color: '#8AA83A' },
  { name: '장소', value: 25, color: '#B5CC5C' }
];

const monthlyData = [
  { month: '1월', reviews: 8 },
  { month: '2월', reviews: 12 },
  { month: '3월', reviews: 15 },
  { month: '4월', reviews: 18 },
  { month: '5월', reviews: 22 },
  { month: '6월', reviews: 20 }
];

export function StatsPage({ onShowDetail }: StatsPageProps) {
  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-card">
        <h1 className="text-center">통계</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        
        {/* This Week Summary */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              이번 주 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-xs text-gray-600">전체 리뷰</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">영상</div>
                <div className="text-xs text-gray-600">인기 카테고리</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">어제</div>
                <div className="text-xs text-gray-600">최근 리뷰</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Star size={20} />
              카테고리별 비율
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name} {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} />
                월별 리뷰 변화
              </div>
              <button 
                onClick={onShowDetail}
                className="text-sm text-primary hover:underline"
              >
                자세히 보기
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
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
                    strokeWidth={2}
                    dot={{ fill: '#5E7F19', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">지난달 대비</span>
                <span className="text-sm font-medium text-green-600">+18% 증가</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}