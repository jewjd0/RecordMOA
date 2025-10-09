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
    // Cloudinary 이미지 삭제를 위해 삭제 대기 목록에 추가
    const result = await cloudinaryDelete(imageUrl);
    return result;
  } catch (error: any) {
    return { error: error.message };
  }
};
