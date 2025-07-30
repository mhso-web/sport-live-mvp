# 컨텍스트 요약 - 2025년 7월 22일

## 세션 진행 상황

### 1. 프로젝트 초기화 및 롤백
- 좋아요/검색 기능 구현 후 빌드 오류 발생
- d166832 커밋으로 롤백 (안정 버전)
- 원인: 일관성 없는 코드 패턴 사용

### 2. 코딩 가이드라인 작성
- CODING_GUIDELINES.md 파일 생성
- Repository/Service 패턴 정립
- Import 규칙 및 타입 안정성 가이드

### 3. Vercel 배포 오류 해결
- 서버 컴포넌트 404 에러 수정
- `export const dynamic = 'force-dynamic'` 추가
- posts, notice, partners/[id] 페이지 수정

## 현재 프로젝트 상태

### 완료된 기능
- 인증 시스템 (NextAuth.js JWT)
- 게시판 CRUD (작성, 수정, 삭제)
- 댓글 시스템 (대댓글 지원)
- 조회수 기능
- 보증업체 시스템
- 고객센터 (공지사항, FAQ)

### 미완료 기능 (checklist.md 기준)
- 좋아요 기능 (게시글, 댓글)
- 게시글 검색 기능
- 페이지네이션 개선
- 사용자 프로필 페이지
- 1:1 문의 작성

## 중요 기술적 결정사항

1. **데이터 접근 패턴**:
   - Repository 패턴 사용 (복잡한 쿼리)
   - Service Layer (비즈니스 로직)
   - Prisma 직접 사용 (단순 CRUD)

2. **Import 규칙**:
   - Prisma: `import { prisma } from '@/lib/prisma'`
   - Repository: 각 API route에서 인스턴스 생성

3. **Vercel 배포**:
   - 서버 컴포넌트는 `export const dynamic = 'force-dynamic'` 필수
   - 로컬 빌드 테스트 필수

## 다음 세션 작업 우선순위

1. 좋아요 기능 구현 (코딩 가이드라인 준수)
2. 검색 기능 구현
3. 페이지네이션 개선

## 파일 위치 참고

- 코딩 가이드: `/CODING_GUIDELINES.md`
- 체크리스트: `/app/checklist.md`
- 기술 결정사항: `/app/TECHNICAL_DECISIONS.md`
- API 라우트: `/app/app/api/`
- Repository: `/app/lib/repositories/`
- Service: `/app/lib/services/`