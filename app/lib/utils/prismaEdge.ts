import { PrismaClient } from '@prisma/client/edge'

// Edge Runtime용 Prisma Client
const globalForPrismaEdge = globalThis as unknown as {
  prismaEdge: PrismaClient | undefined
}

export const prismaEdge = globalForPrismaEdge.prismaEdge ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrismaEdge.prismaEdge = prismaEdge
}

// API 라우트에서 사용할 헬퍼 함수
export async function withPrisma<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await operation(prismaEdge)
  } finally {
    // 프로덕션 환경에서는 매 요청 후 연결 해제
    if (process.env.NODE_ENV === 'production') {
      await prismaEdge.$disconnect()
    }
  }
}