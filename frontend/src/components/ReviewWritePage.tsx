import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AspectRatio } from "./ui/aspect-ratio";
import { Star, Camera, ArrowLeft } from "lucide-react";
import { addRecord, getRecord, updateRecord, Record } from "../lib/firestore";
import { auth } from "../lib/firebase";
import { Timestamp } from "firebase/firestore";
import { uploadImage } from "../lib/cloudinary";
import { handleError, showSuccess, showWarning, handleRetryableError } from "../lib/errorHandler";

interface ReviewWritePageProps {
  onBack: () => void;
  editRecordId?: string; // 수정 모드일 때 전달되는 레코드 ID
}

export function ReviewWritePage({ onBack, editRecordId }: ReviewWritePageProps) {
  const [activeTab, setActiveTab] = useState<'movie' | 'book' | 'place'>('movie');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (editRecordId) {
      loadRecordData();
    }
  }, [editRecordId]);

  const loadRecordData = async () => {
    if (!editRecordId) return;

    setDataLoading(true);
    try {
      const { data, error } = await getRecord(editRecordId);

      if (error || !data) {
        handleError(new Error(error || "데이터를 찾을 수 없습니다."), "기록을 불러오는데 실패했습니다.");
        return;
      }

      // 카테고리에 따라 적절한 탭 설정
      setActiveTab(data.category);
      setRating(data.rating);

      // 카테고리별 데이터 설정
      if (data.category === 'movie') {
        setMovieData({
          title: data.title,
          cast: data.cast?.join(', ') || "",
          director: data.director || "",
          watchDate: data.date_watched
            ? new Date(data.date_watched.toDate()).toISOString().split('T')[0]
            : "",
          content: data.review
        });
      } else if (data.category === 'book') {
        setBookData({
          title: data.title,
          author: data.author || "",
          publisher: data.publisher || "",
          startDate: data.date_started
            ? new Date(data.date_started.toDate()).toISOString().split('T')[0]
            : "",
          endDate: data.date_finished
            ? new Date(data.date_finished.toDate()).toISOString().split('T')[0]
            : "",
          content: data.review
        });
      } else if (data.category === 'place') {
        setPlaceData({
          name: data.title,
          location: data.location || "",
          visitDate: data.date_visited
            ? new Date(data.date_visited.toDate()).toISOString().split('T')[0]
            : "",
          content: data.review
        });
      }
    } catch (err) {
      handleError(err, "기록을 불러오는데 실패했습니다.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleSave = async () => {
    if (!auth.currentUser) {
      showWarning("로그인이 필요합니다.");
      return;
    }

    // Validate required fields
    if (activeTab === 'movie') {
      if (!movieData.title || !movieData.watchDate) {
        showWarning("제목과 시청 날짜는 필수 항목입니다.");
        return;
      }
    } else if (activeTab === 'book') {
      if (!bookData.title || !bookData.startDate) {
        showWarning("제목과 읽기 시작한 날짜는 필수 항목입니다.");
        return;
      }
    } else if (activeTab === 'place') {
      if (!placeData.name || !placeData.visitDate) {
        showWarning("장소명과 방문 날짜는 필수 항목입니다.");
        return;
      }
    }

    if (!rating) {
      showWarning("별점을 선택해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userId = auth.currentUser.uid;

      // 이미지 업로드 (있는 경우)
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        const { url, error: uploadError } = await uploadImage(imageFile, `recordmoa/${activeTab}`);
        if (uploadError) {
          handleRetryableError(
            new Error(uploadError),
            handleSave,
            "이미지 업로드에 실패했습니다."
          );
          setLoading(false);
          return;
        }
        imageUrl = url || undefined;
      }

      // 수정 모드일 때
      if (editRecordId) {
        let updateData: Partial<Record> = {
          rating
        };

        // 이미지가 있을 때만 추가
        if (imageUrl) {
          updateData.image_url = imageUrl;
        }

        if (activeTab === 'movie') {
          updateData = {
            ...updateData,
            title: movieData.title,
            cast: movieData.cast ? movieData.cast.split(',').map(c => c.trim()) : [],
            director: movieData.director || '',
            date_watched: Timestamp.fromDate(new Date(movieData.watchDate)),
            review: movieData.content || ''
          };
        } else if (activeTab === 'book') {
          updateData = {
            ...updateData,
            title: bookData.title,
            author: bookData.author || '',
            publisher: bookData.publisher || '',
            date_started: Timestamp.fromDate(new Date(bookData.startDate)),
            date_finished: bookData.endDate ? Timestamp.fromDate(new Date(bookData.endDate)) : null,
            review: bookData.content || ''
          };
        } else if (activeTab === 'place') {
          updateData = {
            ...updateData,
            title: placeData.name,
            place_name: placeData.name,
            location: placeData.location || '',
            date_visited: Timestamp.fromDate(new Date(placeData.visitDate)),
            review: placeData.content || ''
          };
        }

        await updateRecord(editRecordId, updateData);
      } else {
        // 신규 작성 모드일 때
        if (activeTab === 'movie') {
          const recordData: any = {
            category: 'movie',
            title: movieData.title,
            cast: movieData.cast ? movieData.cast.split(',').map(c => c.trim()) : [],
            director: movieData.director || '',
            date_watched: Timestamp.fromDate(new Date(movieData.watchDate)),
            rating,
            review: movieData.content || ''
          };
          if (imageUrl) recordData.image_url = imageUrl;
          await addRecord(userId, recordData);
        } else if (activeTab === 'book') {
          const recordData: any = {
            category: 'book',
            title: bookData.title,
            author: bookData.author || '',
            publisher: bookData.publisher || '',
            date_started: Timestamp.fromDate(new Date(bookData.startDate)),
            date_finished: bookData.endDate ? Timestamp.fromDate(new Date(bookData.endDate)) : null,
            rating,
            review: bookData.content || ''
          };
          if (imageUrl) recordData.image_url = imageUrl;
          await addRecord(userId, recordData);
        } else if (activeTab === 'place') {
          const recordData: any = {
            category: 'place',
            title: placeData.name,
            place_name: placeData.name,
            location: placeData.location || '',
            date_visited: Timestamp.fromDate(new Date(placeData.visitDate)),
            rating,
            review: placeData.content || ''
          };
          if (imageUrl) recordData.image_url = imageUrl;
          await addRecord(userId, recordData);
        }

        // Reset form (only for new records)
        setRating(0);
        setImageFile(null);
        setImagePreview(null);
        setMovieData({
          title: "",
          cast: "",
          director: "",
          watchDate: "",
          content: ""
        });
        setBookData({
          title: "",
          author: "",
          publisher: "",
          startDate: "",
          endDate: "",
          content: ""
        });
        setPlaceData({
          name: "",
          location: "",
          visitDate: "",
          content: ""
        });
      }

      // 성공 메시지
      showSuccess(editRecordId ? "기록이 수정되었습니다." : "기록이 저장되었습니다.");

      // Go back to list
      onBack();
    } catch (err) {
      handleRetryableError(
        err,
        handleSave,
        "저장 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 데이터 로딩 중일 때
  if (dataLoading) {
    return (
      <div className="flex flex-col h-full bg-card">
        <div className="p-4 border-b border-gray-200 bg-card">
          <div className="relative flex items-center">
            <button
              onClick={onBack}
              className="absolute left-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="flex-1 text-center">{editRecordId ? '수정하기' : '기록하기'}</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="flex-1 text-center">{editRecordId ? '수정하기' : '기록하기'}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Tabs value={activeTab} className="p-4" onValueChange={(value) => setActiveTab(value as 'movie' | 'book' | 'place')}>
          {/* Category Tabs */}
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="movie" className="tab-title" disabled={!!editRecordId}>영상</TabsTrigger>
            <TabsTrigger value="book" className="tab-title" disabled={!!editRecordId}>도서</TabsTrigger>
            <TabsTrigger value="place" className="tab-title" disabled={!!editRecordId}>장소</TabsTrigger>
          </TabsList>

          <TabsContent value="movie" className="space-y-6">
            <MovieForm
              rating={rating}
              data={movieData}
              onRatingChange={setRating}
              onDataChange={setMovieData}
              renderStars={renderStars}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
            />
          </TabsContent>

          <TabsContent value="book" className="space-y-6">
            <BookForm
              rating={rating}
              data={bookData}
              onRatingChange={setRating}
              onDataChange={setBookData}
              renderStars={renderStars}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
            />
          </TabsContent>

          <TabsContent value="place" className="space-y-6">
            <PlaceForm
              rating={rating}
              data={placeData}
              onRatingChange={setRating}
              onDataChange={setPlaceData}
              renderStars={renderStars}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Save Button */}
      <div className="p-4 border-t border-gray-200 mb-16 bg-card">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (editRecordId ? '수정 중...' : '저장 중...') : (editRecordId ? '수정' : '저장')}
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
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function MovieForm({ data, onDataChange, renderStars, imagePreview, onImageChange }: MovieFormProps) {
  const handleChange = (field: string, value: string) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
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
              <label className="border-2 border-dashed border-gray-300 rounded-lg h-full flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={24} className="text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">사진 업로드</p>
                  </>
                )}
              </label>
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
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function BookForm({ data, onDataChange, renderStars, imagePreview, onImageChange }: BookFormProps) {
  const handleChange = (field: string, value: string) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="border-2 border-dashed border-gray-300 rounded-lg h-full flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={24} className="text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">사진 업로드</p>
                  </>
                )}
              </label>
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
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function PlaceForm({ data, onDataChange, renderStars, imagePreview, onImageChange }: PlaceFormProps) {
  const handleChange = (field: string, value: string) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
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
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer block overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
              ) : (
                <>
                  <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">사진 업로드</p>
                </>
              )}
            </label>
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