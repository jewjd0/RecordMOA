# 개인 기록 서비스 PRD (Product Requirements Document)

## 1. 개요
**프로젝트명:** 개인 기록 시각화 서비스  
**목표:** 미디어(영화, 책), 활동(장소 방문) 기록을 한 곳에서 관리하고, 이를 시각화하여 사용자가 자신의 생활 패턴을 직관적으로 이해할 수 있도록 돕는 개인 기록 웹서비스 개발.

## 2. 주요 기능
1. **기록 입력 기능**  
   - 영화, 도서, 활동(장소) 등 다양한 개인 기록 입력 가능.
   - 간단한 메모 및 감정 기록 지원.
2. **기록 관리 기능**  
   - 카테고리별, 기간별 정렬 및 필터링.
   - 수정/삭제 기능 제공.
3. **시각화 기능**  
   - 카테고리별 활동 빈도, 감정 변화, 시간 흐름에 따른 패턴 시각화.
4. **통계 및 인사이트 제공**  
   - 가장 많이 본 장르, 읽은 저자, 방문 지역 등 요약 인사이트 제공.
5. **Firebase 기반 데이터 저장 및 인증 관리.**

## 3. 페이지 구성
### 3.1 입력 페이지
사용자가 기록을 추가하는 페이지. 카테고리별 입력 항목이 다름.

#### (1) 영화 기록 입력
- 제목 (title)
- 감독 (director)
- 시청한 날짜 (watched_date)
- 장르 (genre)
- 별점 (rating)
- 감상 메모 (review)

#### (2) 도서 기록 입력
- 제목 (title)
- 저자 (author)
- 출판사 (publisher)
- 읽기 시작한 날짜 (start_date)
- 다 읽은 날짜 (finish_date)
- 별점 (rating)
- 감상 메모 (review)

#### (3) 장소 방문 기록 입력
- 장소명 (place_name)
- 위치 (location)
- 방문한 날짜 (visited_date)
- 활동 내용 (activity_note)
- 감정 (emotion)

### 3.2 기록 목록 페이지
- 전체 기록 또는 특정 카테고리별로 리스트 표시.
- 최신순 / 과거순 정렬.
- 검색 및 필터 기능 (날짜, 카테고리, 감정 등).

### 3.3 시각화 페이지
- **캘린더 뷰:** 날짜별 기록 표시.
- **차트 뷰:** 활동 빈도, 감정 분포, 시간 흐름 시각화.
- **인사이트 뷰:** 가장 많이 본 영화 장르, 가장 많이 방문한 지역 등 요약 지표 제공.

### 3.4 설정 및 사용자 관리
- 로그인/회원가입 (Firebase Auth)
- 데이터 백업 및 초기화

## 4. 기술 스택
- **Frontend:** React (Next.js or Vite), TailwindCSS, Recharts
- **Backend:** Firebase (Firestore, Authentication, Storage)
- **배포:** Firebase Hosting

## 5. 데이터 구조 (Firebase 기준 요약)
```plaintext
users/{userId}
  ├── profile: {name, email, created_at}
  ├── records/
  │     ├── movies/{recordId}: {title, director, watched_date, genre, rating, review}
  │     ├── books/{recordId}: {title, author, publisher, start_date, finish_date, rating, review}
  │     └── places/{recordId}: {place_name, location, visited_date, activity_note, emotion}
```

## 6. ERD 요약
**User (1) — (N) Record** 관계  
- `User` : 사용자 정보 (user_id, name, email)
- `Record` : 공통 필드 (record_id, category, created_at, emotion)
  - `MovieRecord` (title, director, watched_date, genre, rating, review)
  - `BookRecord` (title, author, publisher, start_date, finish_date, rating, review)
  - `PlaceRecord` (place_name, location, visited_date, activity_note, emotion)

## 7. MVP 범위
- 로그인 및 사용자별 데이터 저장
- 영화, 도서, 장소 기록 입력 및 수정
- 기록 목록 표시 (필터 포함)
- 간단한 시각화 (차트, 캘린더)

## 8. 향후 개선 방향
- 태그 기반 감정 분석 기능
- 일별 요약 자동 생성
- SNS 공유 및 월간 리포트 생성

