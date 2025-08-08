import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { AnalysisService } from '@/lib/services/analysisService';
import { ApiResponse } from '@/lib/api/response';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/analysis/[id]/like - Toggle like on analysis
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        ApiResponse.error({ code: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 401 }
      );
    }

    const analysisId = parseInt(params.id);
    if (isNaN(analysisId)) {
      return NextResponse.json(
        ApiResponse.error({ code: 'INVALID_ID', message: 'Invalid analysis ID' }),
        { status: 400 }
      );
    }

    const result = await AnalysisService.toggleLike(analysisId, parseInt(session.user.id));

    return NextResponse.json(
      ApiResponse.success(result)
    );
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      ApiResponse.error({ code: 'LIKE_ERROR', message: 'Failed to toggle like' }),
      { status: 500 }
    );
  }
}