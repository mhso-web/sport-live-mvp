import { NextResponse } from 'next/server'
import { AppError } from '@/lib/errors/AppError'
import { z } from 'zod'

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  meta?: {
    page?: number
    total?: number
    timestamp?: string
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    errors?: any[]
  }
}

export class ApiResponse {
  static success<T>(
    data: T,
    meta?: Record<string, any>,
    status = 200
  ): NextResponse {
    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          ...meta
        }
      } as ApiSuccessResponse<T>,
      { status }
    )
  }

  static error(error: unknown): NextResponse {
    // AppError 처리
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.toJSON()
        } as ApiErrorResponse,
        { status: error.statusCode }
      )
    }

    // Zod 검증 에러
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력값이 올바르지 않습니다',
            errors: error.errors
          }
        } as ApiErrorResponse,
        { status: 400 }
      )
    }

    // 예상치 못한 에러
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다'
        }
      } as ApiErrorResponse,
      { status: 500 }
    )
  }

  static paginated<T>(
    data: T[],
    pagination: {
      page: number
      limit: number
      total: number
    }
  ): NextResponse {
    return this.success(data, {
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page * pagination.limit < pagination.total,
        hasPrev: pagination.page > 1
      }
    })
  }
}