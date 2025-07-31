import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Vercel 서버리스 환경에서 연결 관리
if (process.env.NODE_ENV === 'production') {
  // 프로세스 종료 시 연결 정리
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}