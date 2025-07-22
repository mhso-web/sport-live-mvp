import { AppError } from './AppError'

export class ValidationError extends AppError {
  statusCode = 400
  code = 'VALIDATION_ERROR'

  constructor(public errors: any[]) {
    super('입력값이 올바르지 않습니다')
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      errors: this.errors
    }
  }
}

export class UnauthorizedException extends AppError {
  statusCode = 401
  code = 'UNAUTHORIZED'

  constructor(message = '인증이 필요합니다') {
    super(message)
  }
}

export class ForbiddenException extends AppError {
  statusCode = 403
  code = 'FORBIDDEN'

  constructor(message = '권한이 없습니다') {
    super(message)
  }
}

export class NotFoundException extends AppError {
  statusCode = 404
  code = 'NOT_FOUND'

  constructor(resource: string) {
    super(`${resource}을(를) 찾을 수 없습니다`)
  }
}

export class ConflictException extends AppError {
  statusCode = 409
  code = 'CONFLICT'

  constructor(message: string) {
    super(message)
  }
}

export class InternalServerError extends AppError {
  statusCode = 500
  code = 'INTERNAL_ERROR'

  constructor(message = '서버 오류가 발생했습니다') {
    super(message)
  }
}