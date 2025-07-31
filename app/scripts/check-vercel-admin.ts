import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    console.log('Vercel 데이터베이스에서 관리자 계정 확인 중...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    
    const admin = await prisma.user.findFirst({
      where: { 
        OR: [
          { username: 'admin' },
          { email: 'admin@sportslive.com' }
        ]
      }
    })

    if (!admin) {
      console.log('❌ 관리자 계정을 찾을 수 없습니다')
      return
    }

    console.log('\n✅ 관리자 계정 발견:')
    console.log('ID:', admin.id)
    console.log('Username:', admin.username)
    console.log('Email:', admin.email)
    console.log('Role:', admin.role)
    console.log('Active:', admin.isActive)
    console.log('Password Hash:', admin.passwordHash)

    // 비밀번호 검증
    console.log('\n🔐 비밀번호 검증:')
    const passwords = ['admin123', 'password123!', 'admin', 'SuperAdmin@2025!']
    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, admin.passwordHash)
      console.log(`${pwd}: ${isValid ? '✅' : '❌'}`)
    }

  } catch (error) {
    console.error('오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()