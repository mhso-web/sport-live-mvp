import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { PrismaClient } from '@prisma/client';
import { AnalysisService } from '@/lib/services/analysisService';
import { ApiResponse } from '@/lib/api-response';

const prisma = new PrismaClient();

// GET /api/analysis/[slug] - Get analysis by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const analysis = await AnalysisService.getByIdOrSlug(params.slug);
    
    // Generate SEO metadata
    const seo = {
      title: analysis.title,
      description: analysis.metaDescription || 
        `${analysis.homeTeam} vs ${analysis.awayTeam} match analysis and predictions for ${analysis.league}`,
      keywords: analysis.metaKeywords || [],
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/analysis/${analysis.slug}`,
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
          '@id': `${process.env.NEXT_PUBLIC_BASE_URL}/analysis/${analysis.slug}`,
        },
      },
    };
    
    return ApiResponse.success({
      analysis,
      seo,
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return ApiResponse.notFound('Analysis not found');
    }
    return ApiResponse.internalError('Failed to fetch analysis');
  }
}

// PUT /api/analysis/[slug] - Update analysis
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return ApiResponse.unauthorized('Authentication required');
    }

    const data = await request.json();
    
    // Get analysis ID from slug
    const existingAnalysis = await AnalysisService.getByIdOrSlug(params.slug);
    if (!existingAnalysis) {
      return ApiResponse.notFound('Analysis not found');
    }
    
    const updatedAnalysis = await AnalysisService.update(
      existingAnalysis.id,
      data,
      parseInt(session.user.id)
    );
    
    return ApiResponse.success(updatedAnalysis);
  } catch (error) {
    console.error('Error updating analysis:', error);
    return ApiResponse.internalError('Failed to update analysis');
  }
}

// DELETE /api/analysis/[slug] - Delete analysis
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Get analysis and check ownership
    const analysis = await AnalysisService.getByIdOrSlug(params.slug);
    if (!analysis) {
      return ApiResponse.notFound('Analysis not found');
    }
    
    if (analysis.authorId !== parseInt(session.user.id) && session.user.role !== 'ADMIN') {
      return ApiResponse.forbidden('Not authorized to delete this analysis');
    }
    
    // Soft delete by updating status
    await prisma.sportAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: 'ARCHIVED',
        isPublished: false,
      },
    });
    
    return ApiResponse.success({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return ApiResponse.internalError('Failed to delete analysis');
  }
}