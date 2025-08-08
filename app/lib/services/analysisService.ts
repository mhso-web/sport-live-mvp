import { PrismaClient, SportAnalysis, AnalysisPrediction, Prisma } from '@prisma/client';
import { CreateAnalysisDto, UpdateAnalysisDto, AnalysisFilters, AnalysisSortOptions } from '@/types/analysis.types';
import { ApiError } from '@/lib/api/errors';
import slugify from 'slugify';

const prisma = new PrismaClient();

export class AnalysisService {
  /**
   * Create a new analysis
   */
  static async create(data: CreateAnalysisDto, authorId: number) {
    // Generate slug from title
    const baseSlug = slugify(
      `${data.matchDate.split('T')[0]}-${data.homeTeam}-vs-${data.awayTeam}`,
      { lower: true, strict: true }
    );
    
    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.sportAnalysis.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create analysis with predictions
    const analysis = await prisma.sportAnalysis.create({
      data: {
        authorId,
        matchDate: new Date(data.matchDate),
        sportType: data.sportType as any,
        league: data.league,
        competition: data.competition,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        title: data.title,
        slug,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords || [],
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
      },
    });

    // Update analyst's total predictions count
    await prisma.analystProfile.update({
      where: { userId: authorId },
      data: {
        totalPredictions: {
          increment: data.predictions.length,
        },
      },
    });

    return analysis;
  }

  /**
   * Update an existing analysis
   */
  static async update(id: number, data: UpdateAnalysisDto, userId: number) {
    // Check ownership
    const existing = await prisma.sportAnalysis.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError('Analysis not found', 404);
    }

    if (existing.authorId !== userId) {
      throw new ApiError('Unauthorized to update this analysis', 403);
    }

    // Update analysis
    const analysis = await prisma.sportAnalysis.update({
      where: { id },
      data: {
        matchDate: data.matchDate ? new Date(data.matchDate) : undefined,
        sportType: data.sportType as any,
        league: data.league,
        competition: data.competition,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        title: data.title,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
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
        status: data.status as any,
        isPublished: data.isPublished,
        publishedAt: data.isPublished && !existing.publishedAt ? new Date() : undefined,
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
      },
    });

    return analysis;
  }

  /**
   * Get analysis by ID or slug
   */
  static async getByIdOrSlug(idOrSlug: string) {
    const isNumeric = /^\d+$/.test(idOrSlug);
    
    const analysis = await prisma.sportAnalysis.findFirst({
      where: isNumeric
        ? { id: parseInt(idOrSlug) }
        : { slug: idOrSlug },
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
        comments: {
          where: { isDeleted: false },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                level: true,
              },
            },
            replies: {
              where: { isDeleted: false },
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    level: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            analysisLikes: true,
            comments: true,
          },
        },
      },
    });

    if (!analysis) {
      throw new ApiError('Analysis not found', 404);
    }

    // Increment view count
    await prisma.sportAnalysis.update({
      where: { id: analysis.id },
      data: { views: { increment: 1 } },
    });

    // Update analyst's total views
    if (analysis.author?.analystProfile) {
      await prisma.analystProfile.update({
        where: { id: analysis.author.analystProfile.id },
        data: { totalViews: { increment: 1 } },
      });
    }

    return analysis;
  }

  /**
   * Get analysis list with filters
   */
  static async getList(
    filters: AnalysisFilters,
    sortOptions: AnalysisSortOptions,
    page: number = 1,
    pageSize: number = 20
  ) {
    const where: Prisma.SportAnalysisWhereInput = {
      isPublished: true,
      status: 'PUBLISHED',
    };

    if (filters.sportType) {
      where.sportType = filters.sportType as any;
    }

    if (filters.league) {
      where.league = filters.league;
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters.startDate) {
      where.matchDate = {
        ...where.matchDate as any,
        gte: new Date(filters.startDate),
      };
    }

    if (filters.endDate) {
      where.matchDate = {
        ...where.matchDate as any,
        lte: new Date(filters.endDate),
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { homeTeam: { contains: filters.search, mode: 'insensitive' } },
        { awayTeam: { contains: filters.search, mode: 'insensitive' } },
        { league: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Determine sort order
    let orderBy: Prisma.SportAnalysisOrderByWithRelationInput = {};
    switch (sortOptions.sortBy) {
      case 'date':
        orderBy = { matchDate: sortOptions.sortOrder || 'desc' };
        break;
      case 'views':
        orderBy = { views: sortOptions.sortOrder || 'desc' };
        break;
      case 'likes':
        orderBy = { likes: sortOptions.sortOrder || 'desc' };
        break;
      default:
        orderBy = { publishedAt: 'desc' };
    }

    const [analyses, total] = await Promise.all([
      prisma.sportAnalysis.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              level: true,
              analystProfile: true,
            },
          },
          _count: {
            select: {
              analysisLikes: true,
              comments: true,
              predictions: true,
            },
          },
        },
      }),
      prisma.sportAnalysis.count({ where }),
    ]);

    return {
      analyses,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Toggle like on analysis
   */
  static async toggleLike(analysisId: number, userId: number) {
    const existing = await prisma.analysisLike.findUnique({
      where: {
        analysisId_userId: {
          analysisId,
          userId,
        },
      },
    });

    if (existing) {
      // Unlike
      await prisma.analysisLike.delete({
        where: { id: existing.id },
      });

      await prisma.sportAnalysis.update({
        where: { id: analysisId },
        data: { likes: { decrement: 1 } },
      });

      return { liked: false };
    } else {
      // Like
      await prisma.analysisLike.create({
        data: {
          analysisId,
          userId,
        },
      });

      await prisma.sportAnalysis.update({
        where: { id: analysisId },
        data: { likes: { increment: 1 } },
      });

      // Update analyst's total likes
      const analysis = await prisma.sportAnalysis.findUnique({
        where: { id: analysisId },
        include: { 
          author: {
            include: {
              analystProfile: true
            }
          }
        },
      });

      if (analysis?.author?.analystProfile) {
        await prisma.analystProfile.update({
          where: { id: analysis.author.analystProfile.id },
          data: { totalLikes: { increment: 1 } },
        });
      }

      return { liked: true };
    }
  }

  /**
   * Update prediction results after match
   */
  static async updatePredictionResults(
    analysisId: number,
    homeScore: number,
    awayScore: number
  ) {
    const analysis = await prisma.sportAnalysis.findUnique({
      where: { id: analysisId },
      include: { predictions: true },
    });

    if (!analysis) {
      throw new ApiError('Analysis not found', 404);
    }

    // Update actual scores
    await prisma.sportAnalysis.update({
      where: { id: analysisId },
      data: {
        actualHomeScore: homeScore,
        actualAwayScore: awayScore,
      },
    });

    // Evaluate each prediction
    for (const prediction of analysis.predictions) {
      let result: 'correct' | 'incorrect' | 'partial' = 'incorrect';

      // Evaluate based on bet type
      switch (prediction.betType) {
        case 'MATCH_RESULT':
          if (
            (homeScore > awayScore && prediction.prediction.includes('홈')) ||
            (homeScore < awayScore && prediction.prediction.includes('원정')) ||
            (homeScore === awayScore && prediction.prediction.includes('무'))
          ) {
            result = 'correct';
          }
          break;

        case 'OVER_UNDER':
          const totalGoals = homeScore + awayScore;
          const overUnderValue = parseFloat(prediction.prediction.match(/\d+\.?\d*/)?.[0] || '0');
          if (
            (prediction.prediction.includes('오버') && totalGoals > overUnderValue) ||
            (prediction.prediction.includes('언더') && totalGoals < overUnderValue)
          ) {
            result = 'correct';
          }
          break;

        // Add more bet type evaluations as needed
      }

      await prisma.analysisPrediction.update({
        where: { id: prediction.id },
        data: { result: result as any },
      });

      // Update analyst's accuracy
      if (result === 'correct') {
        await prisma.analystProfile.update({
          where: { userId: prediction.authorId },
          data: {
            correctPredictions: { increment: 1 },
          },
        });
      }
    }

    // Recalculate analyst's accuracy
    const analyst = await prisma.analystProfile.findUnique({
      where: { userId: analysis.authorId },
    });

    if (analyst && analyst.totalPredictions > 0) {
      const accuracy = (analyst.correctPredictions / analyst.totalPredictions) * 100;
      await prisma.analystProfile.update({
        where: { userId: analysis.authorId },
        data: { averageAccuracy: accuracy },
      });
    }
  }

  /**
   * Get top analysts
   */
  static async getTopAnalysts(limit: number = 10) {
    return prisma.analystProfile.findMany({
      where: {
        isVerified: true,
        totalPredictions: { gte: 10 }, // Minimum 10 predictions
      },
      orderBy: [
        { averageAccuracy: 'desc' },
        { totalViews: 'desc' },
      ],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            level: true,
          },
        },
      },
    });
  }
}