#!/bin/bash

echo "🚀 Starting Sports Live Development Environment..."

# 1. DB/Redis 시작
echo "📦 Starting databases..."
docker-compose up -d postgres redis

# 2. DB 마이그레이션 대기
echo "⏳ Waiting for PostgreSQL..."
sleep 3

# 3. 마이그레이션 실행 (Prisma 설정 후 활성화)
# echo "🔄 Running migrations..."
# cd app && npx prisma migrate dev && cd ..

# 4. 서비스 시작 안내
echo "✅ Development environment ready!"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "📝 Next steps:"
echo "   1. Start Next.js: cd app && npm run dev"
echo "   2. Start Socket.io: cd socket-server && npm run dev"
echo "   3. Open http://localhost:3000"