# 기술적 결정사항 및 이슈 해결 기록

## API Routes Dynamic 설정 (2025-07-22)

### 문제
Next.js 14에서 API 라우트들이 정적 생성을 시도하면서 `DYNAMIC_SERVER_USAGE` 에러 발생

### 해결
모든 API 라우트에 `export const dynamic = 'force-dynamic'` 추가

### 영향 및 고려사항

1. **성능**: 
   - 모든 API 요청이 실시간 처리되어 캐싱 이점을 받지 못함
   - 향후 트래픽 증가 시 각 API 특성에 맞게 캐싱 전략 세분화 필요

2. **보안**: 
   - 문제없음 - API 라우트는 원래 동적이어야 함
   - 인증/권한 검사가 매 요청마다 실행되어 오히려 안전

3. **백엔드 분리**:
   - 향후 백엔드 서버 분리 시 영향 없음
   - Next.js API Routes를 제거하고 외부 API로 전환 가능

### 향후 개선방안

```typescript
// 공개 데이터 (게시판 목록, 파트너 목록)
export const revalidate = 300 // 5분마다 재검증

// 인증 필요한 라우트
export const dynamic = 'force-dynamic'

// 조회수 같은 단순 업데이트
export const runtime = 'edge' // Edge Runtime 활용
```

## 조회수 중복 증가 문제 (2025-07-22)

### 문제
게시글 조회 시 조회수가 2씩 증가

### 원인
- `postService.findById()`에서 조회수 증가
- `PostViewCounter` 컴포넌트에서도 조회수 증가

### 해결
`postService.findById()`에서 조회수 증가 로직 제거

## 게시판 데이터 캐싱 문제 (2025-07-22)

### 문제
다른 메뉴에서 게시판으로 돌아올 때 최신 데이터가 반영되지 않음

### 해결
1. 페이지 포커스/visibility change 이벤트 리스너 추가
2. fetch 요청에 `cache: 'no-store'` 옵션 추가

### 코드 예시
```typescript
// 페이지 포커스 시 데이터 새로고침
useEffect(() => {
  const handleFocus = () => {
    if (category) {
      fetchPosts()
    }
  }

  const handleVisibilityChange = () => {
    if (!document.hidden && category) {
      fetchPosts()
    }
  }

  window.addEventListener('focus', handleFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  return () => {
    window.removeEventListener('focus', handleFocus)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}, [category, page])
```

## TypeScript 빌드 에러 해결 (2025-07-22)

### 1. Comment 타입 재귀 문제
- **문제**: Prisma의 댓글 데이터 구조와 프론트엔드 타입 불일치
- **해결**: `transformComments` 헬퍼 함수로 데이터 변환

### 2. PaginationParams 타입 불일치
- **문제**: `orderDir` vs `order` 속성명 불일치
- **해결**: 모든 곳에서 `order`로 통일

### 3. Repository delete 메서드 반환 타입
- **문제**: IRepository 인터페이스는 `Promise<void>`, 구현체는 `Promise<Entity>`
- **해결**: 모든 repository에서 `Promise<void>` 반환으로 통일

### 4. useSearchParams 에러
- **문제**: 클라이언트 컴포넌트에서 정적 생성 시도
- **해결**: Suspense boundary로 감싸서 해결

## 향후 고려사항

### 성능 최적화
1. API 라우트별 캐싱 전략 세분화
2. Edge Runtime 도입 검토
3. ISR (Incremental Static Regeneration) 활용

### 아키텍처 개선
1. 백엔드 서버 분리 준비
2. GraphQL 도입 검토
3. 마이크로서비스 전환 가능성

### 모니터링
1. API 응답 시간 측정
2. 캐시 히트율 분석
3. 에러 로깅 시스템 구축