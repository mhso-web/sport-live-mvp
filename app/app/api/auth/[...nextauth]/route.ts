import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth.config'

// NextAuth 핸들러 생성
const handler = NextAuth(authOptions)

// GET과 POST 메서드 모두 export
export { handler as GET, handler as POST }

// 동적 라우트 강제
export const dynamic = 'force-dynamic'