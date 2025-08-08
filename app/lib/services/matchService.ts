import { prisma } from '@/lib/db';
import { Match, SportType, MatchStatus } from '@prisma/client';

// Map between TypeScript sport types and Prisma sport types
const sportTypeMap: Record<string, SportType> = {
  'football': 'SOCCER',
  'soccer': 'SOCCER',
  'baseball': 'BASEBALL',
  'basketball': 'BASKETBALL',
  'esports': 'ESPORTS',
  'volleyball': 'VOLLEYBALL',
  'tennis': 'TENNIS',
  'golf': 'GOLF',
};

const reverseSportTypeMap: Record<SportType, string> = {
  'SOCCER': 'football',
  'BASEBALL': 'baseball',
  'BASKETBALL': 'basketball',
  'ESPORTS': 'esports',
  'VOLLEYBALL': 'volleyball',
  'TENNIS': 'tennis',
  'GOLF': 'golf',
};

export class MatchService {
  /**
   * Get matches for a specific month
   */
  async getMatchesByMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const matches = await prisma.match.findMany({
      where: {
        scheduledTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    // Transform matches to frontend format
    return this.transformMatches(matches);
  }

  /**
   * Get matches for a specific date
   */
  async getMatchesByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const matches = await prisma.match.findMany({
      where: {
        scheduledTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    return this.transformMatches(matches);
  }

  /**
   * Get a single match by ID
   */
  async getMatchById(id: number) {
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { eventMinute: 'asc' },
        },
      },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    return this.transformMatch(match);
  }

  /**
   * Create a new match
   */
  async createMatch(data: {
    sportType: string;
    league?: string;
    season?: string;
    country?: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
    scheduledTime: Date;
    venue?: string;
    metadata?: any;
  }) {
    const prismaSportType = sportTypeMap[data.sportType];
    if (!prismaSportType) {
      throw new Error('Invalid sport type');
    }

    const match = await prisma.match.create({
      data: {
        sportType: prismaSportType,
        league: data.league,
        season: data.season,
        country: data.country,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        homeTeamLogo: data.homeTeamLogo,
        awayTeamLogo: data.awayTeamLogo,
        scheduledTime: data.scheduledTime,
        venue: data.venue,
        metadata: data.metadata,
      },
    });

    return this.transformMatch(match);
  }

  /**
   * Update match scores (for live updates)
   */
  async updateMatchScore(id: number, homeScore: number, awayScore: number, currentMinute?: number) {
    const match = await prisma.match.update({
      where: { id },
      data: {
        homeScore,
        awayScore,
        currentMinute,
        status: currentMinute ? 'LIVE' : undefined,
      },
    });

    return this.transformMatch(match);
  }

  /**
   * Update match status
   */
  async updateMatchStatus(id: number, status: MatchStatus) {
    const match = await prisma.match.update({
      where: { id },
      data: { status },
    });

    return this.transformMatch(match);
  }

  /**
   * Get upcoming matches
   */
  async getUpcomingMatches(limit: number = 10) {
    const matches = await prisma.match.findMany({
      where: {
        scheduledTime: {
          gte: new Date(),
        },
        status: 'SCHEDULED',
      },
      orderBy: {
        scheduledTime: 'asc',
      },
      take: limit,
    });

    return this.transformMatches(matches);
  }

  /**
   * Get live matches
   */
  async getLiveMatches() {
    const matches = await prisma.match.findMany({
      where: {
        status: 'LIVE',
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    return this.transformMatches(matches);
  }

  /**
   * Transform Prisma match to frontend format
   */
  private transformMatch(match: any) {
    return {
      id: match.id.toString(),
      sportType: reverseSportTypeMap[match.sportType] || match.sportType.toLowerCase(),
      status: match.status.toLowerCase() as any,
      homeTeam: {
        id: `team-${match.id}-home`,
        name: match.homeTeam,
        shortName: match.homeTeam.substring(0, 3).toUpperCase(),
        logo: match.homeTeamLogo,
        country: match.country,
      },
      awayTeam: {
        id: `team-${match.id}-away`,
        name: match.awayTeam,
        shortName: match.awayTeam.substring(0, 3).toUpperCase(),
        logo: match.awayTeamLogo,
        country: match.country,
      },
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      scheduledTime: match.scheduledTime,
      actualStartTime: match.status === 'LIVE' ? match.updatedAt : undefined,
      actualEndTime: match.status === 'FINISHED' ? match.updatedAt : undefined,
      venue: match.venue,
      competition: match.league || '',
      round: match.season,
      currentMinute: match.currentMinute,
      hasChat: true, // Default to true for now
      viewerCount: Math.floor(Math.random() * 1000), // Placeholder
      metadata: match.metadata,
      events: match.events || [],
    };
  }

  /**
   * Transform multiple matches
   */
  private transformMatches(matches: any[]) {
    const matchMap = new Map<string, any[]>();
    
    matches.forEach(match => {
      const transformed = this.transformMatch(match);
      const dateKey = this.getDateKey(match.scheduledTime);
      
      if (!matchMap.has(dateKey)) {
        matchMap.set(dateKey, []);
      }
      matchMap.get(dateKey)!.push(transformed);
    });

    return matchMap;
  }

  /**
   * Get date key in YYYY-MM-DD format
   */
  private getDateKey(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export const matchService = new MatchService();