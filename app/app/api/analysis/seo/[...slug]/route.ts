import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '@/lib/api-response';

const prisma = new PrismaClient();

/**
 * GET /api/analysis/seo/[...slug]
 * Fetches analysis by SEO-optimized URL structure
 * Example: /api/analysis/seo/soccer/premier-league/2025/08/liverpool-vs-bournemouth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    // Join the slug parts to create the seoSlug
    const seoSlug = params.slug.join('/');
    
    // First try to find by seoSlug field (if it exists)
    let analysis = await prisma.sportAnalysis.findFirst({
      where: {
        OR: [
          { seoSlug: seoSlug },
          { seoSlug: `/${seoSlug}` },
          { seoSlug: `analysis/${seoSlug}` }
        ]
      },
      include: {
        author: {
          include: {
            analystProfile: true
          }
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
              }
            },
            replies: {
              where: { isDeleted: false },
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    level: true,
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        sport: true,
        leagueRef: true,
        homeTeamRef: true,
        awayTeamRef: true,
        _count: {
          select: {
            analysisLikes: true,
            comments: true,
          }
        }
      }
    });
    
    // If not found by seoSlug, try to construct from URL parts
    if (!analysis && params.slug.length >= 5) {
      const [sport, league, year, month, matchSlug] = params.slug;
      
      // Parse the match slug to get team names
      const teams = matchSlug.split('-vs-');
      if (teams.length !== 2) {
        return ApiResponse.notFound('Analysis not found');
      }
      
      // Try to find by matching sport, league, and date range
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      // Find sport and league
      const sportEntity = await prisma.sport.findUnique({
        where: { slug: sport }
      });
      
      const leagueEntity = await prisma.league.findUnique({
        where: { slug: league }
      });
      
      if (sportEntity && leagueEntity) {
        analysis = await prisma.sportAnalysis.findFirst({
          where: {
            sportId: sportEntity.id,
            leagueId: leagueEntity.id,
            matchDate: {
              gte: startDate,
              lt: endDate
            },
            isPublished: true,
            status: 'PUBLISHED'
          },
          include: {
            author: {
              include: {
                analystProfile: true
              }
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
                  }
                },
                replies: {
                  where: { isDeleted: false },
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true,
                        level: true,
                      }
                    }
                  }
                }
              },
              orderBy: { createdAt: 'desc' }
            },
            sport: true,
            leagueRef: true,
            homeTeamRef: true,
            awayTeamRef: true,
            _count: {
              select: {
                analysisLikes: true,
                comments: true,
              }
            }
          }
        });
      }
    }
    
    // Fallback: Try to find by old slug format for backward compatibility
    if (!analysis) {
      // Extract possible old slug from the URL
      // Example: 2025-08-16-liverpool-vs-bournemouth
      const lastPart = params.slug[params.slug.length - 1];
      
      analysis = await prisma.sportAnalysis.findUnique({
        where: { slug: lastPart },
        include: {
          author: {
            include: {
              analystProfile: true
            }
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
                }
              },
              replies: {
                where: { isDeleted: false },
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      level: true,
                    }
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          sport: true,
          leagueRef: true,
          homeTeamRef: true,
          awayTeamRef: true,
          _count: {
            select: {
              analysisLikes: true,
              comments: true,
            }
          }
        }
      });
    }
    
    if (!analysis) {
      return ApiResponse.notFound('Analysis not found');
    }
    
    // Increment view count
    await prisma.sportAnalysis.update({
      where: { id: analysis.id },
      data: { views: { increment: 1 } }
    });
    
    // Update analyst's total views
    if (analysis.author?.analystProfile) {
      await prisma.analystProfile.update({
        where: { id: analysis.author.analystProfile.id },
        data: { totalViews: { increment: 1 } }
      });
    }
    
    // Generate SEO metadata
    const seo = {
      title: analysis.title,
      description: analysis.metaDescription || 
        `${analysis.homeTeam} vs ${analysis.awayTeam} match analysis and predictions for ${analysis.league}`,
      keywords: analysis.metaKeywords || [],
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/analysis/${seoSlug}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: analysis.title,
        description: analysis.metaDescription,
        datePublished: analysis.publishedAt,
        dateModified: analysis.updatedAt,
        author: {
          '@type': 'Person',
          name: analysis.author?.username,
          url: analysis.author?.analystProfile ? 
            `${process.env.NEXT_PUBLIC_BASE_URL}/analysts/${analysis.author.username}` : undefined
        },
        publisher: {
          '@type': 'Organization',
          name: 'Sports Live',
          logo: {
            '@type': 'ImageObject',
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${process.env.NEXT_PUBLIC_BASE_URL}/analysis/${seoSlug}`,
        },
        articleSection: analysis.sport?.nameEn || 'Sports',
        about: {
          '@type': 'SportsEvent',
          name: `${analysis.homeTeam} vs ${analysis.awayTeam}`,
          startDate: analysis.matchDate,
          sport: analysis.sport?.nameEn,
          location: {
            '@type': 'Place',
            name: analysis.homeTeamRef?.stadium || analysis.league
          }
        }
      },
    };
    
    return ApiResponse.success({
      analysis,
      seo,
    });
  } catch (error) {
    console.error('Error fetching analysis by SEO URL:', error);
    return ApiResponse.internalError('Failed to fetch analysis');
  }
}