import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Plus, Film, Book, MapPin } from "lucide-react";
import { getRecordsByUser, Record } from "../lib/firestore";
import { auth } from "../lib/firebase";

interface RecordsListPageProps {
  onWriteReview: () => void;
  onViewDetail: (recordId: string) => void;
}

export function RecordsListPage({ onWriteReview, onViewDetail }: RecordsListPageProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

    console.log('Fetching records for user:', user.uid);
    const category = activeFilter === 'all' ? undefined : activeFilter;
    const { data, error: fetchError } = await getRecordsByUser(user.uid, category);

    if (fetchError) {
      console.error('Firestore fetch error:', fetchError);
      setError(`데이터를 불러오는 중 오류가 발생했습니다: ${fetchError}`);
    } else if (data) {
      console.log('Records fetched:', data.length, 'records');
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

  // 페이지네이션 계산
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-card">
        <h1 className="text-center">내 기록</h1>
      </div>

      {/* Filter Buttons */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
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
      </div>

      {/* Records List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">로딩 중...</p>
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
        ) : (
          <>
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
                      <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                        <img
                          src={record.image_url}
                          alt={record.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex-shrink-0 rounded bg-gray-50 flex items-center justify-center">
                        {getIcon(record.category)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="truncate">{record.title}</h3>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-4">
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