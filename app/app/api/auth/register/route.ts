import { getAuthService } from '@/lib/container'
import { ApiResponse } from '@/lib/utils/apiResponse'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await getAuthService().register(data)
    return ApiResponse.success(result, {}, 201)
  } catch (error) {
    return ApiResponse.error(error)
  }
}