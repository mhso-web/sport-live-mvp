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

### 15. 사용자 프로필 시스템 구현 (2025-07-31)
- [x] 프로필 페이지 구현 (/profile/[id])
  - [x] 사용자 정보 표시 (닉네임, 레벨, 경험치)
  - [x] 활동 통계 (게시글/댓글 수, 받은 좋아요, 총 조회수)
  - [x] 최근 게시글/댓글 표시
  - [x] 레벨별 색상 및 뱃지 표시
  - [x] 자기소개(bio) 표시 추가
- [x] 프로필 수정 기능
  - [x] 닉네임 변경 (중복 검사)
  - [x] 자기소개(bio) 수정
  - [x] 비밀번호 변경
- [x] 내 활동 내역 페이지 (/profile/my-activities)
  - [x] 내가 쓴 글 목록 (페이지네이션)
  - [x] 내가 쓴 댓글 목록 (페이지네이션)
  - [x] 활동 통계 표시
- [x] API 엔드포인트
  - [x] GET/PUT /api/users/[id]
  - [x] PUT /api/users/[id]/password

### 16. 유저 뱃지 시스템 구현 (2025-07-31)
- [x] UserBadge 모델 (이미 존재)
- [x] BadgeService 구현
  - [x] 뱃지 종류 정의 (레벨, 활동, 특별 뱃지)
  - [x] 뱃지 획득 조건 체크 로직
  - [x] 뱃지 부여 메소드
- [x] 뱃지 자동 획득 시스템
  - [x] 레벨업 시 레벨 뱃지 자동 부여
  - [x] 게시글/댓글 작성 수 기반 뱃지
  - [x] 받은 좋아요 수 기반 뱃지
- [x] UI 컴포넌트
  - [x] 프로필 페이지에 뱃지 표시
  - [x] 뱃지 툴팁으로 설명 표시
  - [x] 뱃지 아이콘 및 색상 디자인

### 17. 경험치 획득 내역 페이지 구현 (2025-07-31)
- [x] 경험치 로그 페이지 (/profile/experience-logs)
  - [x] 월별 경험치 획득 차트 (Chart.js)
  - [x] 최근 30일 일별 획득량 그래프
  - [x] 행동별 경험치 통계 (파이 차트)
  - [x] 경험치 획득 히스토리 (페이지네이션)
- [x] API 엔드포인트
  - [x] GET /api/users/[id]/experience-logs
  - [x] 월별/일별/행동별 통계 집계
- [x] UI 디자인
  - [x] 차트 다크테마 적용
  - [x] 반응형 레이아웃
  - [x] 애니메이션 효과

### 18. 보증업체 활동 내역 추가 (2025-07-31)
- [x] 내 활동 내역에 보증업체 탭 추가
  - [x] 좋아요한 보증업체 목록
  - [x] 댓글 단 보증업체 목록
  - [x] 별점 평가한 보증업체 목록
- [x] Repository 메소드 추가
  - [x] getUserPartnerLikes
  - [x] getUserPartnerComments
  - [x] getUserPartnerRatings
- [x] UI 구현
  - [x] 보증업체 카드 컴포넌트
  - [x] 활동 날짜 표시
  - [x] 페이지네이션 지원

### 19. Vercel 배포 이슈 해결 (2025-07-31)
- [x] 클라이언트 사이드 라우팅 문제 해결
  - [x] middleware.ts 설정 수정 (인증 필요한 라우트만 보호)
  - [x] Navigation 컴포넌트 API 실패 시 fallback 데이터 사용
  - [x] LoginForm window.location.href 리다이렉트 방식으로 변경
- [x] 동적 라우팅 404 에러 해결
  - [x] generateStaticParams 추가 (게시판 카테고리)
  - [x] force-dynamic export 추가
  - [x] PostListContent 컴포넌트 fallback 카테고리 추가
- [x] NextAuth API 라우트 404 에러 해결
  - [x] 잘못된 위치의 /api 폴더 삭제 (루트에 있던 것)
  - [x] next.config.js NEXTAUTH_URL 환경 변수 로직 수정
  - [x] .gitignore 업데이트 (환경 파일 보호)
- [x] 데이터베이스 관련 오류 해결
  - [x] comment_likes 테이블 마이그레이션 생성
  - [x] package.json에 db:migrate:deploy 스크립트 추가
  - [x] 데이터베이스 연결 수 제한 문제 해결
  - [x] prismaEdge 유틸리티 생성 (Edge Runtime 지원)
  - [x] Vercel 배포 가이드 문서 업데이트

## 예정된 작업 📋

### 다음 우선순위 작업
1. **통계 및 분석 페이지 (/admin/stats)** - ADMIN 전용
   - 사용자 증가 추이 차트
   - 게시글/댓글 활동 통계
   - 보증업체 평점 분포
   - 시간대별 활동 분석
   
2. **1:1 문의 시스템**
   - 문의 작성 폼 구현
   - 문의 목록 및 상태 관리
   - 관리자 답변 시스템
   - 문의 알림 기능

### 1. 사용자 프로필 추가 기능 (우선순위: 높음)
- [x] 프로필 페이지 개선 (완료)
  - [x] 자기소개(bio) 표시 (완료)
- [x] 유저 뱃지 시스템 (완료)
  - [x] 뱃지 획득 로직 구현
  - [x] 프로필에 뱃지 표시
  - [x] 뱃지별 획득 조건 정의
- [x] 경험치 획득 내역 (완료)
  - [x] 경험치 로그 페이지
  - [x] 일별/주별/월별 통계
  - [x] 경험치 획득 히스토리 차트

### 2. 보증업체 추가 기능
- [x] 별점 평가 기능 (생성/수정) - 완료 (2025-08-05)
- [x] 댓글 작성 기능 - 완료 (2025-08-05)
- [x] 좋아요 기능 - 완료 (2025-08-05)
- [x] 보증업체 등록/수정 (ADMIN, SUB_ADMIN) - 완료
- [x] 이미지 업로드 (본문 삽입) - 완료
- [ ] 배너 이미지 자동 생성/선택

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
- [x] 관리자 대시보드 - 완료 (2025-08-05)
- [x] 사용자 관리 - 완료 (2025-08-05)
- [x] 게시글/댓글 관리 - 완료 (2025-08-05)
- [x] 보증업체 관리 - 완료
- [ ] 통계 및 분석 (상세 페이지)

### 7. 기타 기능
- [x] 이미지 업로드 시스템 - 완료 (보증업체용)
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

### Vercel 배포 환경 문제 종합 해결 (2025-07-31)

**문제 1**: 로그인 버튼 클릭 시 무반응, 게시판 메뉴 이동 불가

**원인**: 
- 미들웨어가 모든 라우트를 차단
- Navigation 컴포넌트의 API 호출 실패 처리 미흡

**해결**:
1. 미들웨어 matcher 수정 - 인증이 필요한 라우트만 보호
2. Navigation 컴포넌트에 fallback 카테고리 추가
3. LoginForm에서 router.push 대신 window.location.href 사용

**문제 2**: NextAuth API 라우트 404 에러 (/api/auth/session)

**원인**: 
- 프로젝트 루트에 잘못된 /api 폴더 존재 (중복)
- 올바른 위치는 /app/api

**해결**:
1. 루트의 /api 폴더 삭제
2. next.config.js의 NEXTAUTH_URL 환경 변수 로직 수정

**문제 3**: 데이터베이스 연결 수 초과 (too many connections)

**원인**: 서버리스 환경에서 연결이 제대로 해제되지 않음

**해결**:
1. `prisma.ts`에 process.on('beforeExit') 핸들러 추가
2. Edge Runtime용 `prismaEdge.ts` 유틸리티 생성
3. DATABASE_URL에 `?connection_limit=5` 파라미터 추가 권장

**문서화**:
- `/docs/VERCEL_DEPLOYMENT.md` 생성
- 데이터베이스 연결 최적화 가이드 추가
- 환경 변수 설정 방법 상세 설명

### 20. 관리자 기능 구현 (2025-07-31)
- [x] 관리자 페이지 레이아웃 구현
  - [x] AdminNavigation 컴포넌트 (사이드바 메뉴)
  - [x] 권한 체크 미들웨어 (ADMIN, SUB_ADMIN만 접근)
  - [x] 모바일 반응형 사이드바
- [x] 보증업체 관리 페이지 (/admin/partners)
  - [x] 보증업체 목록 테이블
  - [x] 검색 및 필터링 (활성 상태, 이름 검색)
  - [x] 정렬 기능 (최신순, 평점순, 인기순)
  - [x] 상태 토글 기능 (활성/비활성)
  - [x] 보증업체 생성/수정 모달
  - [x] 보증업체 삭제 기능
- [x] 보증업체 이미지 업로드 기능
  - [x] 파일 업로드 API 엔드포인트 (/api/upload)
  - [x] 이미지 파일 검증 (타입, 크기)
  - [x] 본문 에디터에 이미지 삽입
  - [x] 업로드된 이미지 URL 저장
- [x] PartnerAdminService 구현
  - [x] 관리자용 필터링 로직
  - [x] DTO 검증 시스템
  - [x] 보증업체 통계 조회
- [x] 모달 버그 수정
  - [x] 배경 스크롤 방지
  - [x] 수정 모드에서 이미지 표시

### 21. 데이터베이스 마이그레이션 (2025-07-31)
- [x] 로컬 데이터베이스 → Vercel PostgreSQL 마이그레이션
  - [x] 데이터 export 스크립트 작성
  - [x] Vercel import 스크립트 작성
  - [x] 11명 사용자 데이터 마이그레이션
  - [x] 4개 보증업체 데이터 마이그레이션
  - [x] 관리자 비밀번호 재설정 스크립트
- [x] Vercel 빌드 오류 해결
  - [x] PartnerAdminFilters 타입 호환성 문제
  - [x] 누락된 zod import 추가
  - [x] Partner 생성 시 creator 필드 오류
- [x] UI 버그 수정
  - [x] 보증업체 상세 페이지 중복 네비게이션 바 제거

### 22. 보증업체 사용자 기능 구현 (2025-08-05)
- [x] PartnerService 구현
  - [x] 별점 평가 생성/수정 메소드
  - [x] 댓글 작성/삭제 메소드
  - [x] 좋아요 토글 메소드
  - [x] 경험치 시스템 연동
- [x] API 엔드포인트 구현
  - [x] GET/POST /api/partners/[id]/rating
  - [x] GET/POST /api/partners/[id]/comments
  - [x] DELETE /api/partners/[id]/comments/[commentId]
  - [x] GET/POST /api/partners/[id]/like
- [x] 프론트엔드 컴포넌트
  - [x] RatingModal - 별점 평가 모달
  - [x] CommentForm - 댓글 작성 폼
  - [x] CommentList - 댓글 목록 (페이지네이션)
  - [x] PartnerLikeButton - 좋아요 버튼
  - [x] PartnerDetailContent - 클라이언트 사이드 래퍼
- [x] 기능 통합
  - [x] 별점 평가 시 경험치 부여
  - [x] 댓글 작성 시 경험치 부여
  - [x] 좋아요 시 경험치 부여 (주는 사람/받는 사람)
  - [x] 로그인 상태 체크 및 리다이렉트
- [x] Vercel 배포 및 테스트
  - [x] GitHub 푸시 (commit: 9863f4f)
  - [x] Vercel 배포 확인 (sport-live-mvp-app.vercel.app)
  - [ ] 클라이언트 사이드 기능 디버깅 필요

### 23. 관리자 대시보드 및 관리 기능 구현 (2025-08-05)
- [x] 관리자 대시보드 개선 (/admin)
  - [x] DashboardContent 컴포넌트 구현
  - [x] AdminStatsService 구현
  - [x] 실시간 통계 위젯 (사용자, 게시글, 보증업체, 활동)
  - [x] 일별 통계 차트 (Chart.js 라이브러리 사용)
  - [x] 최근 가입 회원 목록 (실제 데이터)
  - [x] 최근 게시글 목록 (실제 데이터)
  - [x] API 엔드포인트: GET /api/admin/stats
- [x] 사용자 관리 페이지 (/admin/users) - ADMIN 전용
  - [x] UserManagementContent 컴포넌트 구현
  - [x] AdminUserService 구현
  - [x] 사용자 목록 조회 (페이지네이션)
  - [x] 검색 및 필터링 (닉네임, 이메일, 권한, 상태, 레벨)
  - [x] 정렬 기능 (가입일, 닉네임, 레벨, 최근 접속)
  - [x] 사용자 상태 토글 (활성/비활성)
  - [x] 권한 변경 기능 (UserEditModal)
  - [x] API 엔드포인트: GET /api/admin/users, PATCH [id]/status, PATCH [id]/role
- [x] 게시글/댓글 관리 페이지 (/admin/posts)
  - [x] PostManagementContent 컴포넌트 구현
  - [x] AdminPostService 구현
  - [x] 게시글/댓글 탭 구분
  - [x] 게시글 목록 (검색, 필터링, 정렬)
  - [x] 게시글 숨기기/보이기 토글
  - [x] 게시글 삭제 기능
  - [x] 댓글 목록 및 삭제 기능
  - [x] 게시판별 필터링
  - [x] API 엔드포인트: GET /api/admin/posts, DELETE [id], PATCH [id]/visibility
  - [x] API 엔드포인트: GET /api/admin/comments, DELETE [id]
  - [x] API 엔드포인트: GET /api/admin/categories
- [x] 권한별 접근 제어
  - [x] ADMIN: 모든 기능 접근 가능
  - [x] SUB_ADMIN: 사용자 관리 제외한 기능 접근
  - [x] MODERATOR: 게시글/댓글 관리만 접근
- [x] GitHub 푸시 완료 (commit: 428893f)

### 24. SEO 최적화 및 이미지 개선 (2025-08-06)
- [x] SEO 분석 및 문제점 파악
  - [x] 메타 태그 부족 확인 (Open Graph, Twitter Card 없음)
  - [x] 이미지 최적화 미사용 확인
  - [x] 과도한 force-dynamic 사용 확인
  - [x] sitemap.xml 및 robots.txt 부재 확인
- [x] 이미지 최적화 구현
  - [x] Next.js Image 컴포넌트로 전환
  - [x] 파트너 배너 이미지 최적화
  - [x] 관리자 패널 이미지 미리보기 최적화
  - [x] next.config.js 외부 이미지 도메인 설정
  - [x] 적절한 alt 텍스트 추가
  - [x] 반응형 이미지 sizes 속성 적용
- [x] 메뉴 이름 변경
  - [x] "AI 분석" → "경기 분석"으로 변경
  - [x] 메타데이터 한글화 및 개선

### 25. 더미 데이터 생성 시스템 구현 (2025-08-06)
- [x] 더미 유저 생성 (20명)
  - [x] 한국어 스포츠 관련 닉네임
  - [x] 다양한 레벨 설정 (12-50)
  - [x] 각 유저별 고유 이메일 (@test.com)
- [x] 게시판별 더미 게시글 생성
  - [x] 자유게시판: 35개 게시글
  - [x] 축구 게시판: 24개 게시글
  - [x] 야구 게시판: 28개 게시글
  - [x] e스포츠 게시판: 26개 게시글
  - [x] 농구 게시판: 21개 게시글
  - [x] 각 게시판 테마에 맞는 콘텐츠
  - [x] 랜덤 댓글 (총 133개)
  - [x] 랜덤 좋아요 (총 226개)
  - [x] 랜덤 조회수 및 작성 날짜
- [x] 보증업체 더미 데이터 생성
  - [x] 10개 보증업체 생성
  - [x] 업체별 상세 설명 및 혜택 정보
  - [x] 평점 시스템 (평균 4.3-4.6점)
  - [x] 댓글 (총 101개)
  - [x] 좋아요 (총 184개)
  - [x] 랜덤 조회수 (2,000-9,000회)
- [x] 생성 및 검증 스크립트
  - [x] /scripts/seed-dummy-data.ts
  - [x] /scripts/verify-dummy-data.ts
  - [x] /scripts/seed-dummy-partners.ts
  - [x] /scripts/verify-partner-data.ts

### 26. 테스트 데이터 생성 및 CRUD 테스트 (2025-08-07)
- [x] 테스트 유저 생성 (10명)
  - [x] testuser1~10 계정 생성
  - [x] 다양한 레벨 설정 (5-40)
  - [x] 각 유저별 고유 이메일 (@test.com)
- [x] 게시판별 테스트 게시글 생성 (총 144개)
  - [x] 자유게시판: 20개 게시글
  - [x] 축구 게시판: 28개 게시글
  - [x] 야구 게시판: 23개 게시글
  - [x] e스포츠 게시판: 22개 게시글
  - [x] 농구 게시판: 26개 게시글
  - [x] 공지사항: 25개 게시글
  - [x] 각 게시판 테마에 맞는 콘텐츠
  - [x] 랜덤 조회수 및 작성 날짜
  - [x] 랜덤 댓글 생성
- [x] Prisma 스키마 필드 매핑 수정
  - [x] viewCount → views 필드명 수정
  - [x] likeCount → likesCount 필드명 수정
  - [x] authorId 대신 user relation 사용
  - [x] boardType 필드 필수값 추가
- [x] CRUD 테스트 수행 (Playwright 자동화)
  - [x] CREATE: 게시글 작성 테스트 성공 (ID: 145, 146)
  - [x] READ: 목록 및 상세 페이지 조회 테스트 성공
  - [x] UPDATE: 게시글 수정 기능 버그 수정 및 테스트 성공
  - [x] DELETE: 게시글 삭제 기능 테스트 성공

### 27. 게시글 수정 기능 버그 수정 (2025-08-07)
- [x] 게시글 수정 페이지 오류 수정
  - [x] 문제: "Cannot read properties of undefined (reading 'username')" 오류
  - [x] 원인: PostResponseDto가 'author' 필드만 반환하고 'user' 필드 누락
  - [x] 해결: PostResponseDto에 레거시 호환을 위한 'user' 필드 추가
  - [x] 추가 수정: categoryId, role 필드 누락 문제 해결
- [x] PostResponseDto 개선
  - [x] author 필드와 user 필드 동시 제공 (하위 호환성)
  - [x] categoryId 필드 추가 (수정 폼에서 필요)
  - [x] user.level, user.role 필드 추가
- [x] 모든 CRUD 기능 정상 작동 확인
  - [x] Playwright를 통한 E2E 테스트 완료
  - [x] 수정 기능: 게시글 내용 변경 및 저장 성공
  - [x] 삭제 기능: 확인 대화상자와 함께 정상 작동

