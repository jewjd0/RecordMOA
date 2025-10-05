import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Plus, Film, Book, MapPin } from "lucide-react";

interface Review {
  id: number;
  category: 'movie' | 'book' | 'place';
  title: string;
  date: string;
  preview: string;
  rating: number;
}

const mockReviews: Review[] = [
  {
    id: 1,
    category: 'movie',
    title: '오펜하이머',
    date: '2024.03.15',
    preview: '크리스토퍼 놀란의 놀라운 연출과 킬리언 머피의 연기가...',
    rating: 5
  },
  {
    id: 2,
    category: 'book',
    title: '1984',
    date: '2024.03.12',
    preview: '조지 오웰의 디스토피아 소설. 현재 사회와의 비교점이...',
    rating: 4
  },
  {
    id: 3,
    category: 'place',
    title: '제주도 카페거리',
    date: '2024.03.10',
    preview: '아름다운 바다 뷰와 함께 즐기는 커피 한잔. 분위기가...',
    rating: 4
  },
  {
    id: 4,
    category: 'movie',
    title: '기생충',
    date: '2024.03.08',
    preview: '봉준호 감독의 사회적 메시지가 담긴 걸작. 계급 갈등을...',
    rating: 5
  }
];

interface RecordsListPageProps {
  onWriteReview: () => void;
}

export function RecordsListPage({ onWriteReview }: RecordsListPageProps) {
  const [activeFilter, setActiveFilter] = useState('all');

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

  const filteredReviews = activeFilter === 'all' 
    ? mockReviews 
    : mockReviews.filter(review => review.category === activeFilter);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-black' : 'text-gray-300'}>
        ⭐
      </span>
    ));
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
        {filteredReviews.map((review) => (
          <Card key={review.id} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getIcon(review.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="truncate">{review.title}</h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {review.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {review.preview}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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