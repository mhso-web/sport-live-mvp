export interface PaginationParams {
  page?: number
  limit?: number
  orderBy?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface IRepository<T> {
  findById(id: number): Promise<T | null>
  findAll(params?: PaginationParams): Promise<PaginatedResult<T>>
  create(data: any): Promise<T>
  update(id: number, data: any): Promise<T>
  delete(id: number): Promise<void>
}