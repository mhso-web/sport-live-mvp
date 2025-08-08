import { NextResponse } from 'next/server';

export class ApiResponse {
  static success<T = any>(data: T, status: number = 200) {
    return NextResponse.json({
      success: true,
      data,
    }, { status });
  }

  static error(error: { code: string; message: string }, status: number = 400) {
    return NextResponse.json({
      success: false,
      error,
    }, { status });
  }

  static unauthorized(message: string = 'Unauthorized') {
    return this.error({ code: 'UNAUTHORIZED', message }, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return this.error({ code: 'FORBIDDEN', message }, 403);
  }

  static notFound(message: string = 'Resource not found') {
    return this.error({ code: 'NOT_FOUND', message }, 404);
  }

  static badRequest(message: string = 'Bad request') {
    return this.error({ code: 'BAD_REQUEST', message }, 400);
  }

  static internalError(message: string = 'Internal server error') {
    return this.error({ code: 'INTERNAL_ERROR', message }, 500);
  }
}