import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';

interface PageProps {
  params: {
    slug: string[];
  };
}

/**
 * Catch-all route that handles both old and new analysis URL formats:
 * - Old format: /analysis/[slug] (e.g., /analysis/2025-08-16-liverpool-vs-bournemouth)
 * - New format: /analysis/[sport]/[league]/[year]/[month]/[slug] 
 *   (e.g., /analysis/soccer/premier-league/2025/08/liverpool-vs-bournemouth)
 */
async function getAnalysis(slug: string[]) {
  try {
    // Determine if this is an old or new format URL
    let response;
    
    if (slug.length === 1) {
      // Old format: single slug
      response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/analysis/${slug[0]}`,
        { 
          next: { 
            revalidate: 300 // Cache for 5 minutes
          }
        }
      );
    } else if (slug.length === 5) {
      // New SEO format: sport/league/year/month/match-slug
      const seoSlug = slug.join('/');
      response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/analysis/seo/${seoSlug}`,
        { 
          next: { 
            revalidate: 300 // Cache for 5 minutes
          }
        }
      );
    } else {
      // Invalid format
      return null;
    }
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (!data.success) {
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getAnalysis(params.slug);
  
  if (!data) {
    return {
      title: '분석을 찾을 수 없습니다 | Sports Live',
      description: '요청하신 분석을 찾을 수 없습니다.',
      robots: 'noindex, nofollow',
    };
  }
  
  const analysis = data.analysis || data;
  const seo = data.seo || {};
  const canonicalUrl = analysis.seoUrl 
    ? `${process.env.NEXT_PUBLIC_BASE_URL}${analysis.seoUrl}`
    : `${process.env.NEXT_PUBLIC_BASE_URL}/analysis/${params.slug.join('/')}`;
  
  return {
    title: seo.title || analysis.title || '경기 분석 | Sports Live',
    description: seo.description || analysis.metaDescription || '상세한 경기 분석과 예측',
    keywords: seo.keywords || analysis.metaKeywords || [],
    authors: analysis.author ? [{ name: analysis.author.username }] : [],
    publisher: 'Sports Live',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo.title || analysis.title,
      description: seo.description || analysis.metaDescription,
      url: canonicalUrl,
      siteName: 'Sports Live',
      locale: 'ko_KR',
      type: 'article',
      publishedTime: analysis.publishedAt,
      modifiedTime: analysis.updatedAt,
      authors: analysis.author ? [analysis.author.username] : [],
      tags: analysis.metaKeywords || [],
      section: analysis.sport?.nameKo || '스포츠',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${encodeURIComponent(analysis.title)}`,
          width: 1200,
          height: 630,
          alt: analysis.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title || analysis.title,
      description: seo.description || analysis.metaDescription,
      site: '@sportslive',
      creator: analysis.author ? `@${analysis.author.username}` : '@sportslive',
      images: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${encodeURIComponent(analysis.title)}`],
    },
  };
}

export default async function AnalysisPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const data = await getAnalysis(params.slug);
  
  if (!data) {
    notFound();
  }
  
  const analysis = data.analysis || data;

  return (
    <main className="min-h-screen bg-gray-900">
      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-gray-400">
              <li>
                <a href="/" className="hover:text-gray-200">홈</a>
              </li>
              <li className="before:content-['/'] before:mx-2">
                <a href="/analysis" className="hover:text-gray-200">경기 분석</a>
              </li>
              {analysis.sport && (
                <li className="before:content-['/'] before:mx-2">
                  <a href={`/analysis/${analysis.sport.slug}`} className="hover:text-gray-200">
                    {analysis.sport.nameKo}
                  </a>
                </li>
              )}
              {analysis.leagueRef && (
                <li className="before:content-['/'] before:mx-2">
                  <a href={`/analysis/${analysis.sport?.slug}/${analysis.leagueRef.slug}`} className="hover:text-gray-200">
                    {analysis.leagueRef.nameKo}
                  </a>
                </li>
              )}
              <li className="before:content-['/'] before:mx-2 text-gray-200">
                {analysis.homeTeamRef?.nameKo || analysis.homeTeam} vs {analysis.awayTeamRef?.nameKo || analysis.awayTeam}
              </li>
            </ol>
          </nav>
          
          {/* Header */}
          <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {analysis.sport?.icon && (
              <span className="text-2xl">{analysis.sport.icon}</span>
            )}
            <span className="px-3 py-1 bg-gray-700 rounded text-sm text-gray-300">
              {analysis.leagueRef?.nameKo || analysis.league}
            </span>
            {analysis.competition && (
              <span className="px-3 py-1 bg-blue-900 rounded text-sm text-blue-300">
                {analysis.competition}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-100 mb-4">
            {analysis.title}
          </h1>
          
          <div className="flex items-center gap-4 text-gray-400" itemScope itemType="https://schema.org/Person">
            {analysis.author && (
              <div className="flex items-center gap-2">
                <span className="text-gray-100" itemProp="name">{analysis.author.username}</span>
                {analysis.author.analystProfile && analysis.author.analystProfile.averageAccuracy != null && (
                  <span className="text-xs text-gray-500">
                    정확도 {typeof analysis.author.analystProfile.averageAccuracy === 'number' 
                      ? analysis.author.analystProfile.averageAccuracy.toFixed(1) 
                      : analysis.author.analystProfile.averageAccuracy}%
                  </span>
                )}
              </div>
            )}
            <span itemProp="interactionStatistic" itemScope itemType="https://schema.org/InteractionCounter">
              <meta itemProp="interactionType" content="https://schema.org/ViewAction" />
              조회수 <span itemProp="userInteractionCount">{analysis.views?.toLocaleString() || 0}</span>
            </span>
          </div>
          </header>
          
          {/* Match Info */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6" aria-labelledby="match-info-heading">
            <h2 id="match-info-heading" className="text-xl font-semibold text-gray-100 mb-4">경기 정보</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">홈팀</p>
              <p className="text-lg font-medium text-gray-100">
                {analysis.homeTeamRef?.nameKo || analysis.homeTeam}
              </p>
              {analysis.homeFormation && (
                <p className="text-sm text-gray-500">포메이션: {analysis.homeFormation}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">원정팀</p>
              <p className="text-lg font-medium text-gray-100">
                {analysis.awayTeamRef?.nameKo || analysis.awayTeam}
              </p>
              {analysis.awayFormation && (
                <p className="text-sm text-gray-500">포메이션: {analysis.awayFormation}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-1">경기 일시</p>
            <time className="text-lg text-gray-100" dateTime={analysis.matchDate}>
              {new Date(analysis.matchDate).toLocaleString('ko-KR')}
            </time>
          </div>
          </section>
          
          {/* Analysis Content */}
          <section className="space-y-6" aria-labelledby="analysis-heading">
            <h2 id="analysis-heading" className="sr-only">경기 분석 내용</h2>
          {/* Home Team Analysis */}
          {analysis.homeAnalysis && (
            <section className="bg-gray-800 rounded-lg p-6 border border-gray-700" aria-labelledby="home-analysis-heading">
              <h3 id="home-analysis-heading" className="text-lg font-medium text-blue-400 mb-3">
                {analysis.homeTeamRef?.nameKo || analysis.homeTeam} 분석
              </h3>
              <p className="text-gray-300 whitespace-pre-wrap">{analysis.homeAnalysis}</p>
            </section>
          )}
          
          {/* Away Team Analysis */}
          {analysis.awayAnalysis && (
            <section className="bg-gray-800 rounded-lg p-6 border border-gray-700" aria-labelledby="away-analysis-heading">
              <h3 id="away-analysis-heading" className="text-lg font-medium text-red-400 mb-3">
                {analysis.awayTeamRef?.nameKo || analysis.awayTeam} 분석
              </h3>
              <p className="text-gray-300 whitespace-pre-wrap">{analysis.awayAnalysis}</p>
            </section>
          )}
          
          {/* Tactical Analysis */}
          {analysis.tacticalAnalysis && (
            <section className="bg-gray-800 rounded-lg p-6 border border-gray-700" aria-labelledby="tactical-analysis-heading">
              <h3 id="tactical-analysis-heading" className="text-lg font-medium text-green-400 mb-3">전술 분석</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{analysis.tacticalAnalysis}</p>
            </section>
          )}
          
          {/* Prediction Summary */}
          {analysis.predictionSummary && (
            <section className="bg-gray-800 rounded-lg p-6 border border-gray-700" aria-labelledby="prediction-summary-heading">
              <h3 id="prediction-summary-heading" className="text-lg font-medium text-yellow-400 mb-3">예측 요약</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{analysis.predictionSummary}</p>
            </section>
          )}
          
          {/* Betting Predictions */}
          {analysis.predictions && analysis.predictions.length > 0 && (
            <section className="bg-gray-800 rounded-lg p-6 border border-gray-700" aria-labelledby="betting-predictions-heading">
              <h3 id="betting-predictions-heading" className="text-lg font-medium text-purple-400 mb-4">베팅 예측</h3>
              <div className="space-y-4">
                {analysis.predictions.map((prediction: any, index: number) => (
                  <div key={prediction.id || index} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">
                        {prediction.betType}
                      </span>
                      {prediction.result && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          prediction.result === 'correct' ? 'bg-green-900 text-green-400' :
                          prediction.result === 'incorrect' ? 'bg-red-900 text-red-400' :
                          'bg-gray-600 text-gray-400'
                        }`}>
                          {prediction.result === 'correct' ? '✅ 적중' :
                           prediction.result === 'incorrect' ? '❌ 실패' :
                           '⏳ 대기중'}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-100 font-medium mb-2">{prediction.prediction}</p>
                    
                    {(prediction.odds || prediction.stake) && (
                      <div className="flex items-center gap-4 text-sm mb-2">
                        {prediction.odds && (
                          <span className="text-gray-400">
                            배당률: <span className="text-gray-200">{prediction.odds}</span>
                          </span>
                        )}
                        {prediction.stake && (
                          <span className="text-gray-400">
                            추천: <span className="text-gray-200">{prediction.stake}유닛</span>
                          </span>
                        )}
                      </div>
                    )}
                    
                    {prediction.reasoning && (
                      <p className="text-sm text-gray-400">{prediction.reasoning}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          </section>
      </article>
    </main>
  );
}