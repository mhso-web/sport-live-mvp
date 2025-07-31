# 데이터베이스 마이그레이션 가이드

## 프로덕션 마이그레이션 실행 방법

### 1. 로컬에서 Vercel 프로덕션 DB에 연결

```bash
# .env.production.local 파일의 DATABASE_URL 사용
DATABASE_URL="your-production-database-url" npx prisma migrate deploy
```

### 2. Vercel CLI 사용 (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 링크
vercel link

# 프로덕션 환경 변수 가져오기
vercel env pull .env.production

# 마이그레이션 실행
npx prisma migrate deploy
```

### 3. GitHub Actions 사용 (자동화)

`.github/workflows/migrate.yml` 파일 생성:

```yaml
name: Run Migrations

on:
  push:
    branches: [main]
    paths:
      - 'prisma/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## 현재 필요한 마이그레이션

### comment_likes 테이블 추가 (2025-07-31)

```sql
-- CreateTable
CREATE TABLE "comment_likes" (
    "id" SERIAL NOT NULL,
    "comment_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comment_likes_user_id_idx" ON "comment_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_likes_comment_id_user_id_key" ON "comment_likes"("comment_id", "user_id");

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## 주의사항

1. 마이그레이션 전 데이터베이스 백업 필수
2. 프로덕션 마이그레이션은 사용자가 적은 시간대에 실행
3. 마이그레이션 후 애플리케이션 재시작 필요할 수 있음