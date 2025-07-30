# Sports Live 구현 현황 (Implementation Status)

> 📌 **이 문서의 목적**: 현재 구현된 기능과 기술적 이슈를 추적합니다.
> 전체 프로젝트 로드맵은 `/PROJECT_ROADMAP.md`를 참고하세요.

## 완료된 작업 ✅

### 1. 기본 설정 및 인증
- [x] Next.js 14 프로젝트 초기 설정
- [x] Prisma + PostgreSQL 데이터베이스 연동
- [x] NextAuth.js JWT 기반 인증 시스템
- [x] 회원가입/로그인 페이지 구현
- [x] 사용자 권한 체계 (USER, ANALYST, MODERATOR, SUB_ADMIN, ADMIN)
- [x] 미들웨어 기반 라우트 보호

### 2. UI/UX 디자인
- [x] 다크 & 골드 럭셔리 테마 구현
- [x] 반응형 네비게이션 바
- [x] 게시판 드롭다운 메뉴
- [x] 모바일 최적화
- [x] 커스텀 드롭다운 UI (보증업체 정렬)

### 3. 게시판 시스템
- [x] 유연한 게시판 카테고리 구조 (BoardCategory)
- [x] 게시글 CRUD API
- [x] Repository 패턴 구현
- [x] Service Layer 구현
- [x] DTO 검증 시스템
- [x] 게시판 목록 페이지 (2열 그리드)
- [x] 각 게시판별 게시글 목록
- [x] 공지사항 독립 페이지 구현 (/notice)

### 4. 데이터베이스 모델
- [x] User (SUB_ADMIN 권한 추가)
- [x] Post & BoardCategory
- [x] Comment & PostLike
- [x] Partner (보증업체)
- [x] PartnerRating, PartnerComment, PartnerLike
- [x] LiveMatch (실시간 중계)
- [x] Inquiry & InquiryResponse (1:1 문의)

### 5. 상단 네비게이션 메뉴
- [x] 메뉴 순서 재구성: 실시간 중계 | 경기 | 게시판 | AI 분석 | 보증업체 | 공지사항 | 고객센터
- [x] 게시판 드롭다운 (COMMUNITY 카테고리만 표시)
- [x] 공지사항 독립 메뉴로 분리

### 6. 페이지 구현
- [x] matches 페이지 (경기 일정)
- [x] analysis 페이지 (AI 분석)
- [x] live 페이지 (실시간 중계 - 기본 UI)

### 7. 고객센터 시스템
- [x] 고객센터 페이지 구현 (/support)
- [x] 공지사항 탭 (NOTICE 게시판 연동)
- [x] FAQ 탭 (하드코딩된 FAQ)
- [x] 1:1 문의 탭 (UI만 구현)

### 8. 보증업체 시스템
- [x] 보증업체 목록 페이지 (/partners)
  - [x] 카드 그리드 레이아웃
  - [x] 정렬 옵션: 최신순, 별점순, 인기순
  - [x] 별점 평균 표시
  - [x] 댓글 수, 좋아요 수 표시
- [x] 보증업체 상세 페이지 (/partners/[id])
  - [x] 상세 정보 표시
  - [x] 댓글 목록 표시
  - [x] 평점 및 통계 표시
  - [x] 조회수 자동 증가
- [x] 보증업체 API 엔드포인트
- [x] 보증업체 Repository 구현
- [x] Seed 데이터 생성 스크립트

### 9. 게시판 시스템 완성 (2025-07-22)
- [x] 게시글 상세 페이지 구현
- [x] 게시글 작성 페이지 (현재 게시판 자동 설정)
- [x] 게시글 수정 페이지 (작성자/관리자 권한)
- [x] 댓글 시스템 구현 (대댓글 포함)
- [x] 조회수 증가 로직 (PostViewCounter)
- [x] 댓글 입력 포커스 문제 해결 (React.memo)
- [x] 게시판 데이터 실시간 갱신
- [x] API 라우트 및 서버 컴포넌트 동적 렌더링 설정
- [x] 코딩 가이드라인 문서 작성 (CODING_GUIDELINES.md)

### 10. 게시판 추가 기능 구현 (2025-07-22)
- [x] 좋아요 기능 구현 (게시글 및 댓글)
  - [x] PostLike API 엔드포인트 (/api/posts/[id]/like)
  - [x] CommentLike 모델 생성 및 마이그레이션
  - [x] CommentLike API 엔드포인트 (/api/comments/[id]/like)
  - [x] LikeButton 컴포넌트 (게시글용)
  - [x] CommentLikeButton 컴포넌트 (댓글용)
- [x] 게시글 검색 기능
  - [x] PostSearch 컴포넌트 구현
  - [x] 제목 및 내용 검색 (대소문자 구분 없음)
  - [x] 게시판별 검색 지원
  - [x] 검색 결과 개수 표시
  - [x] 검색어 초기화 기능

### 11. 페이지네이션 개선 (2025-07-31)
- [x] 재사용 가능한 Pagination 컴포넌트 구현
- [x] 처음/마지막 페이지 이동 버튼 추가
- [x] 현재 페이지 하이라이트
- [x] 페이지 범위 표시 (1-10, 11-20 등)
- [x] 모바일 반응형 디자인

### 12. 레벨업 시스템 구현 (2025-07-31)
- [x] 경험치 및 레벨 시스템 설계
  - [x] UserExperienceLog 테이블 생성
  - [x] 경험치 테이블 정의 (게시글: 10, 댓글: 5, 좋아요: 2 등)
  - [x] 레벨별 필요 경험치 테이블 (1~20레벨)
- [x] ExperienceService 구현
  - [x] 경험치 부여 메소드
  - [x] 레벨 계산 로직
  - [x] 일일 로그인 보상
  - [x] 경험치 통계 조회
- [x] 레벨별 혜택 시스템
  - [x] 닉네임 색상 차별화 (브론즈/실버/골드/다이아/마스터)
  - [x] 레벨 뱃지 표시
  - [x] 댓글 쿨타임 감소 (1레벨 60초 → 20레벨 5초)
- [x] UI 컴포넌트
  - [x] LevelProgressBar 컴포넌트
  - [x] 네비게이션에 레벨/경험치 표시
  - [x] 게시글/댓글에 작성자 레벨 표시

### 13. 경험치 시스템 통합 (2025-07-31)
- [x] 게시글 작성 시 경험치 부여
- [x] 댓글 작성 시 경험치 부여
- [x] 좋아요 클릭/받을 때 경험치 부여
- [x] 첫 게시글 작성 보너스
- [x] 경험치 실시간 반영 개선
  - [x] API 응답에 최신 레벨/경험치 포함
  - [x] useUpdateSession 훅 구현
  - [x] 세션 자동 업데이트

### 14. 경험치 어뷰징 방지 (2025-07-31)
- [x] 댓글 중복 경험치 차단
  - [x] 같은 게시글에 여러 댓글 작성 가능
  - [x] 경험치는 첫 댓글에만 부여
  - [x] 자기 게시글 댓글은 경험치 없음
- [x] 자기 게시글 좋아요 차단
  - [x] API 레벨에서 차단
  - [x] 에러 메시지 표시

## 예정된 작업 📋

### 1. 사용자 기능 (우선순위: 높음)
- [ ] 프로필 페이지
- [ ] 프로필 수정 기능
- [ ] 내 글/댓글 목록
- [ ] 알림 시스템

### 2. 보증업체 추가 기능
- [ ] 별점 평가 기능 (생성/수정)
- [ ] 댓글 작성 기능
- [ ] 좋아요 기능
- [ ] 보증업체 등록/수정 (ADMIN, SUB_ADMIN)
- [ ] 배너 이미지 업로드

### 3. 고객센터 추가 기능
- [ ] 1:1 문의 작성 기능
- [ ] 문의 목록 및 상태 관리
- [ ] 관리자 답변 시스템
- [ ] 문의 알림 기능

### 4. 실시간 중계 상세 구현
- [ ] 중계 목록 필터링 (종목별, 상태별)
- [ ] 카드/리스트 뷰 전환
- [ ] 경기 정보 상세 표시
- [ ] 실시간 스코어 업데이트
- [ ] 채팅방 입장 연동

### 5. 실시간 채팅 시스템
- [ ] WebSocket 서버 구축
- [ ] 채팅방 관리 시스템
- [ ] 메시지 실시간 전송
- [ ] 사용자 인증 연동
- [ ] 메시지 필터링
- [ ] Redis 기반 스케일링


### 6. 관리자 기능
- [ ] 관리자 대시보드
- [ ] 사용자 관리
- [ ] 게시글/댓글 관리
- [ ] 보증업체 관리
- [ ] 통계 및 분석

### 7. 기타 기능
- [ ] 이미지 업로드 시스템
- [ ] 파일 업로드 (첨부파일)
- [ ] 이메일 인증
- [ ] 비밀번호 재설정
- [ ] 소셜 로그인

## 기술 스택 📚

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (JWT)
- **Deployment**: Vercel

## 주요 고려사항 ⚠️

1. **SEO 최적화**
   - 서버 사이드 렌더링 활용
   - 메타데이터 관리
   - 구조화된 데이터

2. **성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - 캐싱 전략

3. **보안**
   - SQL Injection 방지 (Prisma)
   - XSS 방지
   - CSRF 보호
   - 권한 체크

4. **확장성**
   - Repository 패턴으로 데이터 접근 계층 분리
   - Service Layer로 비즈니스 로직 분리
   - 마이크로서비스 전환 가능한 구조

## 기술적 결정사항 및 이슈 📝

### API Routes Dynamic 설정 (2025-07-22)

**문제**: Next.js 14에서 API 라우트들이 정적 생성을 시도하면서 `DYNAMIC_SERVER_USAGE` 에러 발생

**해결**: 모든 API 라우트에 `export const dynamic = 'force-dynamic'` 추가

**영향 및 고려사항**:
1. **성능**: 
   - 모든 API 요청이 실시간 처리되어 캐싱 이점을 받지 못함
   - 향후 트래픽 증가 시 각 API 특성에 맞게 캐싱 전략 세분화 필요

2. **보안**: 
   - 문제없음 - API 라우트는 원래 동적이어야 함
   - 인증/권한 검사가 매 요청마다 실행되어 오히려 안전

3. **백엔드 분리**:
   - 향후 백엔드 서버 분리 시 영향 없음
   - Next.js API Routes를 제거하고 외부 API로 전환 가능

**향후 개선방안**:
```typescript
// 공개 데이터 (게시판 목록, 파트너 목록)
export const revalidate = 300 // 5분마다 재검증

// 인증 필요한 라우트
export const dynamic = 'force-dynamic'

// 조회수 같은 단순 업데이트
export const runtime = 'edge' // Edge Runtime 활용
```

### 조회수 중복 증가 문제 해결 (2025-07-22)

**문제**: 게시글 조회 시 조회수가 2씩 증가

**원인**: 
- `postService.findById()`에서 조회수 증가
- `PostViewCounter` 컴포넌트에서도 조회수 증가

**해결**: `postService.findById()`에서 조회수 증가 로직 제거

### 게시판 데이터 캐싱 문제 (2025-07-22)

**문제**: 다른 메뉴에서 게시판으로 돌아올 때 최신 데이터가 반영되지 않음

**해결**:
1. 페이지 포커스/visibility change 이벤트 리스너 추가
2. fetch 요청에 `cache: 'no-store'` 옵션 추가

### TypeScript 빌드 에러들 (2025-07-22)

1. **Comment 타입 재귀 문제**: `transformComments` 헬퍼 함수로 해결
2. **PaginationParams 타입 불일치**: `orderDir` → `order`로 통일
3. **Repository delete 메서드**: `Promise<void>` 반환으로 통일
4. **useSearchParams 에러**: Suspense boundary로 해결

### Vercel 빌드 환경 문제 해결 (2025-07-22)

**문제**: 서버 컴포넌트에서 404 에러 발생

**원인**: Next.js가 정적 생성을 시도하면서 데이터베이스 접근 실패

**해결**: 
```typescript
export const dynamic = 'force-dynamic'
```

**적용된 페이지**:
- `/posts/page.tsx` - 전체 게시판 목록
- `/notice/page.tsx` - 공지사항 페이지
- `/partners/[id]/page.tsx` - 보증업체 상세 페이지

### Prisma 연결 풀 오류 (2025-07-22)

**문제**: "Too many database connections opened"

**원인**: Vercel 서버리스 환경에서 Prisma 클라이언트 중복 생성

**임시 해결**: 시간이 지나면 자동으로 연결이 정리됨 (5-10분)

**근본 해결 방안** (추후 적용 예정):
- Prisma 연결 풀 설정 조정
- `connection_limit` 파라미터 추가
- Production 환경에서도 싱글톤 패턴 강화

