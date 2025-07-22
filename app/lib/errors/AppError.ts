export abstract class AppError extends Error {
  abstract statusCode: number
  abstract code: string

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message
    }
  }
}