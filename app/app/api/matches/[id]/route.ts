import { NextRequest } from 'next/server';
import { matchService } from '@/lib/services/matchService';
import { ApiResponse } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return ApiResponse.error({
        code: 'INVALID_ID',
        message: 'Invalid match ID',
      }, 400);
    }

    const match = await matchService.getMatchById(id);
    return ApiResponse.success(match);
  } catch (error) {
    console.error('Error in API /api/matches/[id]:', error);
    return ApiResponse.internalError(error instanceof Error ? error.message : 'Failed to process request');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return ApiResponse.error({
        code: 'INVALID_ID',
        message: 'Invalid match ID',
      }, 400);
    }

    const data = await request.json();
    
    // Update scores if provided
    if (data.homeScore !== undefined && data.awayScore !== undefined) {
      const match = await matchService.updateMatchScore(
        id,
        data.homeScore,
        data.awayScore,
        data.currentMinute
      );
      return ApiResponse.success(match);
    }

    // Update status if provided
    if (data.status) {
      const match = await matchService.updateMatchStatus(id, data.status);
      return ApiResponse.success(match);
    }

    return ApiResponse.error({
      code: 'NO_UPDATE_DATA',
      message: 'No update data provided',
    }, 400);
  } catch (error) {
    console.error('Error in API /api/matches/[id]:', error);
    return ApiResponse.internalError(error instanceof Error ? error.message : 'Failed to process request');
  }
}