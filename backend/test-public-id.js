/**
 * public_id 추출 테스트 스크립트
 */

function getPublicIdFromUrl(url) {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    const afterUpload = parts.slice(uploadIndex + 1);

    let startIndex = 0;
    for (let i = 0; i < afterUpload.length; i++) {
      if (afterUpload[i].startsWith('v') && /^v\d+$/.test(afterUpload[i])) {
        startIndex = i + 1;
        break;
      }
      if (!afterUpload[i].includes('_') && !afterUpload[i].includes(',')) {
        startIndex = i;
        break;
      }
    }

    const pathParts = afterUpload.slice(startIndex);
    const fullPath = pathParts.join('/');
    const publicId = fullPath.replace(/\.[^.]+$/, '');

    return publicId;
  } catch (error) {
    console.error('Failed to extract public_id from URL:', url, error);
    return null;
  }
}

// 테스트 케이스
const testUrls = [
  // 기본 URL
  'https://res.cloudinary.com/dfk1ojppr/image/upload/v1728408123/recordmoa/movie/abc123.jpg',
  // 변환 파라미터 포함
  'https://res.cloudinary.com/dfk1ojppr/image/upload/w_300,q_auto,f_auto/v1728408123/recordmoa/movie/abc123.jpg',
  // 여러 폴더
  'https://res.cloudinary.com/dfk1ojppr/image/upload/v1728408123/recordmoa/user123/movie/test-image.jpg',
  // 버전 없음
  'https://res.cloudinary.com/dfk1ojppr/image/upload/recordmoa/book/xyz789.png',
];

console.log('🧪 public_id 추출 테스트\n');

testUrls.forEach((url, index) => {
  const publicId = getPublicIdFromUrl(url);
  console.log(`테스트 ${index + 1}:`);
  console.log(`  URL: ${url}`);
  console.log(`  public_id: ${publicId}`);
  console.log('');
});

// Firestore에서 실제 URL 가져와서 테스트할 수 있도록
console.log('실제 URL로 테스트하려면:');
console.log('node test-public-id.js "https://res.cloudinary.com/..."');
if (process.argv[2]) {
  console.log('\n실제 URL 테스트:');
  console.log(`  URL: ${process.argv[2]}`);
  console.log(`  public_id: ${getPublicIdFromUrl(process.argv[2])}`);
}
