import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { ArrowLeft, Camera, User, Loader2 } from "lucide-react";
import { auth } from "../lib/firebase";
import { getUserProfile, updateUserProfile } from "../lib/firestore";
import { uploadImage, getProfileImageUrl } from "../lib/cloudinary";
import { handleError, showSuccess, showWarning, handleRetryableError } from "../lib/errorHandler";

interface ProfileEditPageProps {
  onBack: () => void;
}

export function ProfileEditPage({ onBack }: ProfileEditPageProps) {
  const [name, setName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await getUserProfile(user.uid);
    if (fetchError) {
      console.error("프로필 로드 실패:", fetchError);
    } else if (data) {
      setName(data.name || "");
      setProfileImageUrl(data.profile_image_url);
    }
    setLoading(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      showWarning("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith("image/")) {
      showWarning("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 이미지 업로드
      const { url, error: uploadError } = await uploadImage(file, "profiles");

      if (uploadError) {
        handleRetryableError(
          new Error(uploadError),
          () => handleImageChange(e),
          "이미지 업로드에 실패했습니다."
        );
        setUploading(false);
        return;
      }

      if (url) {
        setProfileImageUrl(url);
        showSuccess("이미지가 업로드되었습니다.");
      }
    } catch (error) {
      handleRetryableError(
        error,
        () => handleImageChange(e),
        "이미지 업로드 중 오류가 발생했습니다."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      showWarning("로그인이 필요합니다.");
      return;
    }

    if (!name.trim()) {
      showWarning("닉네임을 입력해주세요.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updates: { name?: string; profile_image_url?: string } = {
        name: name.trim(),
      };

      if (profileImageUrl) {
        updates.profile_image_url = profileImageUrl;
      }

      const { error: updateError } = await updateUserProfile(user.uid, updates);

      if (updateError) {
        handleRetryableError(
          new Error(updateError),
          handleSave,
          "프로필 업데이트에 실패했습니다."
        );
        setSaving(false);
        return;
      }

      showSuccess("프로필이 업데이트되었습니다.");
      onBack();
    } catch (error) {
      handleRetryableError(
        error,
        handleSave,
        "프로필 업데이트 중 오류가 발생했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-card">
        <div className="p-4 border-b border-gray-200 bg-card">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft size={24} />
            </button>
            <h1>프로필 설정</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-2" size={32} />
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-card">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft size={24} />
          </button>
          <h1>프로필 설정</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {/* Profile Image */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <label className="block text-sm font-medium mb-3">프로필 사진</label>
            <div className="flex flex-col items-center">
              <div
                onClick={handleImageClick}
                className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
              >
                {profileImageUrl ? (
                  <img
                    src={getProfileImageUrl(profileImageUrl)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={48} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <Camera size={24} className="text-white opacity-0 hover:opacity-100" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={32} />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-3 text-center">
                클릭하여 이미지 변경 (최대 5MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nickname */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <label className="block text-sm font-medium mb-3">닉네임</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
            />
            <p className="text-sm text-gray-500 mt-2">{name.length}/20</p>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving || uploading}
          className="w-full"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </Button>
      </div>
    </div>
  );
}
