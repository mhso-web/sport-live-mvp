# Sport Live 코딩 가이드라인

## 목차
1. [프로젝트 구조](#프로젝트-구조)
2. [아키텍처 패턴](#아키텍처-패턴)
3. [코딩 컨벤션](#코딩-컨벤션)
4. [데이터베이스 접근](#데이터베이스-접근)
5. [API 라우트 패턴](#api-라우트-패턴)
6. [컴포넌트 패턴](#컴포넌트-패턴)
7. [타입 정의](#타입-정의)
8. [에러 처리](#에러-처리)
9. [체크리스트](#체크리스트)

## 프로젝트 구조

```
/app
├── /api                 # API 라우트
│   ├── /[entity]       # 엔티티별 라우트
│   │   ├── route.ts    # 목록 조회(GET), 생성(POST)
│   │   └── /[id]
│   │       └── route.ts # 상세(GET), 수정(PUT), 삭제(DELETE)
├── /[page]             # 페이지 컴포넌트
├── /components         # 재사용 컴포넌트
├── /lib                # 핵심 비즈니스 로직
│   ├── /repositories   # 데이터 접근 계층
│   ├── /services       # 비즈니스 로직 계층
│   ├── /dto           # 데이터 전송 객체
│   └── prisma.ts      # Prisma 클라이언트
└── /prisma            # 데이터베이스 스키마
```

## 아키텍처 패턴

### 1. Repository 패턴
**목적**: 데이터 접근 로직을 캡슐화

```typescript
// ✅ 올바른 예시
export class PostRepository implements IPostRepository {
  async findById(id: number): Promise<Post | null> {
    return prisma.post.findFirst({
      where: { id, isDeleted: false }
    })
  }
}

// ❌ 잘못된 예시
// API 라우트에서 직접 Prisma 사용
const post = await prisma.post.findUnique({ where: { id } })
```

### 2. Service Layer 패턴
**목적**: 비즈니스 로직을 캡슐화

```typescript
// ✅ 올바른 예시
export class PostService {
  constructor(
    private postRepository: PostRepository,
    private userRepository: UserRepository
  ) {}

  async create(data: CreatePostDto, auth: AuthenticatedRequest) {
    // 비즈니스 로직 (권한 체크, 검증 등)
    // Repository를 통한 데이터 접근
  }
}
```

### 3. DTO 패턴
**목적**: 데이터 검증 및 타입 안정성

```typescript
// ✅ 올바른 예시
import { z } from 'zod'

export const CreatePostDto = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  boardType: z.nativeEnum(BoardType),
  categoryId: z.number().optional()
})

export type CreatePostDto = z.infer<typeof CreatePostDto>
```

## 코딩 컨벤션

### Import 순서
```typescript
// 1. Next.js 관련
import { NextRequest, NextResponse } from 'next/server'

// 2. 외부 라이브러리
import { getServerSession } from 'next-auth'
import { z } from 'zod'

// 3. 내부 모듈 (절대 경로)
import { authOptions } from '@/lib/auth.config'
import { PostService } from '@/lib/services/postService'
import { PostRepository } from '@/lib/repositories/postRepository'

// 4. 타입
import type { BoardType } from '@prisma/client'
```

### 파일 명명 규칙
- 컴포넌트: `PascalCase.tsx` (예: `PostListItem.tsx`)
- 유틸리티: `camelCase.ts` (예: `formatDate.ts`)
- API 라우트: `route.ts` (고정)
- Repository/Service: `camelCase.ts` (예: `postRepository.ts`)

## 데이터베이스 접근

### Repository를 통한 접근 (권장)
```typescript
// ✅ 복잡한 쿼리나 재사용이 필요한 경우
const postRepository = new PostRepository()
const post = await postRepository.findWithRelations(id)
```

### Service를 통한 접근 (권장)
```typescript
// ✅ 비즈니스 로직이 포함된 경우
const postService = new PostService(postRepository, userRepository)
const result = await postService.create(data, auth)
```

### Prisma 직접 사용 (제한적 허용)
```typescript
// ⚠️ 단순한 CRUD만 허용 (예: 댓글 생성)
import { prisma } from '@/lib/prisma'

// 단순 조회
const comment = await prisma.comment.findUnique({ where: { id } })
```

## API 라우트 패턴

### 기본 구조
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { handleApiError } from '@/lib/errors'

// Next.js 14 필수
export const dynamic = 'force-dynamic'

// Repository/Service 인스턴스 (모듈 레벨)
const postRepository = new PostRepository()
const postService = new PostService(postRepository)

export async function GET(request: NextRequest) {
  try {
    // 1. 인증 확인 (필요한 경우)
    const session = await getServerSession(authOptions)
    
    // 2. 파라미터 파싱
    const searchParams = request.nextUrl.searchParams
    
    // 3. 비즈니스 로직 실행
    const result = await postService.findAll(filters)
    
    // 4. 응답
    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta
    })
  } catch (error) {
    return handleApiError(error)
  }
}
```

### 인증이 필요한 라우트
```typescript
// ✅ 올바른 예시
const session = await getServerSession(authOptions)
if (!session?.user) {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  )
}

const userId = parseInt(session.user.id) // string → number 변환
```

## 컴포넌트 패턴

### Server Component (기본)
```typescript
// ✅ 데이터 fetching이 필요한 경우
export default async function PostDetailPage({ params }: Props) {
  const post = await getPost(params.id)
  
  return <div>{/* UI */}</div>
}
```

### Client Component
```typescript
// ✅ 상태나 이벤트 핸들러가 필요한 경우
'use client'

export default function PostListContent() {
  const [posts, setPosts] = useState<Post[]>([])
  
  useEffect(() => {
    fetchPosts()
  }, [])
  
  return <div>{/* UI */}</div>
}
```

### Suspense 사용
```typescript
// ✅ useSearchParams 사용 시
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchableContent />
    </Suspense>
  )
}
```

## 타입 정의

### 인터페이스 정의
```typescript
// ✅ 올바른 예시
interface Post {
  id: number
  title: string
  content: string
  author: {
    id: number
    username: string
  }
  stats: {
    views: number
    likes: number
  }
}
```

### Prisma 타입 활용
```typescript
// ✅ Prisma 생성 타입 활용
import { Prisma } from '@prisma/client'

type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    user: true
    category: true
    _count: { select: { comments: true, likes: true } }
  }
}>
```

## 에러 처리

### API 에러 처리
```typescript
// ✅ 중앙 집중식 에러 처리
import { handleApiError } from '@/lib/errors'

try {
  // 비즈니스 로직
} catch (error) {
  return handleApiError(error)
}
```

### 커스텀 에러
```typescript
// ✅ 의미 있는 에러 메시지
throw new NotFoundException('게시글을 찾을 수 없습니다')
throw new ForbiddenException('권한이 없습니다')
```

## 체크리스트

### 새 기능 구현 전
- [ ] 유사한 기능의 기존 코드 확인
- [ ] Repository/Service 패턴 필요성 검토
- [ ] DTO 스키마 정의

### 코드 작성 중
- [ ] Import 경로 확인 (`@/lib/prisma` 사용)
- [ ] 타입 정의 확인
- [ ] 에러 처리 구현

### 코드 작성 후
- [ ] `npm run build` 로컬 빌드 테스트
- [ ] `npm run type-check` 타입 체크
- [ ] API 라우트에 `export const dynamic = 'force-dynamic'` 추가 확인

### 커밋 전
- [ ] 불필요한 console.log 제거
- [ ] 주석 정리
- [ ] 의미 있는 커밋 메시지 작성

## 주의사항

1. **Prisma 클라이언트**: 항상 `@/lib/prisma`에서 import
   ```typescript
   import { prisma } from '@/lib/prisma'  // ✅
   import { db } from '@/lib/db'         // ❌
   ```

2. **Repository 인스턴스**: 각 API 라우트에서 생성
   ```typescript
   const postRepository = new PostRepository()  // ✅
   import { postRepository } from '...'        // ❌ (export 안됨)
   ```

3. **세션 사용자 ID**: string을 number로 변환
   ```typescript
   const userId = parseInt(session.user.id)  // ✅
   const userId = session.user.id           // ❌ (string)
   ```

4. **API 응답 형식**: 일관된 형식 유지
   ```typescript
   return NextResponse.json({
     success: true,
     data: result,
     meta: pagination  // 목록인 경우
   })
   ```

5. **서버 컴포넌트**: 동적 렌더링 설정 필수
   ```typescript
   // 데이터베이스 접근이 있는 서버 컴포넌트
   export const dynamic = 'force-dynamic'  // ✅ 필수!
   
   export default async function Page() {
     const data = await prisma.post.findMany()
     // ...
   }
   ```

## Vercel 배포 시 주의사항

1. **빌드 에러 예방**:
   - 로컬에서 `npm run build` 테스트 필수
   - TypeScript 타입 체크 통과 확인
   - 모든 import 경로 검증

2. **동적 렌더링 설정**:
   - 서버 컴포넌트에서 DB 접근 시 `export const dynamic = 'force-dynamic'` 필수
   - API 라우트는 항상 동적이어야 함

3. **환경 변수**:
   - `.env` (로컬) vs `.env.production` (Vercel)
   - DATABASE_URL은 Vercel 환경 변수에 설정

## 트러블슈팅

### 문제: Vercel에서 404 에러
```typescript
// 해결: 서버 컴포넌트에 dynamic export 추가
export const dynamic = 'force-dynamic'
```

### 문제: Module not found 에러
```typescript
// 해결: 올바른 import 경로 사용
import { prisma } from '@/lib/prisma'  // ✅
import { PostRepository } from '@/lib/repositories/postRepository'  // ✅
```

### 문제: 타입 에러
```typescript
// 해결: session.user.id 타입 변환
const userId = parseInt(session.user.id)  // string → number
```

## 향후 개발 시 체크리스트

### 새 기능 개발 전
- [ ] 기존 유사 기능 코드 분석
- [ ] CODING_GUIDELINES.md 확인
- [ ] 필요한 모델/타입 정의

### 개발 중
- [ ] Repository/Service 패턴 일관성 유지
- [ ] API 응답 형식 통일
- [ ] 에러 처리 구현

### 개발 후
- [ ] `npm run build` 로컬 테스트
- [ ] `npm run type-check` 타입 체크
- [ ] Vercel 배포 후 기능 테스트

이 가이드라인을 따르면 일관성 있고 유지보수가 쉬운 코드를 작성할 수 있습니다.