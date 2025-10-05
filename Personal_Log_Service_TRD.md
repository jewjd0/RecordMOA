# 기술 요구사항 명세서 (TRD)

## 1. 개요
본 문서는 개인 기록 서비스의 기술적 구현을 위한 요구사항을 정의한다. 사용자는 영화, 도서, 장소에 대한 리뷰를 기록하고, 이를 시각화된 형태로 확인할 수 있다. 백엔드는 Firebase를 기반으로 구성한다.

---

## 2. 기술 스택
- **Frontend:** React (Next.js), Tailwind CSS, Chart.js, Firebase SDK
- **Backend:** Firebase Authentication, Cloud Firestore, Firebase Storage, Firebase Hosting
- **배포:** Firebase Hosting
- **디자인:** Figma

---

## 3. 시스템 구조
- **클라이언트** → **Firebase Authentication** (로그인/회원가입)
- **Firestore Database** (데이터 저장 및 조회)
- **Firebase Storage** (이미지 업로드 및 관리)
- **Chart.js** (통계 데이터 시각화)

---

## 4. 데이터 구조 (Firestore)

### 4.1 Users
| 필드명 | 타입 | 설명 |
|--------|------|------|
| user_id | string | 사용자 UID |
| email | string | 사용자 이메일 |
| name | string | 사용자 이름 |
| created_at | timestamp | 가입 일자 |

### 4.2 Records
| 필드명 | 타입 | 설명 |
|--------|------|------|
| record_id | string | 고유 ID |
| user_id | string | 사용자 UID (참조) |
| category | string | media, book, place 중 하나 |
| title | string | 제목 |
| author_director | string | 저자/감독 |
| cast | array | 출연자 목록 (영화 전용) |
| publisher | string | 출판사 (도서 전용) |
| location | string | 위치 (장소 전용) |
| date_watched | timestamp | 시청한 날짜 (영화 전용) |
| date_started | timestamp | 읽기 시작한 날짜 (도서 전용) |
| date_finished | timestamp | 다 읽은 날짜 (도서 전용) |
| date_visited | timestamp | 방문한 날짜 (장소 전용) |
| rating | number | 별점 (1~5) |
| image_url | string | 이미지 경로 (포스터/표지/사진) |
| review | string | 리뷰 내용 |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

### 4.3 Statistics
| 필드명 | 타입 | 설명 |
|--------|------|------|
| user_id | string | 사용자 UID |
| total_records | number | 전체 기록 수 |
| average_rating | number | 평균 평점 |
| recent_categories | map | 최근 기록된 카테고리별 요약 |
| updated_at | timestamp | 갱신 시간 |

---

## 5. 주요 기능별 기술 구현

### 5.1 입력 페이지
- **UI 구성:** 카테고리 선택 후 폼 노출 (조건부 렌더링)
- **이미지 업로드:** Firebase Storage 사용, 업로드 후 URL을 Firestore에 저장
- **평점 입력:** 별점 컴포넌트 구현 (클릭 시 상태 갱신)
- **날짜 입력:** DatePicker 컴포넌트 사용

### 5.2 기록 리스트 페이지
- Firestore에서 `user_id` 기반 쿼리로 데이터 조회
- 카테고리별 필터링 및 정렬 기능 구현
- Floating Button으로 작성 페이지 이동

### 5.3 통계 페이지
- Chart.js를 사용하여 시각화 (원형 차트, 막대 그래프)
- 최근 작성 데이터 기반 요약 카드 표시
- “자세히 보기” 클릭 시 세부 통계 페이지로 이동

---

## 6. 인증 및 보안
- Firebase Authentication (Google, Email 기반 로그인)
- Firestore 보안 규칙:
  - `records` 문서는 본인(`user_id == request.auth.uid`)만 읽기/쓰기 가능
  - `users` 문서는 생성 시 자동 UID 매핑

---

## 7. 에러 처리 및 로깅
- **Firebase Error Code** 기반 에러 핸들링
- 네트워크 에러 시 사용자 알림 표시
- 로그는 Firebase Analytics로 수집

---

## 8. 배포 및 버전 관리
- Firebase Hosting으로 배포 자동화 (GitHub Actions 연동)
- `.env` 파일로 Firebase 설정 분리
- 버전 관리: Git / GitHub Flow 전략 적용

---

## 9. 향후 확장 계획
- AI 리뷰 요약 기능 추가 (OpenAI API)
- 친구 간 기록 공유 기능
- 개인별 월간 활동 리포트 자동 생성
