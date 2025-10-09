import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AspectRatio } from "./ui/aspect-ratio";
import { Skeleton } from "./ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Star, Camera, ArrowLeft, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { getRecord, Record, deleteRecord } from "../lib/firestore";
import { Timestamp } from "firebase/firestore";
import { getDetailImageUrl, deleteImage } from "../lib/cloudinary";

interface RecordDetailPageProps {
  recordId: string;
  onBack: () => void;
  onEdit: (recordId: string) => void;
  onDelete: (recordId: string) => void;
}

export function RecordDetailPage({ recordId, onBack, onEdit, onDelete }: RecordDetailPageProps) {
  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchRecord();
  }, [recordId]);

  const fetchRecord = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getRecord(recordId);

    if (fetchError) {
      console.error('Failed to fetch record:', fetchError);
      setError('기록을 불러올 수 없습니다.');
    } else if (data) {
      setRecord(data);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      // 이미지가 있으면 삭제 대기 목록에 추가
      if (record?.image_url) {
        const { error: imageDeleteError } = await deleteImage(record.image_url);
        if (imageDeleteError) {
          console.warn('Failed to mark image for deletion:', imageDeleteError);
          // 이미지 삭제 실패해도 게시물은 삭제 진행
        }
      }

      // Firestore에서 게시물 삭제
      const { error: deleteError } = await deleteRecord(recordId);
      if (deleteError) {
        setError('삭제 중 오류가 발생했습니다.');
        console.error('Delete error:', deleteError);
      } else {
        onDelete(recordId);
      }
    } catch (error) {
      setError('삭제 중 오류가 발생했습니다.');
      console.error('Delete error:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={24}
        fill={i < rating ? 'currentColor' : 'none'}
        className={`${i < rating ? 'text-primary' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Image Skeleton */}
          <Skeleton className="w-full h-64 rounded-lg" />

          {/* Title & Rating */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Review Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !record) {
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
            <h1 className="flex-1 text-center">기록 상세</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error || '기록을 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  const category = record.category;

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
          <h1 className="flex-1 text-center">기록 상세</h1>
          <div className="absolute right-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit(recordId)}
                  className="cursor-pointer"
                >
                  <Pencil size={16} className="mr-2" />
                  수정하기
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteConfirm(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 size={16} className="mr-2" />
                  삭제하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">기록 삭제</h3>
            <p className="text-gray-600 mb-6">정말로 이 기록을 삭제하시겠습니까?</p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDelete();
                }}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={category} className="p-4">
          {/* Category Tabs */}
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="movie" disabled className="tab-title">영상</TabsTrigger>
            <TabsTrigger value="book" disabled className="tab-title">도서</TabsTrigger>
            <TabsTrigger value="place" disabled className="tab-title">장소</TabsTrigger>
          </TabsList>

          <TabsContent value="movie" className="space-y-6">
            <MovieView record={record} renderStars={renderStars} formatDate={formatDate} />
          </TabsContent>

          <TabsContent value="book" className="space-y-6">
            <BookView record={record} renderStars={renderStars} formatDate={formatDate} />
          </TabsContent>

          <TabsContent value="place" className="space-y-6">
            <PlaceView record={record} renderStars={renderStars} formatDate={formatDate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Movie View Component
interface ViewProps {
  record: Record;
  renderStars: (rating: number) => JSX.Element[];
  formatDate: (timestamp: Timestamp | undefined) => string;
}

function MovieView({ record, renderStars, formatDate }: ViewProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">제목</label>
            <Input
              value={record.title}
              disabled
              className="border-gray-300 bg-gray-50"
            />
          </div>

          {/* Cast */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">출연자</label>
            <Input
              value={record.cast?.join(', ') || ''}
              disabled
              className="border-gray-300 bg-gray-50"
            />
          </div>

          {/* Director */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">작가/감독</label>
            <Input
              value={record.director || ''}
              disabled
              className="border-gray-300 bg-gray-50"
            />
          </div>

          {/* Watch Date */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">시청한 날짜</label>
            <Input
              value={formatDate(record.date_watched)}
              disabled
              className="border-gray-300 bg-gray-50"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">평가</label>
            <div className="flex gap-1">
              {renderStars(record.rating)}
            </div>
          </div>
        </div>

        {/* Poster */}
        <div className="col-span-1">
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">포스터</label>
            <AspectRatio ratio={3/4}>
              {record.image_url ? (
                <img
                  src={getDetailImageUrl(record.image_url)}
                  alt="포스터"
                  className="rounded-lg w-full h-full object-cover"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-full flex flex-col items-center justify-center bg-gray-50">
                  <Camera size={24} className="text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">이미지 없음</p>
                </div>
              )}
            </AspectRatio>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <label className="block text-sm text-gray-600">리뷰 내용</label>
        <Textarea
          value={record.review}
          disabled
          className="min-h-32 border-gray-300 resize-none bg-gray-50"
        />
      </div>
    </>
  );
}

function BookView({ record, renderStars, formatDate }: ViewProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">제목</label>
            <Input
              value={record.title}
              disabled
              className="border-gray-300 bg-gray-50"
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">저자</label>
            <Input
              value={record.author || ''}
              disabled
              className="border-gray-300 bg-gray-50"
            />
          </div>

          {/* Publisher */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">출판사</label>
            <Input
              value={record.publisher || ''}
              disabled
              className="border-gray-300 bg-gray-50"
            />
          </div>

          {/* Reading Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">읽기 시작한 날짜</label>
              <Input
                value={formatDate(record.date_started)}
                disabled
                className="border-gray-300 bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">다 읽은 날짜</label>
              <Input
                value={formatDate(record.date_finished)}
                disabled
                className="border-gray-300 bg-gray-50"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">평가</label>
            <div className="flex gap-1">
              {renderStars(record.rating)}
            </div>
          </div>
        </div>

        {/* Cover */}
        <div className="col-span-1">
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">표지</label>
            <AspectRatio ratio={3/4}>
              {record.image_url ? (
                <img
                  src={getDetailImageUrl(record.image_url)}
                  alt="표지"
                  className="rounded-lg w-full h-full object-cover"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-full flex flex-col items-center justify-center bg-gray-50">
                  <Camera size={24} className="text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">이미지 없음</p>
                </div>
              )}
            </AspectRatio>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <label className="block text-sm text-gray-600">리뷰 내용</label>
        <Textarea
          value={record.review}
          disabled
          className="min-h-32 border-gray-300 resize-none bg-gray-50"
        />
      </div>
    </>
  );
}

function PlaceView({ record, renderStars, formatDate }: ViewProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {/* Place Name */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">장소명</label>
            <Input
              value={record.place_name || record.title}
              disabled
              className="border-gray-300 bg-gray-50"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">위치</label>
            <Input
              value={record.location || ''}
              disabled
              className="border-gray-300 bg-gray-50"
            />
          </div>

          {/* Visit Date */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">방문한 날짜</label>
            <Input
              value={formatDate(record.date_visited)}
              disabled
              className="border-gray-300 bg-gray-50"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">평가</label>
            <div className="flex gap-1">
              {renderStars(record.rating)}
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="col-span-1">
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">사진</label>
            <AspectRatio ratio={3/4}>
              {record.image_url ? (
                <img
                  src={getDetailImageUrl(record.image_url)}
                  alt="사진"
                  className="rounded-lg w-full h-full object-cover"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-full flex flex-col items-center justify-center bg-gray-50">
                  <Camera size={24} className="text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">이미지 없음</p>
                </div>
              )}
            </AspectRatio>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <label className="block text-sm text-gray-600">리뷰 내용</label>
        <Textarea
          value={record.review}
          disabled
          className="min-h-32 border-gray-300 resize-none bg-gray-50"
        />
      </div>
    </>
  );
}
