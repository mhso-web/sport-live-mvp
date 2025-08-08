import { PrismaClient } from '@prisma/client';
import { cacheService } from './cacheService';

const prisma = new PrismaClient();

export interface TeamStats {
  teamId: string;
  teamName: string;
  recentMatches: any[];
  form: string; // e.g., "WWDLW"
  wins: number;
  draws: number;
  losses: number;
  avgGoals: number;
  avgConceded: number;
  playStyle?: string;
}

export interface HeadToHeadStats {
  homeWins: number;
  awayWins: number;
  draws: number;
  totalMatches: number;
  avgGoals: number;
  lastMeetings: any[];
}

export class StatsService {
  /**
   * Get team statistics
   */
  async getTeamStats(teamId: string): Promise<TeamStats> {
    const cacheKey = `team_stats_${teamId}`;
    const cached = await cacheService.get<TeamStats>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch recent matches for the team
      const recentMatches = await prisma.match.findMany({
        where: {
          OR: [
            { homeTeamId: parseInt(teamId) },
            { awayTeamId: parseInt(teamId) },
          ],
          status: 'FINISHED',
        },
        orderBy: { scheduledTime: 'desc' },
        take: 10,
        include: {
          homeTeamRef: true,
          awayTeamRef: true,
        },
      });

      // Calculate statistics
      let wins = 0, draws = 0, losses = 0;
      let totalScored = 0, totalConceded = 0;
      let form = '';

      recentMatches.slice(0, 5).forEach(match => {
        const isHome = match.homeTeamRef?.id === parseInt(teamId);
        const scored = isHome ? match.homeScore : match.awayScore;
        const conceded = isHome ? match.awayScore : match.homeScore;
        
        totalScored += scored;
        totalConceded += conceded;

        if (scored > conceded) {
          wins++;
          form = 'W' + form;
        } else if (scored === conceded) {
          draws++;
          form = 'D' + form;
        } else {
          losses++;
          form = 'L' + form;
        }
      });

      const stats: TeamStats = {
        teamId,
        teamName: recentMatches[0]?.homeTeamRef?.nameKo || recentMatches[0]?.awayTeamRef?.nameKo || 'Unknown Team',
        recentMatches: recentMatches.slice(0, 5).map(m => ({
          home: m.homeTeam,
          away: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          date: m.scheduledTime,
        })),
        form: form.slice(0, 5),
        wins,
        draws,
        losses,
        avgGoals: recentMatches.length > 0 ? totalScored / Math.min(recentMatches.length, 5) : 0,
        avgConceded: recentMatches.length > 0 ? totalConceded / Math.min(recentMatches.length, 5) : 0,
        playStyle: this.determinePlayStyle(totalScored, totalConceded, recentMatches.length),
      };

      // Cache for 1 hour
      await cacheService.set(cacheKey, stats, 3600);
      return stats;
    } catch (error) {
      console.error('Error fetching team stats:', error);
      // Return default stats on error
      return {
        teamId,
        teamName: 'Unknown Team',
        recentMatches: [],
        form: '',
        wins: 0,
        draws: 0,
        losses: 0,
        avgGoals: 0,
        avgConceded: 0,
      };
    }
  }

  /**
   * Get head-to-head statistics
   */
  async getHeadToHead(homeTeamId: string, awayTeamId: string): Promise<HeadToHeadStats> {
    const cacheKey = `h2h_${homeTeamId}_${awayTeamId}`;
    const cached = await cacheService.get<HeadToHeadStats>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch previous meetings
      const meetings = await prisma.match.findMany({
        where: {
          OR: [
            {
              AND: [
                { homeTeamId: parseInt(homeTeamId) },
                { awayTeamId: parseInt(awayTeamId) },
              ],
            },
            {
              AND: [
                { homeTeamId: parseInt(awayTeamId) },
                { awayTeamId: parseInt(homeTeamId) },
              ],
            },
          ],
          status: 'FINISHED',
        },
        orderBy: { scheduledTime: 'desc' },
        take: 10,
        include: {
          homeTeamRef: true,
          awayTeamRef: true,
        },
      });

      let homeWins = 0, awayWins = 0, draws = 0;
      let totalGoals = 0;

      meetings.forEach(match => {
        const isOriginalHome = match.homeTeamId === parseInt(homeTeamId);
        const homeScore = isOriginalHome ? match.homeScore : match.awayScore;
        const awayScore = isOriginalHome ? match.awayScore : match.homeScore;
        
        totalGoals += homeScore + awayScore;

        if (homeScore > awayScore) {
          homeWins++;
        } else if (homeScore < awayScore) {
          awayWins++;
        } else {
          draws++;
        }
      });

      const stats: HeadToHeadStats = {
        homeWins,
        awayWins,
        draws,
        totalMatches: meetings.length,
        avgGoals: meetings.length > 0 ? totalGoals / meetings.length : 0,
        lastMeetings: meetings.slice(0, 5).map(m => ({
          home: m.homeTeam,
          away: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          date: m.scheduledTime,
        })),
      };

      // Cache for 1 hour
      await cacheService.set(cacheKey, stats, 3600);
      return stats;
    } catch (error) {
      console.error('Error fetching H2H stats:', error);
      // Return default stats on error
      return {
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        totalMatches: 0,
        avgGoals: 0,
        lastMeetings: [],
      };
    }
  }

  /**
   * Determine play style based on statistics
   */
  private determinePlayStyle(scored: number, conceded: number, matches: number): string {
    if (matches === 0) return '데이터 부족';
    
    const avgScored = scored / matches;
    const avgConceded = conceded / matches;
    
    if (avgScored > 2.0 && avgConceded > 1.5) {
      return '공격적';
    } else if (avgScored < 1.0 && avgConceded < 1.0) {
      return '수비적';
    } else if (avgScored > 1.5 && avgConceded < 1.0) {
      return '균형적 (공격 우세)';
    } else if (avgScored < 1.5 && avgConceded < 1.0) {
      return '균형적 (수비 우세)';
    } else {
      return '균형적';
    }
  }

  /**
   * Get recent form string (W/D/L)
   */
  async getRecentForm(teamId: string, matches: number = 5): Promise<string> {
    const stats = await this.getTeamStats(teamId);
    return stats.form;
  }

  /**
   * Get team's average statistics
   */
  async getTeamAverages(teamId: string): Promise<{
    goals: number;
    conceded: number;
    possession?: number;
  }> {
    const stats = await this.getTeamStats(teamId);
    return {
      goals: stats.avgGoals,
      conceded: stats.avgConceded,
      possession: 50, // Default, could be fetched from external API
    };
  }
}

export const statsService = new StatsService();