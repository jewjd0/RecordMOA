# 🔧 백엔드 스크립트 설정 가이드

## ✅ 1단계: Cloudinary API 키 확인

1. **Cloudinary Console 접속**
   - https://console.cloudinary.com/ 접속
   - 로그인

2. **API 정보 확인**
   - Dashboard 화면 상단의 **"Product Environment Credentials"** 섹션 확인
   - 또는 Settings → Product Environments에서 확인

3. **필요한 정보:**
   ```
   Cloud Name: dfk1ojppr (이미 설정됨)
   API Key: 123456789012345 (복사 필요)
   API Secret: abcdefghijklmnopqrs (복사 필요)
   ```

4. **.env 파일 수정**
   - `backend/.env` 파일 열기
   - `YOUR_CLOUDINARY_API_KEY_HERE`를 실제 API Key로 교체
   - `YOUR_CLOUDINARY_API_SECRET_HERE`를 실제 API Secret으로 교체

   ```env
   CLOUDINARY_CLOUD_NAME=dfk1ojppr
   CLOUDINARY_API_KEY=123456789012345  ← 여기 입력
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrs  ← 여기 입력
   ```

---

## ✅ 2단계: Firebase Admin SDK 키 다운로드

1. **Firebase Console 접속**
   - https://console.firebase.google.com/
   - 프로젝트 선택: **recordmoa**

2. **서비스 계정 키 생성**
   - 톱니바퀴 아이콘 ⚙️ 클릭 → **프로젝트 설정**
   - 왼쪽 탭에서 **서비스 계정** 클릭
   - 하단의 **"새 비공개 키 생성"** 버튼 클릭
   - **"키 생성"** 확인 버튼 클릭

3. **JSON 파일 저장**
   - 자동으로 다운로드된 JSON 파일을 `backend` 폴더에 저장
   - 파일 이름을 **`serviceAccountKey.json`**으로 변경

   ```
   레코드모아/
   └── backend/
       ├── cleanup-images.js
       ├── package.json
       ├── .env
       └── serviceAccountKey.json  ← 여기에 저장!
   ```

---

## ✅ 3단계: 스크립트 실행

### 방법 1: npm 명령어로 실행

```bash
cd backend
npm run cleanup
```

### 방법 2: node 명령어로 직접 실행

```bash
cd backend
node cleanup-images.js
```

---

## 📊 실행 결과 예시

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
✅ 5개의 오래된 기록을 정리했습니다.

✅ 완료!
```

---

## 🔄 정기적으로 실행하기 (선택사항)

### Windows 작업 스케줄러

1. **작업 스케줄러** 실행
2. **"기본 작업 만들기"** 클릭
3. 이름: "RecordMOA 이미지 정리"
4. 트리거: 매일 자정
5. 작업: 프로그램 시작
   - 프로그램: `node`
   - 인수: `cleanup-images.js`
   - 시작 위치: `C:\PJH_Projects\비사이드\레코드모아\backend`

---

## ❓ 문제 해결

### "Cannot find module 'firebase-admin'" 에러
```bash
cd backend
npm install
```

### "serviceAccountKey.json not found" 에러
- Firebase Console에서 서비스 계정 키를 다운로드했는지 확인
- 파일 이름이 정확히 `serviceAccountKey.json`인지 확인
- `backend` 폴더에 저장되어 있는지 확인

### "Invalid API credentials" 에러
- `.env` 파일의 Cloudinary API Key/Secret이 올바른지 확인
- Cloudinary Console에서 다시 복사해서 붙여넣기

### "Permission denied" 에러
- Firebase 프로젝트의 서비스 계정 키가 올바른지 확인
- Firestore Rules가 올바르게 설정되어 있는지 확인

---

## 🔒 보안 주의사항

⚠️ **절대 Git에 커밋하지 마세요:**
- `serviceAccountKey.json`
- `.env`

이미 `.gitignore`에 추가되어 있지만, 한 번 더 확인하세요!

```bash
# .gitignore 확인
cat backend/.gitignore
```

---

## 📝 참고사항

- 삭제 대기 이미지는 Firestore `pending_image_deletions` 컬렉션에 저장됩니다
- 스크립트는 30일 이상 된 삭제 완료 기록을 자동으로 정리합니다
- 삭제 실패한 항목은 수동으로 확인할 수 있습니다
