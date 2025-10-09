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

// Cloudinary 이미지 삭제 (URL 기반)
export const deleteImage = async (imageUrl: string): Promise<{ error: string | null }> => {
  try {
    // Cloudinary 삭제는 서버 사이드에서 API Key/Secret이 필요합니다.
    // 클라이언트에서는 직접 삭제할 수 없으므로, Firestore에 삭제 대기 목록에 추가합니다.
    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.warn('Invalid Cloudinary URL:', imageUrl);
      return { error: 'Invalid image URL' };
    }

    // Firestore에 삭제 대기 이미지 기록
    const { addDoc, collection, Timestamp } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    await addDoc(collection(db, 'pending_image_deletions'), {
      public_id: publicId,
      image_url: imageUrl,
      created_at: Timestamp.now(),
      status: 'pending'
    });

    console.log('Image marked for deletion:', publicId);
    return { error: null };
  } catch (error: any) {
    console.error('Failed to mark image for deletion:', error);
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

// Cloudinary 이미지 URL 최적화 (리사이징, 압축, 포맷 변환)
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'limit';
  } = {}
): string => {
  try {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill'
    } = options;

    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const transformations: string[] = [];

    // 크기 조정
    if (width || height) {
      const sizeParams = [];
      if (width) sizeParams.push(`w_${width}`);
      if (height) sizeParams.push(`h_${height}`);
      sizeParams.push(`c_${crop}`);
      transformations.push(sizeParams.join(','));
    }

    // 품질 설정
    transformations.push(`q_${quality}`);

    // 포맷 변환
    transformations.push(`f_${format}`);

    const transformString = transformations.join('/');
    return `${parts[0]}/upload/${transformString}/${parts[1]}`;
  } catch (error) {
    console.error('Failed to optimize image URL:', error);
    return url;
  }
};

// 썸네일 URL 생성 (목록용)
export const getThumbnailUrl = (url: string): string => {
  return getOptimizedImageUrl(url, {
    width: 300,
    quality: 'auto',
    format: 'auto'
  });
};

// 상세 이미지 URL 생성 (상세 페이지용)
export const getDetailImageUrl = (url: string): string => {
  return getOptimizedImageUrl(url, {
    width: 1200,
    quality: 'auto',
    format: 'auto'
  });
};

// 프로필 이미지 URL 생성
export const getProfileImageUrl = (url: string): string => {
  return getOptimizedImageUrl(url, {
    width: 200,
    height: 200,
    quality: 'auto',
    format: 'auto',
    crop: 'fill'
  });
};
