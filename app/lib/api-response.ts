import { NextResponse } from 'next/server'

export class ApiResponse {
  static success<T = any>(data: T, meta?: any) {
    return NextResponse.json({
      success: true,
      data,
      ...(meta && { meta })
    })
  }

  static error(message: string, status: number = 400, code?: string) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: code || 'ERROR',
          message
        }
      },
      { status }
    )
  }

  static unauthorized(message: string = '인증이 필요합니다') {
    return this.error(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message: string = '권한이 없습니다') {
    return this.error(message, 403, 'FORBIDDEN')
  }

  static notFound(message: string = '리소스를 찾을 수 없습니다') {
    return this.error(message, 404, 'NOT_FOUND')
  }

  static badRequest(message: string = '잘못된 요청입니다') {
    return this.error(message, 400, 'BAD_REQUEST')
  }

  static internalError(message: string = '서버 오류가 발생했습니다') {
    return this.error(message, 500, 'INTERNAL_ERROR')
  }
}