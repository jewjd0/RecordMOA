# RecordMOA Backend Scripts

Cloudinary 이미지 삭제 및 관리를 위한 백엔드 스크립트입니다.

## 🚀 설정 방법

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 값을 설정하세요:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Cloudinary 설정 정보 얻기:**
1. [Cloudinary Console](https://console.cloudinary.com/) 접속
2. Dashboard에서 API Key와 API Secret 확인

### 3. Firebase Admin SDK 설정

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 설정 > 서비스 계정
3. "새 비공개 키 생성" 클릭
4. 다운로드한 JSON 파일을 `serviceAccountKey.json`으로 저장

## 📝 사용 방법

### 이미지 삭제 스크립트 실행

```bash
npm run cleanup
```

이 스크립트는 다음 작업을 수행합니다:

1. **삭제 대기 이미지 처리**
   - Firestore의 `pending_image_deletions` 컬렉션에서 `status: 'pending'` 항목 조회
   - Cloudinary에서 이미지 삭제
   - 삭제 성공 시 `status: 'deleted'`로 업데이트
   - 실패 시 `status: 'failed'`로 업데이트 및 에러 로그 저장

2. **오래된 삭제 기록 정리**
   - 30일 이상 지난 `status: 'deleted'` 항목 삭제
   - Firestore 저장 공간 절약

## 🔄 자동화 (선택사항)

### Firebase Functions로 자동화

1. Firebase Functions 설치:
```bash
firebase init functions
```

2. `functions/index.js`에 다음 코드 추가:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;

admin.initializeApp();

cloudinary.config({
  cloud_name: functions.config().cloudinary.cloud_name,
  api_key: functions.config().cloudinary.api_key,
  api_secret: functions.config().cloudinary.api_secret,
});

// 매일 자정에 실행
exports.scheduledImageCleanup = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    // cleanup-images.js의 로직을 여기에 복사
  });
```

3. 환경 변수 설정:
```bash
firebase functions:config:set \
  cloudinary.cloud_name="your_cloud_name" \
  cloudinary.api_key="your_api_key" \
  cloudinary.api_secret="your_api_secret"
```

4. 배포:
```bash
firebase deploy --only functions
```

### Cron Job으로 자동화 (Linux/Mac)

```bash
# crontab 편집
crontab -e

# 매일 자정에 실행 (경로는 절대 경로로 수정)
0 0 * * * cd /path/to/backend && node cleanup-images.js >> logs/cleanup.log 2>&1
```

## 📊 데이터 구조

### pending_image_deletions 컬렉션

```typescript
{
  public_id: string;        // Cloudinary public_id
  image_url: string;        // 전체 이미지 URL
  created_at: Timestamp;    // 삭제 요청 시간
  status: 'pending' | 'deleted' | 'failed';
  deleted_at?: Timestamp;   // 삭제 완료 시간
  failed_at?: Timestamp;    // 실패 시간
  error?: string;           // 에러 메시지
}
```

## 🔐 보안 주의사항

- `serviceAccountKey.json`과 `.env` 파일은 **절대 Git에 커밋하지 마세요**
- `.gitignore`에 추가되어 있는지 확인하세요
- API Secret은 안전하게 보관하세요

## 🐛 문제 해결

### "permission denied" 에러
- Firebase Admin SDK 키가 올바른지 확인
- Firestore Rules에서 권한 확인

### Cloudinary 삭제 실패
- API Key/Secret이 올바른지 확인
- public_id가 정확한지 확인
- Cloudinary Console에서 이미지가 실제로 존재하는지 확인

### 이미지가 삭제되지 않음
- `pending_image_deletions` 컬렉션에 기록이 있는지 확인
- 스크립트 실행 로그 확인
- Cloudinary 할당량 초과 여부 확인
