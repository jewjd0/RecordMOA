# Firestore Security Rules 가이드

## 개요
이 문서는 RecordMOA 프로젝트의 Firestore 보안 규칙에 대한 설명입니다.

## 보안 규칙 적용 방법

### Firebase Console에서 적용
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Firestore Database** 선택
4. **규칙(Rules)** 탭 클릭
5. `firestore.rules` 파일의 내용을 복사하여 붙여넣기
6. **게시** 버튼 클릭

### Firebase CLI로 배포
```bash
# Firebase CLI 설치 (설치되지 않은 경우)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firestore Rules 배포
firebase deploy --only firestore:rules
```

---

## 보안 규칙 구조

### 1. Helper Functions
재사용 가능한 검증 함수들입니다.

```javascript
function isAuthenticated()
// 사용자가 인증되었는지 확인

function isOwner(userId)
// 요청한 사용자가 해당 리소스의 소유자인지 확인

function isValidString(value, minLen, maxLen)
// 문자열 길이 검증

function isValidRating(rating)
// 별점이 1-5 사이인지 검증

function isValidCategory(category)
// 카테고리가 유효한지 검증 (movie, book, place)
```

---

## 2. Records 컬렉션 규칙

### 읽기 (Read)
```javascript
allow read: if isAuthenticated() && resource.data.user_id == request.auth.uid;
```
- **조건**: 인증된 사용자가 자신의 기록만 읽을 수 있음

### 생성 (Create)
```javascript
allow create: if isAuthenticated()
  && request.resource.data.user_id == request.auth.uid
  && isValidCategory(request.resource.data.category)
  && isValidString(request.resource.data.title, 1, 200)
  && isValidRating(request.resource.data.rating)
  && isValidString(request.resource.data.review, 1, 5000)
  && request.resource.data.created_at is timestamp
  && request.resource.data.updated_at is timestamp;
```
- **조건**:
  - 인증된 사용자만 생성 가능
  - user_id는 요청자의 uid와 일치해야 함
  - category는 'movie', 'book', 'place' 중 하나
  - title은 1-200자
  - rating은 1-5 사이의 정수
  - review는 1-5000자
  - created_at과 updated_at은 timestamp 타입

### 수정 (Update)
```javascript
allow update: if isAuthenticated()
  && resource.data.user_id == request.auth.uid
  && request.resource.data.user_id == resource.data.user_id
  && request.resource.data.created_at == resource.data.created_at
  && isValidCategory(request.resource.data.category)
  && isValidString(request.resource.data.title, 1, 200)
  && isValidRating(request.resource.data.rating)
  && isValidString(request.resource.data.review, 1, 5000)
  && request.resource.data.updated_at is timestamp;
```
- **조건**:
  - 인증된 사용자가 자신의 기록만 수정 가능
  - **user_id 변경 불가** (불변)
  - **created_at 변경 불가** (불변)
  - 나머지 필드는 생성 시와 동일한 검증

### 삭제 (Delete)
```javascript
allow delete: if isAuthenticated() && resource.data.user_id == request.auth.uid;
```
- **조건**: 인증된 사용자가 자신의 기록만 삭제 가능

---

## 3. Users 컬렉션 규칙

### 읽기 (Read)
```javascript
allow read: if isAuthenticated() && isOwner(userId);
```
- **조건**: 인증된 사용자가 자신의 프로필만 읽을 수 있음

### 생성 (Create)
```javascript
allow create: if isAuthenticated()
  && isOwner(userId)
  && request.resource.data.uid == userId
  && isValidString(request.resource.data.name, 1, 50)
  && isValidString(request.resource.data.email, 1, 100)
  && request.resource.data.created_at is timestamp
  && request.resource.data.updated_at is timestamp;
```
- **조건**:
  - 인증된 사용자만 생성 가능
  - 문서 ID와 uid가 일치해야 함
  - name은 1-50자
  - email은 1-100자
  - created_at과 updated_at은 timestamp 타입

### 수정 (Update)
```javascript
allow update: if isAuthenticated()
  && isOwner(userId)
  && request.resource.data.uid == resource.data.uid
  && request.resource.data.email == resource.data.email
  && request.resource.data.created_at == resource.data.created_at
  && isValidString(request.resource.data.name, 1, 50)
  && request.resource.data.updated_at is timestamp;
```
- **조건**:
  - 인증된 사용자가 자신의 프로필만 수정 가능
  - **uid 변경 불가** (불변)
  - **email 변경 불가** (불변)
  - **created_at 변경 불가** (불변)
  - name만 수정 가능 (1-50자)

### 삭제 (Delete)
```javascript
allow delete: if isAuthenticated() && isOwner(userId);
```
- **조건**: 인증된 사용자가 자신의 프로필만 삭제 가능

---

## 4. 기본 거부 규칙
```javascript
match /{document=**} {
  allow read, write: if false;
}
```
- 명시적으로 허용되지 않은 모든 접근은 거부됩니다.

---

## 보안 강화 포인트

### ✅ 인증 강제
- 모든 작업은 인증된 사용자만 수행 가능

### ✅ 소유권 검증
- 사용자는 자신의 데이터만 읽기/쓰기/수정/삭제 가능

### ✅ 데이터 무결성
- 중요한 필드(user_id, created_at, uid, email)는 변경 불가
- 타임스탬프 필드는 반드시 timestamp 타입

### ✅ 데이터 유효성 검증
- 문자열 길이 제한 (DoS 공격 방지)
- 카테고리 값 제한 (허용된 값만 사용)
- 별점 범위 제한 (1-5)

### ✅ 명시적 거부
- 규칙에 명시되지 않은 모든 접근은 기본적으로 거부

---

## 주의사항

1. **규칙 배포 후 테스트 필수**
   - Firebase Console의 Rules Playground에서 테스트 가능
   - 실제 앱에서도 기능 테스트 필요

2. **프론트엔드 검증도 함께 유지**
   - 보안 규칙은 최후의 방어선
   - 클라이언트에서도 입력 검증 필요

3. **규칙 변경 시 주의**
   - 기존 데이터와의 호환성 고려
   - 배포 전 충분한 테스트

4. **성능 고려**
   - 복잡한 규칙은 쿼리 성능에 영향
   - 필요한 경우 인덱스 추가

---

## 테스트 방법

### Firebase Console에서 테스트
1. Firestore Database > 규칙 > **Rules Playground** 클릭
2. 시뮬레이션 실행:
   - 인증된 사용자로 자신의 데이터 읽기: ✅ 허용
   - 인증된 사용자로 다른 사용자 데이터 읽기: ❌ 거부
   - 비인증 사용자 접근: ❌ 거부
   - 잘못된 데이터 형식으로 생성: ❌ 거부

---

## 추가 개선 사항 (향후)

- [ ] Rate Limiting (요청 빈도 제한)
- [ ] IP 기반 접근 제어
- [ ] 관리자 권한 추가
- [ ] 공유 기능 추가 시 읽기 권한 확장
