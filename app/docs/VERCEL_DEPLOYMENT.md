# Vercel 배포 가이드

## 필수 환경 변수 설정

Vercel Dashboard > Settings > Environment Variables에서 다음 환경 변수를 설정해야 합니다:

### 1. NextAuth 관련
- `NEXTAUTH_URL`: 프로덕션 URL (예: https://sport-live-mvp-app.vercel.app) - trailing slash 없이
- `NEXTAUTH_SECRET`: 32자 이상의 랜덤 문자열 (생성: `openssl rand -base64 32`)

### 2. 데이터베이스
- `DATABASE_URL`: PostgreSQL 연결 문자열

### 3. 옵션 (필요시)
- `REDIS_URL`: Redis 연결 문자열 (선택사항)
- `NEXT_PUBLIC_SOCKET_URL`: Socket.io 서버 URL (선택사항)

## 중요 사항

1. **API 라우트 구조**: 모든 API 라우트는 `/app/api` 폴더 안에 있어야 합니다
2. **환경 변수**: `.env.production.local` 파일은 Vercel에서 읽지 않습니다. 반드시 Vercel Dashboard에서 설정하세요
3. **NEXTAUTH_URL**: 설정하지 않으면 자동으로 VERCEL_URL을 사용합니다

## 환경 변수 설정 방법

1. Vercel Dashboard 접속
2. 프로젝트 선택
3. Settings 탭 클릭
4. Environment Variables 섹션으로 이동
5. 각 변수 추가:
   - Key: 환경 변수 이름
   - Value: 환경 변수 값
   - Environment: Production, Preview, Development 중 선택

## 로컬 .env 예시

```env
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/sportlive"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

## 주의사항

1. NEXTAUTH_URL은 배포된 도메인과 정확히 일치해야 합니다
2. NEXTAUTH_SECRET은 프로덕션과 로컬에서 다르게 설정하는 것을 권장합니다
3. 환경 변수 변경 후 재배포가 필요합니다

## 문제 해결

### 로그인이 작동하지 않는 경우
1. NEXTAUTH_URL이 올바른지 확인
2. NEXTAUTH_SECRET이 설정되었는지 확인
3. Vercel Functions 로그 확인

### 페이지 이동이 안 되는 경우
1. Build 로그에서 에러 확인
2. Runtime 로그에서 API 호출 실패 확인
3. 브라우저 콘솔에서 JavaScript 에러 확인