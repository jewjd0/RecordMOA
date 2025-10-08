import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Plus, Film, Book, MapPin, Search, X, ArrowUpDown, Calendar } from "lucide-react";
import { getRecordsByUser, Record } from "../lib/firestore";
import { auth } from "../lib/firebase";
import { getThumbnailUrl } from "../lib/cloudinary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface RecordsListPageProps {
  onWriteReview: () => void;
  onViewDetail: (recordId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'title-asc' | 'title-desc';
type DateRangeOption = 'all' | '1month' | '3months' | '6months' | '1year';

export function RecordsListPage({ onWriteReview, onViewDetail }: RecordsListPageProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const recordsPerPage = 10;

  useEffect(() => {
    fetchRecords();
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  }, [activeFilter]);

  const fetchRecords = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const category = activeFilter === 'all' ? undefined : activeFilter;
    const { data, error: fetchError } = await getRecordsByUser(user.uid, category);

    if (fetchError) {
      console.error('Firestore fetch error:', fetchError);
      setError(`데이터를 불러오는 중 오류가 발생했습니다: ${fetchError}`);
    } else if (data) {
      setRecords(data);
    }

    setLoading(false);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'movie': return <Film size={20} className="text-gray-600" />;
      case 'book': return <Book size={20} className="text-gray-600" />;
      case 'place': return <MapPin size={20} className="text-gray-600" />;
      default: return null;
    }
  };

  const filterButtons = [
    { id: 'all', label: '전체' },
    { id: 'movie', label: '영상' },
    { id: 'book', label: '도서' },
    { id: 'place', label: '장소' }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }, (_, i) => (
      <span key={i} className="text-yellow-400">
        ⭐
      </span>
    ));
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').slice(0, -1);
  };

  const getPreview = (record: Record) => {
    return record.review.length > 50 ? record.review.substring(0, 50) + '...' : record.review;
  };

  // 날짜 범위 필터링 로직
  const filterRecordsByDateRange = (records: Record[]) => {
    if (dateRange === 'all') return records;

    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        return records;
    }

    return records.filter((record) => {
      if (!record.created_at) return false;
      const recordDate = record.created_at.toDate();
      return recordDate >= startDate;
    });
  };

  // 검색 필터링 로직
  const filterRecordsBySearch = (records: Record[]) => {
    if (!searchQuery.trim()) return records;

    const query = searchQuery.toLowerCase().trim();
    return records.filter((record) => {
      // 제목 검색
      if (record.title.toLowerCase().includes(query)) return true;

      // 카테고리별 추가 필드 검색
      if (record.category === 'movie') {
        // 영화: 감독, 출연자
        if (record.director?.toLowerCase().includes(query)) return true;
        // cast는 배열이므로 배열을 문자열로 변환하여 검색
        if (Array.isArray(record.cast)) {
          const castString = record.cast.join(' ').toLowerCase();
          if (castString.includes(query)) return true;
        }
      } else if (record.category === 'book') {
        // 도서: 저자, 출판사
        if (record.author?.toLowerCase().includes(query)) return true;
        if (record.publisher?.toLowerCase().includes(query)) return true;
      } else if (record.category === 'place') {
        // 장소: 위치
        if (record.location?.toLowerCase().includes(query)) return true;
      }

      // 리뷰 내용 검색
      if (record.review.toLowerCase().includes(query)) return true;

      return false;
    });
  };

  // 정렬 로직
  const sortRecords = (records: Record[]) => {
    const sorted = [...records];

    switch (sortOption) {
      case 'newest':
        // 최신순 (created_at 내림차순)
        return sorted.sort((a, b) => {
          const aTime = a.created_at?.toMillis() || 0;
          const bTime = b.created_at?.toMillis() || 0;
          return bTime - aTime;
        });

      case 'oldest':
        // 과거순 (created_at 오름차순)
        return sorted.sort((a, b) => {
          const aTime = a.created_at?.toMillis() || 0;
          const bTime = b.created_at?.toMillis() || 0;
          return aTime - bTime;
        });

      case 'rating-high':
        // 별점 높은 순
        return sorted.sort((a, b) => b.rating - a.rating);

      case 'rating-low':
        // 별점 낮은 순
        return sorted.sort((a, b) => a.rating - b.rating);

      case 'title-asc':
        // 제목 오름차순 (가나다순)
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));

      case 'title-desc':
        // 제목 내림차순 (가나다 역순)
        return sorted.sort((a, b) => b.title.localeCompare(a.title, 'ko'));

      default:
        return sorted;
    }
  };

  // 날짜 범위 필터링 적용
  const dateFilteredRecords = filterRecordsByDateRange(records);

  // 검색 결과 적용
  const filteredRecords = filterRecordsBySearch(dateFilteredRecords);

  // 정렬 적용
  const sortedRecords = sortRecords(filteredRecords);

  // 페이지네이션 계산 (검색 및 정렬 결과 기준)
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
  };

  const getSortLabel = () => {
    switch (sortOption) {
      case 'newest': return '최신순';
      case 'oldest': return '과거순';
      case 'rating-high': return '별점 높은 순';
      case 'rating-low': return '별점 낮은 순';
      case 'title-asc': return '제목 오름차순';
      case 'title-desc': return '제목 내림차순';
      default: return '정렬';
    }
  };

  const handleDateRangeChange = (range: DateRangeOption) => {
    setDateRange(range);
    setCurrentPage(1); // 날짜 범위 변경 시 첫 페이지로 이동
  };

  const getDateRangeLabel = (range: DateRangeOption) => {
    switch (range) {
      case 'all': return '전체';
      case '1month': return '1개월';
      case '3months': return '3개월';
      case '6months': return '6개월';
      case '1year': return '1년';
      default: return '전체';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-card">
        <h1 className="text-center">내 기록</h1>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="제목, 저자, 감독, 장소 등을 검색하세요..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            검색 결과: {filteredRecords.length}개
          </p>
        )}
      </div>

      {/* Filter Buttons and Sort */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto flex-1">
            {filterButtons.map(({ id, label }) => (
              <Button
                key={id}
                variant={activeFilter === id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(id)}
                className={`whitespace-nowrap ${
                  activeFilter === id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Date Range Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                  <Calendar size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => handleDateRangeChange('all')}>
                  전체
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDateRangeChange('1month')}>
                  1개월
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDateRangeChange('3months')}>
                  3개월
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDateRangeChange('6months')}>
                  6개월
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDateRangeChange('1year')}>
                  1년
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                  <ArrowUpDown size={16} className="mr-2" />
                  {getSortLabel()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleSortChange('newest')}>
                  최신순
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
                  과거순
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('rating-high')}>
                  별점 높은 순
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('rating-low')}>
                  별점 낮은 순
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('title-asc')}>
                  제목 오름차순
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('title-desc')}>
                  제목 내림차순
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {loading ? (
          // Skeleton Loader
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-16 h-16 md:w-20 md:h-28 flex-shrink-0 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">아직 기록이 없습니다.</p>
            <p className="text-sm text-gray-400">오른쪽 하단의 + 버튼을 눌러 기록을 추가해보세요!</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">검색 결과가 없습니다.</p>
            <p className="text-sm text-gray-400">다른 키워드로 검색해보세요.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentRecords.map((record) => (
                <Card
                  key={record.id}
                  className="border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onViewDetail(record.id!)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Thumbnail Image */}
                      {record.image_url ? (
                        <div className="w-16 h-16 md:w-20 md:h-28 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                          <img
                            src={getThumbnailUrl(record.image_url)}
                            alt={record.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 md:w-20 md:h-28 flex-shrink-0 rounded bg-gray-50 flex items-center justify-center">
                          {getIcon(record.category)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="truncate text-sm md:text-base">{record.title}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatDate(record.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(record.rating)}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {getPreview(record)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  이전
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                  // 현재 페이지 주변 페이지만 표시
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNumber
                            ? 'bg-[#5E7F19] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="text-gray-400">...</span>;
                  }
                  return null;
                })}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-20 right-6">
        <Button
          size="icon"
          onClick={onWriteReview}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
        >
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
}