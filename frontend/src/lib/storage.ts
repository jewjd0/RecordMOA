// Cloudinary를 사용한 이미지 업로드/삭제
// Firebase Storage 대신 Cloudinary 사용
import { uploadImage as cloudinaryUpload, deleteImage as cloudinaryDelete } from './cloudinary';

// 이미지 업로드 (Cloudinary)
export const uploadImage = async (
  file: File,
  userId: string,
  category: 'movie' | 'book' | 'place'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Cloudinary 폴더 구조: recordmoa/userId/category
    const folder = `recordmoa/${userId}/${category}`;
    const result = await cloudinaryUpload(file, folder);
    return result;
  } catch (error: any) {
    return { url: null, error: error.message };
  }
};

// 이미지 삭제 (Cloudinary)
export const deleteImage = async (imageUrl: string): Promise<{ error: string | null }> => {
  try {
    // Cloudinary 이미지 삭제는 백엔드에서 처리하는 것이 권장됨
    // 여기서는 URL만 제거하고 실제 삭제는 나중에 구현
    const result = await cloudinaryDelete(imageUrl);
    return result;
  } catch (error: any) {
    return { error: error.message };
  }
};
