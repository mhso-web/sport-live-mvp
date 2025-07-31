import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'

// 허용된 이미지 타입
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUB_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 없습니다' },
        { status: 400 }
      )
    }

    // 파일 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '허용되지 않은 파일 형식입니다. JPG, PNG, GIF, WebP만 가능합니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 5MB를 초과할 수 없습니다' },
        { status: 400 }
      )
    }

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${originalName}`
    
    // 파일 저장 경로
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const filePath = path.join(uploadsDir, fileName)
    
    // 파일 저장
    await writeFile(filePath, buffer)
    
    // 웹 접근 가능한 URL 반환
    const fileUrl = `/uploads/${fileName}`
    
    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    })
  } catch (error) {
    console.error('파일 업로드 오류:', error)
    return NextResponse.json(
      { success: false, error: '파일 업로드 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}