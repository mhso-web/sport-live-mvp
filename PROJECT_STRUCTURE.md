# Sport Live 프로젝트 구조

## 📁 프로젝트 개요

Sport Live는 실시간 스포츠 중계 및 AI 분석을 제공하는 종합 스포츠 플랫폼입니다.

### 기획 vs 현재 구현 상태

| 기능 영역 | 기획 (docs) | 현재 구현 | 상태 |
|---------|-----------|---------|------|
| 사용자 시스템 | ✅ 완전 설계 | ✅ 구현 완료 | 100% |
| 게시판 시스템 | ✅ 4개 타입 | ✅ 구현 완료 | 100% |
| 댓글 시스템 | ✅ 대댓글 지원 | ✅ 구현 완료 | 100% |
| 보증업체 | ❌ 미설계 | ✅ 구현 완료 | 추가 기능 |
| 고객센터 | ❌ 미설계 | ✅ 구현 완료 | 추가 기능 |
| 경기 정보 | ✅ 완전 설계 | ❌ 미구현 | 0% |
| AI 분석 | ✅ 완전 설계 | ❌ 미구현 | 0% |
| 실시간 채팅 | ✅ Redis 설계 | ❌ 미구현 | 0% |
| 광고 시스템 | ✅ 완전 설계 | ❌ 미구현 | 0% |

## 📂 디렉토리 구조

```
sport-live/
├── app/                        # Next.js 14 App Router
│   ├── app/                   # 페이지 및 라우트
│   │   ├── api/              # API 엔드포인트
│   │   │   ├── auth/         # 인증 관련
│   │   │   ├── posts/        # 게시글 CRUD
│   │   │   ├── comments/     # 댓글 CRUD
│   │   │   ├── boards/       # 게시판 카테고리
│   │   │   ├── partners/     # 보증업체
│   │   │   └── support/      # 고객센터
│   │   │
│   │   ├── (auth)/          # 인증 페이지 그룹
│   │   ├── posts/           # 게시판 페이지
│   │   ├── notice/          # 공지사항
│   │   ├── partners/        # 보증업체
│   │   └── support/         # 고객센터
│   │
│   ├── components/          # React 컴포넌트
│   │   ├── layout/         # 레이아웃 컴포넌트
│   │   ├── posts/          # 게시글 컴포넌트
│   │   └── ui/             # UI 컴포넌트
│   │
│   ├── lib/                # 핵심 비즈니스 로직
│   │   ├── repositories/   # 데이터 접근 계층
│   │   ├── services/       # 비즈니스 로직 계층
│   │   ├── dto/           # 데이터 검증 객체
│   │   ├── errors/        # 커스텀 에러
│   │   └── prisma.ts      # Prisma 클라이언트
│   │
│   └── prisma/            # 데이터베이스
│       ├── schema.prisma  # 스키마 정의
│       └── seed.ts        # 시드 데이터
│
├── docs/                  # 프로젝트 문서
│   ├── architecture.md    # 전체 아키텍처
│   ├── database-schema.md # DB 설계
│   ├── api-spec.md       # API 명세
│   └── ...               # 기타 문서
│
├── public/               # 정적 파일
└── styles/              # 전역 스타일
```

## 🗄️ 데이터베이스 구조

### 현재 구현된 모델

```prisma
// 사용자 관련
- User (사용자)
- UserBadge (뱃지)
- UserExperienceLog (경험치 로그)

// 게시판 관련
- BoardCategory (게시판 카테고리)
- Post (게시글)
- Comment (댓글)
- PostLike (게시글 좋아요)

// 보증업체 관련
- Partner (보증업체)
- PartnerRating (별점)
- PartnerComment (댓글)
- PartnerLike (좋아요)

// 고객센터 관련
- Inquiry (1:1 문의)
- InquiryResponse (답변)

// 실시간 관련 (부분 구현)
- LiveMatch (경기 정보)
- ChatMessage (채팅 메시지)
```

### 미구현 모델 (docs에만 존재)

```
- Match (상세 경기 정보)
- MatchEvent (경기 이벤트)
- MatchAnalysis (AI 분석)
- AnalysisFeedback (분석 피드백)
- AdBanner (광고 배너)
```

## 🔧 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand (예정)
- **Auth**: NextAuth.js

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis (예정)
- **Validation**: Zod

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase/Neon
- **File Storage**: Cloudinary (예정)

## 📋 환경 변수

```env
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_URL=
NEXTAUTH_SECRET=
JWT_SECRET=

# Redis (예정)
REDIS_URL=

# External APIs (예정)
OPENAI_API_KEY=
```

## 🚀 개발 상태

### ✅ 완료된 기능
1. 사용자 인증 시스템 (회원가입, 로그인, JWT)
2. 권한 관리 (USER, ANALYST, MODERATOR, SUB_ADMIN, ADMIN)
3. 게시판 CRUD (작성, 수정, 삭제, 조회)
4. 댓글 시스템 (대댓글 지원)
5. 조회수 추적
6. 보증업체 시스템
7. 고객센터 (공지사항, FAQ)

### 🔄 진행 중
1. 좋아요 기능 (게시글, 댓글)
2. 검색 기능
3. 페이지네이션 개선

### 📅 예정된 기능
1. 사용자 프로필
2. 1:1 문의 작성
3. 실시간 중계
4. AI 경기 분석
5. 실시간 채팅
6. 광고 시스템

## 🔍 주요 패턴

### Repository Pattern
```typescript
// 데이터 접근 로직 캡슐화
export class PostRepository {
  async findById(id: number): Promise<Post | null>
  async findByFilters(filters: PostFilters): Promise<PaginatedResult<Post>>
  async create(data: Prisma.PostCreateInput): Promise<Post>
  async update(id: number, data: Prisma.PostUpdateInput): Promise<Post>
  async delete(id: number): Promise<void>
}
```

### Service Layer Pattern
```typescript
// 비즈니스 로직 처리
export class PostService {
  constructor(
    private postRepository: PostRepository,
    private userRepository: UserRepository
  ) {}
  
  async create(data: CreatePostDto, auth: AuthenticatedRequest) {
    // 권한 검증, 데이터 처리, 경험치 부여 등
  }
}
```

### DTO Pattern
```typescript
// 데이터 검증 및 변환
export const CreatePostDto = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  boardType: z.nativeEnum(BoardType),
  categoryId: z.number().optional()
})
```

## 📝 개발 가이드

### 새 기능 추가 시
1. `docs/` 문서 확인하여 기획 의도 파악
2. `CODING_GUIDELINES.md` 참고하여 코드 작성
3. Repository → Service → API Route 순서로 구현
4. DTO로 입력 검증
5. 로컬 빌드 테스트 후 커밋

### 주의사항
- 서버 컴포넌트는 `export const dynamic = 'force-dynamic'` 필수
- Prisma import는 `@/lib/prisma` 사용
- session.user.id는 string → number 변환 필요
- API 응답은 표준 형식 준수

## 🐛 알려진 이슈

1. **Too many connections**: Prisma 연결 풀 설정 필요
2. **Vercel 404**: 서버 컴포넌트 dynamic export 누락
3. **Type errors**: Repository export 패턴 불일치

## 📚 참고 문서

- [아키텍처 설계](./docs/architecture.md)
- [데이터베이스 스키마](./docs/database-schema.md)
- [API 명세](./docs/api-spec.md)
- [코딩 가이드라인](./CODING_GUIDELINES.md)
- [기술적 결정사항](./app/TECHNICAL_DECISIONS.md)