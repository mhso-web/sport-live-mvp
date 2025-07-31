import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function checkAdminUser() {
  try {
    // admin 사용자 찾기
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    })

    if (!adminUser) {
      console.log('❌ Admin user not found')
      return
    }

    console.log('✅ Admin user found:')
    console.log('ID:', adminUser.id)
    console.log('Username:', adminUser.username)
    console.log('Email:', adminUser.email)
    console.log('Role:', adminUser.role)
    console.log('Active:', adminUser.isActive)
    console.log('Password Hash:', adminUser.passwordHash)

    // 비밀번호 검증
    const testPasswords = ['admin123', 'password123!', 'admin']
    console.log('\n🔐 Password verification:')
    
    for (const password of testPasswords) {
      const isValid = await bcrypt.compare(password, adminUser.passwordHash)
      console.log(`${password}: ${isValid ? '✅' : '❌'}`)
    }

    // 새로운 비밀번호 해시 생성
    console.log('\n🔑 New password hash for admin123:')
    const newHash = await bcrypt.hash('admin123', 10)
    console.log(newHash)

    // 데이터베이스 업데이트
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { passwordHash: newHash }
    })
    console.log('\n✅ Admin password updated successfully!')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminUser()