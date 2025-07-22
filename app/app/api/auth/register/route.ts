import { authService } from '@/lib/container'
import { ApiResponse } from '@/lib/utils/apiResponse'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await authService.register(data)
    return ApiResponse.success(result, null, 201)
  } catch (error) {
    return ApiResponse.error(error)
  }
}