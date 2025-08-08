import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HomeService {
  /**
   * 오늘의 경기 일정 가져오기
   */
  static async getTodayMatches() {
    // Use UTC dates to avoid timezone issues
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    return await prisma.match.findMany({
      where: {
        scheduledTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        sport: true,
        leagueRef: true,
        homeTeamRef: true,
        awayTeamRef: true,
      },
      orderBy: {
        scheduledTime: 'asc',
      },
      take: 10, // 최대 10경기만 표시
    });
  }

  /**
   * 오늘의 경기 분석 가져오기
   */
  static async getTodayAnalysis() {
    // Use UTC dates to avoid timezone issues
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const analyses = await prisma.sportAnalysis.findMany({
      where: {
        matchDate: {
          gte: today,
          lt: tomorrow,
        },
        isPublished: true,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          include: {
            analystProfile: true,
          },
        },
        sport: true,
        leagueRef: true,
      },
      orderBy: {
        views: 'desc', // 조회수 높은 순
      },
      take: 6, // 최대 6개 분석
    });

    // Convert Decimal to number for averageAccuracy
    return analyses.map(analysis => ({
      ...analysis,
      author: {
        ...analysis.author,
        analystProfile: analysis.author.analystProfile ? {
          ...analysis.author.analystProfile,
          averageAccuracy: analysis.author.analystProfile.averageAccuracy 
            ? Number(analysis.author.analystProfile.averageAccuracy)
            : null
        } : null
      }
    }));
  }

  /**
   * 게시판별 최근 글 가져오기
   */
  static async getRecentPostsByCategory() {
    const categories = await prisma.boardCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        orderIndex: 'asc',
      },
      take: 4, // 최대 4개 카테고리
    });

    const postsPromises = categories.map(async (category) => {
      const posts = await prisma.post.findMany({
        where: {
          categoryId: category.id,
          isDeleted: false,
        },
        select: {
          id: true,
          title: true,
          views: true,
          createdAt: true,
          user: {
            select: {
              username: true,
              level: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });

      return {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
        },
        posts,
      };
    });

    return await Promise.all(postsPromises);
  }

  /**
   * 공지사항 가져오기
   */
  static async getNotices() {
    return await prisma.post.findMany({
      where: {
        isPinned: true, // 고정된 글을 공지사항으로 사용
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });
  }

  /**
   * 보증업체 배너 가져오기
   */
  static async getPartnerBanners() {
    const partners = await prisma.partner.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        bannerImage: true,
        description: true,
        websiteUrl: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6, // 양쪽 3개씩
    });

    // 평균 평점 계산
    const partnersWithRating = await Promise.all(
      partners.map(async (partner) => {
        const ratings = await prisma.partnerRating.aggregate({
          where: { partnerId: partner.id },
          _avg: { rating: true },
        });
        return {
          ...partner,
          rating: ratings._avg.rating || 0,
        };
      })
    );

    return partnersWithRating;
  }

  /**
   * 홈페이지 모든 데이터 한번에 가져오기 (성능 최적화)
   */
  static async getAllHomeData() {
    const [
      todayMatches,
      todayAnalysis,
      recentPosts,
      notices,
      partners,
    ] = await Promise.all([
      this.getTodayMatches(),
      this.getTodayAnalysis(),
      this.getRecentPostsByCategory(),
      this.getNotices(),
      this.getPartnerBanners(),
    ]);

    return {
      todayMatches,
      todayAnalysis,
      recentPosts,
      notices,
      partners,
    };
  }
}