import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { AnalysisService } from '@/lib/services/analysisService';
import { AnalysisServiceSEO } from '@/lib/services/analysisService.seo';
import { ApiResponse } from '@/lib/api-response';
import { requireAnalyst, requireAnalystProfile } from '@/lib/middleware/analystAuth';
import { CreateAnalysisDto, AnalysisFilters, AnalysisSortOptions } from '@/types/analysis.types';

// GET /api/analysis - Get analysis list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: AnalysisFilters = {
      sportType: searchParams.get('sportType') || undefined,
      league: searchParams.get('league') || undefined,
      authorId: searchParams.get('authorId') ? parseInt(searchParams.get('authorId')!) : undefined,
      status: searchParams.get('status') as any || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Parse sort options
    const sortOptions: AnalysisSortOptions = {
      sortBy: searchParams.get('sortBy') as any || 'date',
      sortOrder: searchParams.get('sortOrder') as any || 'desc',
    };

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const result = await AnalysisService.getList(filters, sortOptions, page, pageSize);

    return ApiResponse.success(result, {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return ApiResponse.error('Failed to fetch analyses', 500, 'FETCH_ERROR');
  }
}

// POST /api/analysis - Create new analysis (Analyst only)
export async function POST(request: NextRequest) {
  try {
    // Check analyst permission
    const permissionError = await requireAnalyst(request);
    if (permissionError) return permissionError;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Ensure analyst profile exists
    await requireAnalystProfile(parseInt(session.user.id));

    const data: CreateAnalysisDto = await request.json();

    // Validate required fields
    if (!data.matchDate || !data.sportType || !data.league || !data.homeTeam || !data.awayTeam) {
      return ApiResponse.badRequest('Missing required fields');
    }

    if (!data.title || !data.homeAnalysis || !data.awayAnalysis || !data.predictionSummary) {
      return ApiResponse.badRequest('Missing analysis content');
    }

    if (!data.predictions || data.predictions.length === 0) {
      return ApiResponse.badRequest('At least one prediction is required');
    }

    // Convert sportType to uppercase for Prisma enum
    // Also convert bet types to uppercase
    // Add default values for missing fields
    const analysisData = {
      ...data,
      sportType: data.sportType.toUpperCase() as any,
      predictions: data.predictions.map(pred => ({
        ...pred,
        betType: pred.betType.toUpperCase().replace(/-/g, '_') as any,
      })),
      // Add default values for fields not provided by the form
      keyPlayers: data.keyPlayers || { home: [], away: [] },
      injuryInfo: data.injuryInfo || { home: [], away: [] },
      headToHead: data.headToHead || { lastMeetings: [] },
      recentForm: data.recentForm || { home: [], away: [] },
      confidenceLevel: data.confidenceLevel || 3,
    };

    // Create analysis with SEO URL
    const analysis = await AnalysisServiceSEO.createWithSeoUrl(analysisData, parseInt(session.user.id));

    return ApiResponse.success({
      ...analysis,
      redirectUrl: analysis.seoUrl || `/analysis/${analysis.slug}`
    });
  } catch (error) {
    console.error('Error creating analysis:', error);
    return ApiResponse.internalError('Failed to create analysis');
  }
}