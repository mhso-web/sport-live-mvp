import { PrismaClient, SportAnalysis, Prisma } from '@prisma/client';
import { CreateAnalysisDto } from '@/types/analysis.types';
import { ApiError } from '@/lib/api/errors';
import slugify from 'slugify';
import { 
  generateAnalysisSeoUrl, 
  generateSportSlug, 
  generateLeagueSlug, 
  generateTeamSlug 
} from '@/lib/utils/seoUrl';

const prisma = new PrismaClient();

/**
 * Enhanced AnalysisService with SEO URL support
 */
export class AnalysisServiceSEO {
  /**
   * Create a new analysis with SEO-optimized URL
   */
  static async createWithSeoUrl(data: CreateAnalysisDto, authorId: number) {
    // Start a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // 1. Find or create Sport entity
      const sportSlug = generateSportSlug(data.sportType);
      let sport = await tx.sport.findUnique({
        where: { slug: sportSlug }
      });
      
      if (!sport) {
        // Create sport if it doesn't exist
        sport = await tx.sport.create({
          data: {
            slug: sportSlug,
            nameEn: data.sportType,
            nameKo: this.getSportNameKo(data.sportType),
            icon: this.getSportIcon(data.sportType),
            keywords: [data.sportType, sportSlug]
          }
        });
      }
      
      // 2. Find or create League entity
      const leagueSlug = generateLeagueSlug(data.league);
      let league = await tx.league.findFirst({
        where: {
          slug: leagueSlug,
          sportId: sport.id
        }
      });
      
      if (!league) {
        // Create league if it doesn't exist
        league = await tx.league.create({
          data: {
            slug: leagueSlug,
            sportId: sport.id,
            nameEn: data.league,
            nameKo: this.getLeagueNameKo(data.league),
            country: this.detectCountryFromLeague(data.league),
            currentSeason: this.getCurrentSeason(),
            keywords: [data.league, leagueSlug]
          }
        });
      }
      
      // 3. Find or create Home Team
      const homeTeamSlug = generateTeamSlug(data.homeTeam);
      let homeTeam = await tx.team.findUnique({
        where: { slug: homeTeamSlug }
      });
      
      if (!homeTeam) {
        homeTeam = await tx.team.create({
          data: {
            slug: homeTeamSlug,
            sportId: sport.id,
            nameEn: data.homeTeam,
            nameKo: data.homeTeam, // Will need translation service
            country: league.country,
            keywords: [data.homeTeam, homeTeamSlug]
          }
        });
        
        // Create team-league relationship
        await tx.teamLeague.create({
          data: {
            teamId: homeTeam.id,
            leagueId: league.id,
            season: league.currentSeason || '2025'
          }
        });
      }
      
      // 4. Find or create Away Team
      const awayTeamSlug = generateTeamSlug(data.awayTeam);
      let awayTeam = await tx.team.findUnique({
        where: { slug: awayTeamSlug }
      });
      
      if (!awayTeam) {
        awayTeam = await tx.team.create({
          data: {
            slug: awayTeamSlug,
            sportId: sport.id,
            nameEn: data.awayTeam,
            nameKo: data.awayTeam, // Will need translation service
            country: league.country,
            keywords: [data.awayTeam, awayTeamSlug]
          }
        });
        
        // Create team-league relationship
        await tx.teamLeague.create({
          data: {
            teamId: awayTeam.id,
            leagueId: league.id,
            season: league.currentSeason || '2025'
          }
        });
      }
      
      // 5. Generate SEO URL
      const seoUrl = generateAnalysisSeoUrl({
        sport: { slug: sport.slug },
        league: { slug: league.slug },
        matchDate: data.matchDate,
        homeTeam: { slug: homeTeam.slug },
        awayTeam: { slug: awayTeam.slug }
      });
      
      // Remove the leading /analysis/ from the URL to store just the slug part
      const seoSlug = seoUrl.replace('/analysis/', '');
      
      // 6. Generate old-style slug for backward compatibility
      const baseSlug = slugify(
        `${data.matchDate.split('T')[0]}-${data.homeTeam}-vs-${data.awayTeam}`,
        { lower: true, strict: true }
      );
      
      // Ensure unique slug
      let slug = baseSlug;
      let counter = 1;
      while (await tx.sportAnalysis.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      // 7. Create the analysis with all relationships
      const analysis = await tx.sportAnalysis.create({
        data: {
          authorId,
          matchDate: new Date(data.matchDate),
          sportType: data.sportType as any,
          league: data.league,
          competition: data.competition,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam,
          
          // SEO fields
          title: data.title,
          slug, // Old-style slug for backward compatibility
          seoSlug, // New SEO-optimized slug
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords || [],
          
          // New foreign key relationships
          sportId: sport.id,
          leagueId: league.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          
          // Analysis content
          homeFormation: data.homeFormation,
          awayFormation: data.awayFormation,
          homeAnalysis: data.homeAnalysis,
          awayAnalysis: data.awayAnalysis,
          tacticalAnalysis: data.tacticalAnalysis,
          keyPlayers: data.keyPlayers,
          injuryInfo: data.injuryInfo,
          headToHead: data.headToHead,
          recentForm: data.recentForm,
          predictionSummary: data.predictionSummary,
          confidenceLevel: data.confidenceLevel,
          
          // Create predictions
          predictions: {
            create: data.predictions.map(pred => ({
              authorId,
              betType: pred.betType as any,
              prediction: pred.prediction,
              odds: pred.odds,
              stake: pred.stake,
              reasoning: pred.reasoning,
            })),
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              level: true,
              analystProfile: true,
            },
          },
          predictions: true,
          sport: true,
          leagueRef: true,
          homeTeamRef: true,
          awayTeamRef: true,
        },
      });
      
      // 8. Update analyst's total predictions count
      await tx.analystProfile.update({
        where: { userId: authorId },
        data: {
          totalPredictions: {
            increment: data.predictions.length,
          },
        },
      });
      
      return {
        ...analysis,
        seoUrl // Return the full SEO URL for frontend navigation
      };
    });
  }
  
  /**
   * Helper: Get Korean name for sport
   */
  private static getSportNameKo(sportType: string): string {
    const mapping: Record<string, string> = {
      'soccer': '축구',
      'baseball': '야구',
      'basketball': '농구',
      'esports': 'e스포츠',
      'volleyball': '배구',
      'tennis': '테니스',
      'golf': '골프'
    };
    return mapping[sportType.toLowerCase()] || sportType;
  }
  
  /**
   * Helper: Get sport icon
   */
  private static getSportIcon(sportType: string): string {
    const mapping: Record<string, string> = {
      'soccer': '⚽',
      'baseball': '⚾',
      'basketball': '🏀',
      'esports': '🎮',
      'volleyball': '🏐',
      'tennis': '🎾',
      'golf': '⛳'
    };
    return mapping[sportType.toLowerCase()] || '🏆';
  }
  
  /**
   * Helper: Get Korean name for league
   */
  private static getLeagueNameKo(league: string): string {
    const mapping: Record<string, string> = {
      'Premier League': '프리미어리그',
      'La Liga': '라리가',
      'Serie A': '세리에A',
      'Bundesliga': '분데스리가',
      'Ligue 1': '리그1',
      'K League 1': 'K리그1',
      'MLB': 'MLB',
      'KBO': 'KBO',
      'NBA': 'NBA',
      'KBL': 'KBL'
    };
    return mapping[league] || league;
  }
  
  /**
   * Helper: Detect country from league name
   */
  private static detectCountryFromLeague(league: string): string {
    const mapping: Record<string, string> = {
      'Premier League': 'GB',
      'La Liga': 'ES',
      'Serie A': 'IT',
      'Bundesliga': 'DE',
      'Ligue 1': 'FR',
      'K League': 'KR',
      'K리그': 'KR',
      'MLB': 'US',
      'KBO': 'KR',
      'NBA': 'US',
      'KBL': 'KR'
    };
    
    for (const [key, value] of Object.entries(mapping)) {
      if (league.includes(key)) {
        return value;
      }
    }
    
    return 'XX'; // Unknown country
  }
  
  /**
   * Helper: Get current season
   */
  private static getCurrentSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // For European leagues (Aug-May)
    if (month >= 7) {
      return `${year}/${(year + 1).toString().slice(2)}`;
    } else {
      return `${year - 1}/${year.toString().slice(2)}`;
    }
  }
}