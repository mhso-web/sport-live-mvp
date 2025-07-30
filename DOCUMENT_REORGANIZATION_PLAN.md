# 문서 재구성 계획

## 현재 문서 구조 분석

### 루트 디렉토리
- `README.md` - 프로젝트 소개
- `CLAUDE.md` - AI 작업 가이드
- `CODING_GUIDELINES.md` - 코딩 표준 ✅
- `PROJECT_STRUCTURE.md` - 프로젝트 구조 ✅ (신규 작성)
- `PROJECT_ROADMAP.md` - 전체 로드맵
- `CONTEXT_SUMMARY.md` - 작업 컨텍스트
- `local-dev-guide.md` - 로컬 개발 가이드

### /app 디렉토리
- `IMPLEMENTATION_STATUS.md` - 구현 현황
- `TECHNICAL_DECISIONS.md` - 기술적 결정사항
- `checklist.md` - 작업 체크리스트 (gitignore)

### /docs 디렉토리 (초기 기획)
- `architecture.md` - 시스템 아키텍처
- `database-schema.md` - DB 설계
- `api-spec.md` - API 명세
- `api-development-guide.md` - API 개발 가이드
- `analytics-guide.md` - 분석 가이드
- `deployment.md` - 배포 가이드
- `permission-system.md` - 권한 시스템
- `separation-guide.md` - 분리 가이드

## 제안하는 새로운 구조

```
sport-live/
├── README.md                    # 프로젝트 소개 (유지)
├── CODING_GUIDELINES.md         # 코딩 표준 (유지)
├── PROJECT_STRUCTURE.md         # 프로젝트 구조 (유지)
│
├── docs/                        # 모든 문서 중앙화
│   ├── 01-overview/            # 개요
│   │   ├── project-roadmap.md  # <- PROJECT_ROADMAP.md
│   │   ├── implementation-status.md  # <- app/IMPLEMENTATION_STATUS.md
│   │   └── technical-decisions.md   # <- app/TECHNICAL_DECISIONS.md
│   │
│   ├── 02-architecture/        # 아키텍처
│   │   ├── system-architecture.md   # <- docs/architecture.md
│   │   ├── database-schema.md       # <- docs/database-schema.md
│   │   └── api-specification.md     # <- docs/api-spec.md
│   │
│   ├── 03-development/         # 개발 가이드
│   │   ├── local-setup.md          # <- local-dev-guide.md
│   │   ├── api-development.md      # <- docs/api-development-guide.md
│   │   ├── claude-guide.md         # <- CLAUDE.md
│   │   └── coding-standards.md     # 링크 to /CODING_GUIDELINES.md
│   │
│   ├── 04-features/            # 기능별 문서
│   │   ├── authentication.md       # 인증 시스템
│   │   ├── board-system.md        # 게시판 시스템
│   │   ├── realtime-features.md   # 실시간 기능
│   │   └── ai-analysis.md         # AI 분석
│   │
│   └── 05-deployment/          # 배포 및 운영
│       ├── deployment-guide.md     # <- docs/deployment.md
│       ├── monitoring.md           # 모니터링
│       └── troubleshooting.md      # 문제 해결
│
└── app/                        # 애플리케이션 코드
    └── (checklist.md는 gitignore에 유지)
```

## 기획과 구현의 차이점 문서화

### 새로 작성할 문서: `/docs/01-overview/planning-vs-implementation.md`

```markdown
# 초기 기획 vs 현재 구현 상태

## 방향성 변경
- 초기: AI 기반 실시간 스포츠 분석 플랫폼
- 현재: 커뮤니티 중심 스포츠 포털

## 구현 우선순위 변경 이유
1. MVP 빠른 출시를 위해 커뮤니티 기능 우선
2. 사용자 기반 확보 후 AI 기능 추가 예정
3. 보증업체/고객센터는 수익 모델 고려하여 추가

## 향후 계획
- Phase 1 (현재): 커뮤니티 기능 완성
- Phase 2: 실시간 중계 및 채팅
- Phase 3: AI 분석 기능 추가
```

## 실행 계획

1. **즉시 실행**
   - [x] 빈 prisma 디렉토리 제거
   - [ ] 문서 이동 스크립트 작성

2. **단계별 실행**
   - [ ] docs 하위 디렉토리 생성
   - [ ] 문서 파일 이동 및 이름 변경
   - [ ] 상호 참조 링크 업데이트
   - [ ] README.md에 문서 구조 안내 추가

3. **추가 작성**
   - [ ] planning-vs-implementation.md
   - [ ] 각 기능별 상세 문서
   - [ ] 트러블슈팅 가이드