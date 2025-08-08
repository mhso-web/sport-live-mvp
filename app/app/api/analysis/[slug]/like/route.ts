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
        ApiResponse.error('Authentication required', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const analysisId = parseInt(params.id);
    if (isNaN(analysisId)) {
      return NextResponse.json(
        ApiResponse.error('Invalid analysis ID', 'INVALID_ID'),
        { status: 400 }
      );
    }

    const result = await AnalysisService.toggleLike(analysisId, session.user.id);

    return NextResponse.json(
      ApiResponse.success(
        result,
        null,
        result.liked ? 'Analysis liked' : 'Analysis unliked'
      )
    );
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      ApiResponse.error('Failed to toggle like', 'LIKE_ERROR'),
      { status: 500 }
    );
  }
}