# GitHub Secrets 설정 가이드

GitHub Actions에서 Cloudinary 이미지 정리 스크립트를 자동으로 실행하려면, 민감한 정보를 GitHub Secrets에 저장해야 합니다.

## 📋 필요한 Secrets (총 4개)

### 1️⃣ CLOUDINARY_CLOUD_NAME
- **값**: `dfk1ojppr`
- **설명**: Cloudinary Cloud 이름

### 2️⃣ CLOUDINARY_API_KEY
- **값**: `262367615116935`
- **설명**: Cloudinary API 키

### 3️⃣ CLOUDINARY_API_SECRET
- **값**: `i8Ur-N8rGkcLQY3BwrHuA6chJnc`
- **설명**: Cloudinary API Secret (절대 공개하지 마세요!)

### 4️⃣ FIREBASE_SERVICE_ACCOUNT
- **값**: `backend/serviceAccountKey.json` 파일의 **전체 내용**
- **설명**: Firebase Admin SDK 서비스 계정 키 (JSON 전체)

**예시 형식:**
```json
{
  "type": "service_account",
  "project_id": "recordmoa",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...@recordmoa.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## 🔧 설정 방법

### 1. GitHub 저장소 접속

https://github.com/jewjd0/RecordMOA

### 2. Settings 탭 이동

저장소 페이지 상단의 **Settings** 클릭

### 3. Secrets and variables 메뉴

왼쪽 사이드바에서:
- **Secrets and variables** 클릭
- **Actions** 클릭

### 4. New repository secret 클릭

우측 상단의 **"New repository secret"** 버튼 클릭

### 5. Secrets 추가 (4번 반복)

각 Secret을 하나씩 추가:

#### Secret 1: CLOUDINARY_CLOUD_NAME
- **Name**: `CLOUDINARY_CLOUD_NAME`
- **Secret**: `dfk1ojppr`
- **Add secret** 클릭

#### Secret 2: CLOUDINARY_API_KEY
- **Name**: `CLOUDINARY_API_KEY`
- **Secret**: `262367615116935`
- **Add secret** 클릭

#### Secret 3: CLOUDINARY_API_SECRET
- **Name**: `CLOUDINARY_API_SECRET`
- **Secret**: `i8Ur-N8rGkcLQY3BwrHuA6chJnc`
- **Add secret** 클릭

#### Secret 4: FIREBASE_SERVICE_ACCOUNT
- **Name**: `FIREBASE_SERVICE_ACCOUNT`
- **Secret**: `backend/serviceAccountKey.json` 파일을 열어서 **전체 내용**을 복사해서 붙여넣기
- **Add secret** 클릭

---

## ✅ 확인

Secrets 페이지에서 다음 4개가 보이면 성공:

```
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
FIREBASE_SERVICE_ACCOUNT
```

⚠️ **주의**: Secret 값은 한번 저장하면 다시 볼 수 없습니다. 수정만 가능합니다.

---

## 🚀 GitHub Actions 실행

### 자동 실행
- 매일 오전 3시(한국시간)에 자동으로 실행됩니다
- 아무 것도 하지 않아도 됩니다

### 수동 실행 (테스트용)

1. GitHub 저장소 → **Actions** 탭
2. 왼쪽에서 **"Cleanup Cloudinary Images"** 워크플로우 클릭
3. 우측의 **"Run workflow"** 버튼 클릭
4. **"Run workflow"** 확인 버튼 클릭

실행 결과는 Actions 탭에서 확인할 수 있습니다.

---

## 🔐 보안 주의사항

### ❌ 절대 하지 말아야 할 것

1. **Secrets를 코드에 직접 입력하지 마세요**
   - `.env` 파일을 Git에 커밋하지 마세요
   - `serviceAccountKey.json`을 Git에 커밋하지 마세요

2. **Public 저장소에서 Secrets 사용 주의**
   - Fork된 저장소에서는 Secrets가 공유되지 않습니다
   - Pull Request에서는 Secrets가 노출될 수 있습니다

### ✅ 안전하게 사용하는 방법

- ✅ GitHub Secrets 사용
- ✅ `.gitignore`에 민감한 파일 추가
- ✅ Private 저장소 사용 권장

---

## 📊 실행 로그 확인

### 성공 시

```
🚀 Cloudinary 이미지 정리 스크립트 시작

🔍 삭제 대기 중인 이미지 조회...
📋 총 3개의 이미지를 삭제합니다.
✅ 삭제 완료: recordmoa/user123/movie/abc123
✅ 삭제 완료: recordmoa/user123/book/def456
✅ 삭제 완료: recordmoa/user123/place/ghi789

📊 삭제 결과:
  ✅ 성공: 3개
  ❌ 실패: 0개

🧹 오래된 삭제 기록 정리 중...
✅ 2개의 오래된 기록을 정리했습니다.

✅ 완료!
```

### 실패 시

Actions 탭에서 빨간색 X 표시가 나타나면:
1. 해당 워크플로우 클릭
2. 실패한 Step 확인
3. 에러 메시지 확인

**일반적인 에러:**
- Secret이 잘못 설정됨 → Secrets 다시 확인
- Firestore 인덱스 없음 → Firebase Console에서 인덱스 생성
- API 할당량 초과 → Cloudinary 플랜 확인

---

## ❓ 문제 해결

### Q: Workflow가 실행되지 않아요
A: `.github/workflows/cleanup-images.yml` 파일이 `main` 브랜치에 푸시되었는지 확인하세요.

### Q: Secret을 잘못 입력했어요
A: Settings → Secrets → 해당 Secret → Update 버튼으로 수정 가능합니다.

### Q: Firebase 인증 에러가 나요
A: `FIREBASE_SERVICE_ACCOUNT`의 JSON 형식이 올바른지 확인하세요. 전체 JSON을 복사해야 합니다.

### Q: 실행 시간을 변경하고 싶어요
A: `.github/workflows/cleanup-images.yml` 파일의 `cron: '0 18 * * *'` 부분을 수정하세요.
   - `0 18 * * *`: 매일 오전 3시(KST)
   - `0 0 * * 0`: 매주 일요일 오전 9시(KST)
   - Cron 문법: https://crontab.guru/

---

**설정이 완료되면 이 문서는 삭제하거나 private 저장소로 옮기는 것을 권장합니다!**
