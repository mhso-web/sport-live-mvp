# Docker Database Security Guide

## 🚨 중요: 랜섬웨어 공격 방지

이 프로젝트는 이전에 Docker PostgreSQL 데이터베이스가 랜섬웨어 공격을 받은 적이 있습니다.
아래 보안 조치를 반드시 따라주세요.

## 보안 설정

### 1. 환경 변수 (.env.docker)
- **절대로 git에 커밋하지 마세요**
- 강력한 비밀번호 사용 (최소 20자, 영문/숫자 조합)
- 정기적으로 변경

### 2. Docker 설정
- 포트는 반드시 localhost(127.0.0.1)로만 바인딩
- 컨테이너 네트워크 격리
- 정기 백업 자동화

### 3. 데이터베이스 접근
- scram-sha-256 인증 사용
- 외부 접근 차단
- 최소 권한 원칙 적용

## 실행 방법

```bash
# 안전한 Docker 컨테이너 시작
docker-compose -f docker-compose-secure.yml up -d

# 데이터베이스 마이그레이션
cd app && npx prisma migrate deploy

# 초기 데이터 시드
npx prisma db seed
```

## 백업

자동 백업이 매일 실행되며, 7일 이상 된 백업은 자동 삭제됩니다.
백업 위치: `./backups/`

### 수동 백업
```bash
docker exec sportslive-postgres pg_dump -U sportslive_admin sports_live_dev | gzip > backup_$(date +%Y%m%d).sql.gz
```

### 복원
```bash
gunzip < backup_20240807.sql.gz | docker exec -i sportslive-postgres psql -U sportslive_admin sports_live_dev
```

## 모니터링

```bash
# 컨테이너 상태 확인
docker ps

# 로그 확인
docker logs sportslive-postgres --tail 50

# 데이터베이스 연결 테스트
docker exec sportslive-postgres pg_isready
```

## 문제 해결

### 비밀번호 변경
1. `.env.docker` 파일 수정
2. `app/.env` 파일의 DATABASE_URL 업데이트
3. Docker 재시작: `docker-compose -f docker-compose-secure.yml restart`

### 데이터 손실 시
1. 최신 백업 파일 확인: `ls -la ./backups/`
2. 데이터베이스 복원 (위 복원 명령 참조)
3. 애플리케이션 재시작

## 체크리스트

- [ ] .env.docker가 .gitignore에 포함되어 있는가?
- [ ] 포트가 localhost로만 바인딩되어 있는가?
- [ ] 강력한 비밀번호를 사용하는가?
- [ ] 자동 백업이 실행되고 있는가?
- [ ] 정기적으로 백업을 테스트하는가?