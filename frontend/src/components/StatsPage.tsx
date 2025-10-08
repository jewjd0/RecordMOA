import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid, ComposedChart } from "recharts";
import { TrendingUp, Calendar, Star } from "lucide-react";
import { getRecordsByUser, Record } from "../lib/firestore";
import { auth } from "../lib/firebase";

interface StatsPageProps {
  onShowDetail?: () => void;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  count: number;
}

interface MonthlyData {
  month: string;
  reviews: number;
  avgRating?: number;
}

interface CategoryStats {
  name: string;
  count: number;
  avgRating: number;
  color: string;
}

export function StatsPage({ onShowDetail }: StatsPageProps) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [topCategory, setTopCategory] = useState('');
  const [lastReviewDate, setLastReviewDate] = useState('');
  const [highestRated, setHighestRated] = useState<Record | null>(null);
  const [lowestRated, setLowestRated] = useState<Record | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const { data, error } = await getRecordsByUser(auth.currentUser.uid);

      if (error || !data) {
        console.error('Failed to load stats:', error);
        setLoading(false);
        return;
      }

      setRecords(data);
      calculateStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Record[]) => {
    if (!data || data.length === 0) {
      setTotalRecords(0);
      setAvgRating(0);
      setTopCategory('없음');
      setLastReviewDate('없음');
      setCategoryData([
        { name: '영상', value: 0, color: '#5E7F19', count: 0 },
        { name: '도서', value: 0, color: '#8AA83A', count: 0 },
        { name: '장소', value: 0, color: '#B5CC5C', count: 0 }
      ]);
      setMonthlyData([]);
      return;
    }

    // 총 리뷰 수
    setTotalRecords(data.length);

    // 평균 별점
    const totalRating = data.reduce((sum, record) => sum + record.rating, 0);
    setAvgRating(Math.round((totalRating / data.length) * 10) / 10);

    // 카테고리별 분포
    const movieCount = data.filter(r => r.category === 'movie').length;
    const bookCount = data.filter(r => r.category === 'book').length;
    const placeCount = data.filter(r => r.category === 'place').length;

    const total = data.length;
    const categories: CategoryData[] = [
      {
        name: '영상',
        value: total > 0 ? Math.round((movieCount / total) * 100) : 0,
        color: '#5E7F19',
        count: movieCount
      },
      {
        name: '도서',
        value: total > 0 ? Math.round((bookCount / total) * 100) : 0,
        color: '#8AA83A',
        count: bookCount
      },
      {
        name: '장소',
        value: total > 0 ? Math.round((placeCount / total) * 100) : 0,
        color: '#B5CC5C',
        count: placeCount
      }
    ];

    setCategoryData(categories);

    // 인기 카테고리
    const maxCategory = categories.reduce((prev, current) =>
      current.count > prev.count ? current : prev
    );
    setTopCategory(maxCategory.name);

    // 최근 리뷰 날짜
    if (data.length > 0) {
      const sortedData = [...data].sort((a, b) => {
        const aTime = a.created_at?.toMillis() || 0;
        const bTime = b.created_at?.toMillis() || 0;
        return bTime - aTime;
      });
      const lastReview = sortedData[0];
      const daysAgo = Math.floor((Date.now() - lastReview.created_at.toMillis()) / (1000 * 60 * 60 * 24));
      if (daysAgo === 0) setLastReviewDate('오늘');
      else if (daysAgo === 1) setLastReviewDate('어제');
      else setLastReviewDate(`${daysAgo}일 전`);
    }

    // 카테고리별 통계 (평균 별점 포함)
    const movieRecords = data.filter(r => r.category === 'movie');
    const bookRecords = data.filter(r => r.category === 'book');
    const placeRecords = data.filter(r => r.category === 'place');

    const categoryStatsData: CategoryStats[] = [
      {
        name: '영상',
        count: movieRecords.length,
        avgRating: movieRecords.length > 0
          ? Math.round((movieRecords.reduce((sum, r) => sum + r.rating, 0) / movieRecords.length) * 10) / 10
          : 0,
        color: '#5E7F19'
      },
      {
        name: '도서',
        count: bookRecords.length,
        avgRating: bookRecords.length > 0
          ? Math.round((bookRecords.reduce((sum, r) => sum + r.rating, 0) / bookRecords.length) * 10) / 10
          : 0,
        color: '#8AA83A'
      },
      {
        name: '장소',
        count: placeRecords.length,
        avgRating: placeRecords.length > 0
          ? Math.round((placeRecords.reduce((sum, r) => sum + r.rating, 0) / placeRecords.length) * 10) / 10
          : 0,
        color: '#B5CC5C'
      }
    ];

    setCategoryStats(categoryStatsData);

    // 최고/최저 별점 기록
    const sortedByRating = [...data].sort((a, b) => b.rating - a.rating);
    if (sortedByRating.length > 0) {
      setHighestRated(sortedByRating[0]);
      setLowestRated(sortedByRating[sortedByRating.length - 1]);
    }

    // 월별 데이터 (최근 6개월) - 리뷰 수 + 평균 별점
    const monthlyMap = new Map<string, { count: number; totalRating: number }>();
    const now = new Date();

    // 최근 6개월 초기화
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, { count: 0, totalRating: 0 });
    }

    // 데이터 집계
    data.forEach(record => {
      if (record.created_at) {
        const date = record.created_at.toDate();
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap.has(key)) {
          const current = monthlyMap.get(key)!;
          monthlyMap.set(key, {
            count: current.count + 1,
            totalRating: current.totalRating + record.rating
          });
        }
      }
    });

    // 월별 데이터 생성
    const monthly: MonthlyData[] = [];
    monthlyMap.forEach((value, key) => {
      const [year, month] = key.split('-');
      monthly.push({
        month: `${parseInt(month)}월`,
        reviews: value.count,
        avgRating: value.count > 0 ? Math.round((value.totalRating / value.count) * 10) / 10 : 0
      });
    });

    setMonthlyData(monthly);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-card">
          <h1 className="text-center">통계</h1>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Category Distribution Chart */}
          <Card className="border-gray-200">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-lg" />
            </CardContent>
          </Card>

          {/* Monthly Trend Chart */}
          <Card className="border-gray-200">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-card">
        <h1 className="text-center">통계</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">

        {/* Summary */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Calendar size={20} />
              전체 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-primary">{totalRecords}</div>
                <div className="text-xs text-gray-600">전체 리뷰</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-primary">{topCategory}</div>
                <div className="text-xs text-gray-600">인기 카테고리</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg col-span-2 md:col-span-1">
                <div className="text-xl md:text-2xl font-bold text-primary">{lastReviewDate}</div>
                <div className="text-xs text-gray-600">최근 리뷰</div>
              </div>
            </div>
            <div className="text-center p-3 bg-[#5E7F19]/10 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-[#5E7F19]">⭐ {avgRating}</div>
              <div className="text-xs text-gray-600">평균 별점</div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Star size={20} />
              카테고리별 비율
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalRecords > 0 ? (
              <>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData.filter(c => c.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {categoryData.filter(c => c.count > 0).map((entry, index) => (
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
                        {item.name} {item.count}개 ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                아직 기록이 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Average Ratings */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Star size={20} />
              카테고리별 평균 별점
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length > 0 && totalRecords > 0 ? (
              <div className="space-y-3">
                {categoryStats.filter(c => c.count > 0).map((category, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm font-bold" style={{ color: category.color }}>
                        ⭐ {category.avgRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(category.avgRating / 5) * 100}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                아직 기록이 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        {/* Highest & Lowest Rated */}
        {highestRated && lowestRated && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Highest Rated */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Star size={20} className="text-yellow-500" />
                  최고 평점
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="text-xl font-bold text-yellow-600">{highestRated.rating}</span>
                  </div>
                  <h3 className="font-semibold truncate">{highestRated.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{highestRated.review}</p>
                </div>
              </CardContent>
            </Card>

            {/* Lowest Rated */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Star size={20} className="text-gray-400" />
                  최저 평점
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="text-xl font-bold text-gray-600">{lowestRated.rating}</span>
                  </div>
                  <h3 className="font-semibold truncate">{lowestRated.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{lowestRated.review}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Monthly Trend */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base md:text-lg">
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
            {monthlyData.length > 0 && totalRecords > 0 ? (
              <>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                      />
                      <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                        label={{ value: '리뷰 수', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#666' }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                        domain={[0, 5]}
                        label={{ value: '평균 별점', angle: 90, position: 'insideRight', fontSize: 12, fill: '#666' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="reviews"
                        fill="#5E7F19"
                        radius={[4, 4, 0, 0]}
                        name="리뷰 수"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgRating"
                        stroke="#FFB800"
                        strokeWidth={3}
                        dot={{ fill: '#FFB800', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7 }}
                        name="평균 별점"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                {monthlyData.length >= 2 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">지난달 대비</span>
                      <span className="text-sm font-medium text-gray-600">
                        {(() => {
                          const lastMonth = monthlyData[monthlyData.length - 1]?.reviews || 0;
                          const prevMonth = monthlyData[monthlyData.length - 2]?.reviews || 0;
                          if (prevMonth === 0) return '데이터 없음';
                          const change = ((lastMonth - prevMonth) / prevMonth) * 100;
                          const isPositive = change > 0;
                          return (
                            <span className={isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}>
                              {isPositive ? '+' : ''}{change.toFixed(1)}% {isPositive ? '증가' : change < 0 ? '감소' : '동일'}
                            </span>
                          );
                        })()}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                아직 기록이 없습니다
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}