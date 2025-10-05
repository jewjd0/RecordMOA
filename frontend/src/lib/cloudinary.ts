import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Cloudinary 이미지 업로드
export const uploadImage = async (
  file: File,
  folder: string = 'recordmoa'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return { url: response.data.secure_url, error: null };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return { url: null, error: error.message || '이미지 업로드에 실패했습니다.' };
  }
};

// Cloudinary 이미지 삭제 (public_id 필요)
export const deleteImage = async (publicId: string): Promise<{ error: string | null }> => {
  try {
    // 주의: Cloudinary 삭제는 서버 사이드에서 API Key/Secret이 필요합니다.
    // 클라이언트에서는 직접 삭제할 수 없으므로,
    // 실제 프로덕션에서는 백엔드 API를 통해 삭제해야 합니다.
    console.warn('Cloudinary 이미지 삭제는 백엔드에서 처리해야 합니다.');
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// URL에서 public_id 추출
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.split('.')[0];
    return publicId;
  } catch (error) {
    return null;
  }
};
