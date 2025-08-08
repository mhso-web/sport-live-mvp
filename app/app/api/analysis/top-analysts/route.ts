import { NextRequest, NextResponse } from 'next/server';
import { AnalysisService } from '@/lib/services/analysisService';
import { ApiResponse } from '@/lib/api-response';

// GET /api/analysis/top-analysts - Get top performing analysts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const analysts = await AnalysisService.getTopAnalysts(limit);

    return NextResponse.json(
      ApiResponse.success(analysts)
    );
  } catch (error) {
    console.error('Error fetching top analysts:', error);
    return NextResponse.json(
      ApiResponse.error('Failed to fetch top analysts', 'FETCH_ERROR'),
      { status: 500 }
    );
  }
}