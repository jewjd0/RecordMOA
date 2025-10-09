# Vercel 배포 가이드

RecordMOA 프로젝트를 Vercel에 배포하는 방법입니다.

---

## 🚀 배포 방법

### 방법 1: Vercel 웹사이트에서 배포 (권장)

#### 1. Vercel 계정 생성
- https://vercel.com 접속
- "Sign Up" 클릭
- GitHub 계정으로 로그인

#### 2. 새 프로젝트 생성
- Dashboard → "Add New..." → "Project" 클릭
- GitHub 저장소 연결
- "Import" 버튼 클릭: `jewjd0/RecordMOA`

#### 3. 프로젝트 설정

**Build & Development Settings:**
- Framework Preset: `Vite`
- Root Directory: `frontend` (Edit 클릭하여 설정)
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables (환경 변수 설정):**

다음 6개의 환경 변수를 추가하세요:

| Name | Value | 설명 |
|------|-------|------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyB6OLSEfINKyvJi92vWzpkKG5QsFyS3PLo` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `recordmoa.firebaseapp.com` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | `recordmoa` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `recordmoa.appspot.com` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `253734606007` | Firebase Sender ID |
| `VITE_FIREBASE_APP_ID` | `1:253734606007:web:d3c78a025ebba640372932` | Firebase App ID |

**Cloudinary 환경 변수 (이미 frontend/.env에 있음):**

이미 코드에 포함되어 있으므로 별도 설정 불필요:
- `VITE_CLOUDINARY_CLOUD_NAME`: `dfk1ojppr`
- `VITE_CLOUDINARY_UPLOAD_PRESET`: `recordmoa_preset`

#### 4. 배포
- "Deploy" 버튼 클릭
- 빌드 및 배포 진행 (약 2-3분 소요)
- 완료되면 배포 URL 확인

---

### 방법 2: Vercel CLI로 배포

#### 1. Vercel CLI 설치
```bash
npm install -g vercel
```

#### 2. 로그인
```bash
vercel login
```

#### 3. 프로젝트 설정
```bash
cd 레코드모아
vercel
```

질문에 다음과 같이 답변:
- Set up and deploy? `Y`
- Which scope? (계정 선택)
- Link to existing project? `N`
- Project name? `recordmoa` (또는 원하는 이름)
- In which directory is your code located? `frontend`

#### 4. 환경 변수 추가
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

각 명령어마다 값을 입력하고, environment는 `Production`, `Preview`, `Development` 모두 선택

#### 5. 배포
```bash
vercel --prod
```

---

## 🔧 배포 후 설정

### 1. Firebase 인증 도메인 추가

1. **Firebase Console 접속**
   - https://console.firebase.google.com/project/recordmoa/authentication/settings

2. **승인된 도메인 추가**
   - "승인된 도메인" 섹션
   - "도메인 추가" 클릭
   - Vercel 배포 URL 입력 (예: `recordmoa.vercel.app`)
   - "추가" 클릭

### 2. Cloudinary CORS 설정 (필요한 경우)

1. **Cloudinary Console 접속**
   - https://console.cloudinary.com/console/settings/security

2. **Allowed fetch domains 추가**
   - Vercel 도메인 추가 (예: `recordmoa.vercel.app`)

---

## 📊 자동 배포 설정

Vercel은 GitHub와 연결되면 자동으로 배포됩니다:

### 프로덕션 배포
- `main` 브랜치에 푸시하면 자동으로 프로덕션 배포
- URL: `https://recordmoa.vercel.app`

### 프리뷰 배포
- Pull Request 생성 시 자동으로 프리뷰 배포
- 각 PR마다 고유 URL 생성

---

## 🔍 배포 확인

### 1. 배포 상태 확인
- Vercel Dashboard → Deployments
- 빌드 로그 확인
- 에러 발생 시 로그에서 원인 파악

### 2. 기능 테스트
- [ ] 웹사이트 접속
- [ ] 로그인/회원가입
- [ ] 리뷰 작성 (이미지 업로드 포함)
- [ ] 리뷰 목록 확인
- [ ] 통계 페이지 확인
- [ ] 리뷰 수정/삭제

### 3. Firebase 연동 확인
- [ ] Firebase Console에서 사용자 생성 확인
- [ ] Firestore에서 데이터 저장 확인
- [ ] Cloudinary에서 이미지 업로드 확인

---

## 🐛 문제 해결

### "Failed to compile" 에러
**원인:** TypeScript 타입 에러 또는 빌드 설정 문제

**해결:**
```bash
cd frontend
npm run build
```
로컬에서 빌드 테스트하여 에러 확인

### "Environment variable not found" 에러
**원인:** 환경 변수 미설정

**해결:**
1. Vercel Dashboard → Settings → Environment Variables
2. 모든 `VITE_*` 변수 확인
3. 재배포: Deployments → ... → Redeploy

### Firebase 인증 실패
**원인:** 승인된 도메인에 Vercel URL이 없음

**해결:**
1. Firebase Console → Authentication → Settings
2. 승인된 도메인에 Vercel URL 추가

### 이미지 업로드 실패
**원인:** Cloudinary 설정 또는 CORS 문제

**해결:**
1. 브라우저 콘솔에서 에러 메시지 확인
2. Cloudinary Console에서 CORS 설정 확인
3. Upload Preset이 `unsigned`로 설정되어 있는지 확인

---

## 🎯 성능 최적화

### 1. 빌드 최적화
이미 적용된 최적화:
- ✅ 코드 스플리팅 (Vite 자동)
- ✅ Tree shaking
- ✅ Minification
- ✅ Cloudinary 이미지 최적화

### 2. 캐싱 설정
Vercel이 자동으로 처리:
- Static assets: 1년 캐싱
- API responses: Cache-Control 헤더 기반

### 3. Analytics
Vercel Dashboard에서 확인 가능:
- 페이지 로딩 시간
- Core Web Vitals
- 사용자 통계

---

## 🔒 보안 체크리스트

배포 전 확인:
- [ ] `.env` 파일이 `.gitignore`에 있음
- [ ] Firebase API Key는 제한됨 (Firebase Console → 설정)
- [ ] Firestore Rules가 배포됨
- [ ] 환경 변수가 Vercel에만 저장됨
- [ ] HTTPS 사용 (Vercel 기본)

---

## 📝 커스텀 도메인 설정 (선택사항)

### 1. 도메인 구매
- Vercel Domains 또는 다른 도메인 제공업체

### 2. Vercel에 도메인 추가
- Settings → Domains
- 도메인 입력 및 DNS 설정 따라하기

### 3. Firebase 도메인 추가
- Firebase Console → Authentication → Settings
- 커스텀 도메인 추가

---

## 🎉 배포 완료!

배포가 완료되면:
1. ✅ Vercel URL 확인
2. ✅ Firebase 연동 테스트
3. ✅ 모든 기능 테스트
4. ✅ GitHub README에 배포 URL 추가

**배포 URL:** `https://your-project.vercel.app`

---

## 📞 지원

문제가 발생하면:
- Vercel 문서: https://vercel.com/docs
- Firebase 문서: https://firebase.google.com/docs
- GitHub Issues: https://github.com/jewjd0/RecordMOA/issues
