import { NextRequest } from 'next/server';
import { matchService } from '@/lib/services/matchService';
import { ApiResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const date = searchParams.get('date');
    const type = searchParams.get('type'); // 'upcoming', 'live'

    // Get specific date matches
    if (date) {
      const matches = await matchService.getMatchesByDate(new Date(date));
      return ApiResponse.success(matches);
    }

    // Get month matches for calendar
    if (year && month) {
      const matches = await matchService.getMatchesByMonth(
        parseInt(year),
        parseInt(month)
      );
      
      // Convert Map to object for JSON serialization
      const matchesObject: Record<string, any> = {};
      matches.forEach((value, key) => {
        matchesObject[key] = value;
      });
      
      return ApiResponse.success(matchesObject);
    }

    // Get special match lists
    if (type === 'upcoming') {
      const matches = await matchService.getUpcomingMatches();
      return ApiResponse.success(matches);
    }

    if (type === 'live') {
      const matches = await matchService.getLiveMatches();
      return ApiResponse.success(matches);
    }

    // Default: get current month
    const now = new Date();
    const matches = await matchService.getMatchesByMonth(
      now.getFullYear(),
      now.getMonth() + 1
    );
    
    // Convert Map to object for JSON serialization
    const matchesObject: Record<string, any> = {};
    matches.forEach((value, key) => {
      matchesObject[key] = value;
    });
    
    return ApiResponse.success(matchesObject);
  } catch (error) {
    console.error('Error in API /api/matches:', error);
    return ApiResponse.internalError(error instanceof Error ? error.message : 'Failed to process request');
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.sportType || !data.homeTeam || !data.awayTeam || !data.scheduledTime) {
      return ApiResponse.error({
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields',
      }, 400);
    }

    const match = await matchService.createMatch({
      sportType: data.sportType,
      league: data.league,
      season: data.season,
      country: data.country,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      homeTeamLogo: data.homeTeamLogo,
      awayTeamLogo: data.awayTeamLogo,
      scheduledTime: new Date(data.scheduledTime),
      venue: data.venue,
      metadata: data.metadata,
    });

    return ApiResponse.success(match, 201);
  } catch (error) {
    console.error('Error in API /api/matches:', error);
    return ApiResponse.internalError(error instanceof Error ? error.message : 'Failed to process request');
  }
}