import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    console.log('Vercel 데이터베이스에서 관리자 비밀번호 재설정 중...')
    
    // 새 비밀번호 해시 생성
    const newPassword = 'admin123'
    const newHash = await bcrypt.hash(newPassword, 10)
    
    console.log('새 비밀번호:', newPassword)
    console.log('새 해시:', newHash)
    
    // 관리자 계정 업데이트
    const updated = await prisma.user.updateMany({
      where: { 
        OR: [
          { username: 'admin' },
          { email: 'admin@sportslive.com' }
        ]
      },
      data: {
        passwordHash: newHash
      }
    })

    console.log(`\n✅ ${updated.count}개의 관리자 계정 비밀번호가 업데이트되었습니다`)
    
    // 확인
    const admin = await prisma.user.findFirst({
      where: { username: 'admin' }
    })
    
    if (admin) {
      const isValid = await bcrypt.compare(newPassword, admin.passwordHash)
      console.log(`\n비밀번호 검증: ${isValid ? '✅ 성공' : '❌ 실패'}`)
    }

  } catch (error) {
    console.error('오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()