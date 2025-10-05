import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AspectRatio } from "./ui/aspect-ratio";
import { Star, Camera, ArrowLeft } from "lucide-react";

interface ReviewWritePageProps {
  onBack: () => void;
}

export function ReviewWritePage({ onBack }: ReviewWritePageProps) {
  const [rating, setRating] = useState(0);
  const [movieData, setMovieData] = useState({
    title: "",
    cast: "",
    director: "",
    watchDate: "",
    content: ""
  });
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    publisher: "",
    startDate: "",
    endDate: "",
    content: ""
  });
  const [placeData, setPlaceData] = useState({
    name: "",
    location: "",
    visitDate: "",
    content: ""
  });

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        onClick={() => setRating(i + 1)}
        className={`p-1 ${i < rating ? 'text-primary' : 'text-gray-300'}`}
      >
        <Star size={24} fill={i < rating ? 'currentColor' : 'none'} />
      </button>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-card">
        <div className="relative flex items-center">
          <button
            onClick={onBack}
            className="absolute left-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-center">기록하기</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="movie" className="p-4">
          {/* Category Tabs */}
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="movie" className="tab-title">영상</TabsTrigger>
            <TabsTrigger value="book" className="tab-title">도서</TabsTrigger>
            <TabsTrigger value="place" className="tab-title">장소</TabsTrigger>
          </TabsList>

          <TabsContent value="movie" className="space-y-6">
            <MovieForm 
              rating={rating} 
              data={movieData}
              onRatingChange={setRating}
              onDataChange={setMovieData}
              renderStars={renderStars}
            />
          </TabsContent>

          <TabsContent value="book" className="space-y-6">
            <BookForm 
              rating={rating} 
              data={bookData}
              onRatingChange={setRating}
              onDataChange={setBookData}
              renderStars={renderStars}
            />
          </TabsContent>

          <TabsContent value="place" className="space-y-6">
            <PlaceForm 
              rating={rating} 
              data={placeData}
              onRatingChange={setRating}
              onDataChange={setPlaceData}
              renderStars={renderStars}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Save Button */}
      <div className="p-4 border-t border-gray-200 mb-16 bg-card">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          저장
        </Button>
      </div>
    </div>
  );
}

// Movie Form Component
interface MovieFormProps {
  rating: number;
  data: {
    title: string;
    cast: string;
    director: string;
    watchDate: string;
    content: string;
  };
  onRatingChange: (rating: number) => void;
  onDataChange: (data: any) => void;
  renderStars: () => JSX.Element[];
}

function MovieForm({ rating, data, onRatingChange, onDataChange, renderStars }: MovieFormProps) {
  const handleChange = (field: string, value: string) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm">제목</label>
            <Input
              value={data.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="영화 제목을 입력하세요"
              className="border-gray-300"
            />
          </div>

          {/* Cast */}
          <div className="space-y-2">
            <label className="block text-sm">출연자</label>
            <Input
              value={data.cast}
              onChange={(e) => handleChange('cast', e.target.value)}
              placeholder="주요 출연자를 입력하세요"
              className="border-gray-300"
            />
          </div>

          {/* Director */}
          <div className="space-y-2">
            <label className="block text-sm">작가/감독</label>
            <Input
              value={data.director}
              onChange={(e) => handleChange('director', e.target.value)}
              placeholder="감독/작가를 입력하세요"
              className="border-gray-300"
            />
          </div>

          {/* Watch Date */}
          <div className="space-y-2">
            <label className="block text-sm">시청한 날짜</label>
            <Input
              type="date"
              value={data.watchDate}
              onChange={(e) => handleChange('watchDate', e.target.value)}
              className="border-gray-300"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-sm">평가</label>
            <div className="flex gap-1">
              {renderStars()}
            </div>
          </div>
        </div>

        {/* Poster Upload */}
        <div className="col-span-1">
          <div className="space-y-2">
            <label className="block text-sm">포스터</label>
            <AspectRatio ratio={3/4}>
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-full flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                <Camera size={24} className="text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">사진 업로드</p>
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <label className="block text-sm">리뷰 내용</label>
        <Textarea
          value={data.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="영화에 대한 리뷰를 작성해주세요"
          className="min-h-32 border-gray-300 resize-none"
        />
      </div>
    </>
  );
}

// Book Form Component
interface BookFormProps {
  rating: number;
  data: {
    title: string;
    author: string;
    publisher: string;
    startDate: string;
    endDate: string;
    content: string;
  };
  onRatingChange: (rating: number) => void;
  onDataChange: (data: any) => void;
  renderStars: () => JSX.Element[];
}

function BookForm({ rating, data, onRatingChange, onDataChange, renderStars }: BookFormProps) {
  const handleChange = (field: string, value: string) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm">제목</label>
            <Input
              value={data.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="도서 제목을 입력하세요"
              className="border-gray-300"
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <label className="block text-sm">저자</label>
            <Input
              value={data.author}
              onChange={(e) => handleChange('author', e.target.value)}
              placeholder="저자를 입력하세요"
              className="border-gray-300"
            />
          </div>

          {/* Publisher */}
          <div className="space-y-2">
            <label className="block text-sm">출판사</label>
            <Input
              value={data.publisher}
              onChange={(e) => handleChange('publisher', e.target.value)}
              placeholder="출판사를 입력하세요"
              className="border-gray-300"
            />
          </div>

          {/* Reading Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-sm">읽기 시작한 날짜</label>
              <Input
                type="date"
                value={data.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">다 읽은 날짜</label>
              <Input
                type="date"
                value={data.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="border-gray-300"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-sm">평가</label>
            <div className="flex gap-1">
              {renderStars()}
            </div>
          </div>
        </div>

        {/* Cover Upload */}
        <div className="col-span-1">
          <div className="space-y-2">
            <label className="block text-sm">표지</label>
            <AspectRatio ratio={3/4}>
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-full flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                <Camera size={24} className="text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">사진 업로드</p>
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <label className="block text-sm">리뷰 내용</label>
        <Textarea
          value={data.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="도서에 대한 리뷰를 작성해주세요"
          className="min-h-32 border-gray-300 resize-none"
        />
      </div>
    </>
  );
}

// Place Form Component
interface PlaceFormProps {
  rating: number;
  data: {
    name: string;
    location: string;
    visitDate: string;
    content: string;
  };
  onRatingChange: (rating: number) => void;
  onDataChange: (data: any) => void;
  renderStars: () => JSX.Element[];
}

function PlaceForm({ rating, data, onRatingChange, onDataChange, renderStars }: PlaceFormProps) {
  const handleChange = (field: string, value: string) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          {/* Place Name */}
          <div className="space-y-2">
            <label className="block text-sm">장소명</label>
            <Input
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="장소명을 입력하세요"
              className="border-gray-300"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm">위치</label>
            <Input
              value={data.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="위치를 입력하세요"
              className="border-gray-300"
            />
          </div>

          {/* Visit Date */}
          <div className="space-y-2">
            <label className="block text-sm">방문한 날짜</label>
            <Input
              type="date"
              value={data.visitDate}
              onChange={(e) => handleChange('visitDate', e.target.value)}
              className="border-gray-300"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-sm">평가</label>
            <div className="flex gap-1">
              {renderStars()}
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="col-span-1">
          <div className="space-y-2">
            <label className="block text-sm">사진</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Camera size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">사진 업로드</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <label className="block text-sm">리뷰 내용</label>
        <Textarea
          value={data.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="장소에 대한 리뷰를 작성해주세요"
          className="min-h-32 border-gray-300 resize-none"
        />
      </div>
    </>
  );
}