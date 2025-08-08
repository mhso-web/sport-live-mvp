'use client';

import Link from 'next/link';

interface Analysis {
  id: number;
  slug: string;
  title: string;
  metaDescription?: string | null;
  views: number;
  author: {
    username: string;
    analystProfile?: {
      averageAccuracy?: number | null;
    } | null;
  };
  sport: {
    nameKo: string;
    icon?: string | null;
    slug: string;
  } | null;
  leagueRef: {
    nameKo: string;
    slug: string;
  } | null;
}

interface TodayAnalysisProps {
  analyses: Analysis[];
}

export default function TodayAnalysis({ analyses }: TodayAnalysisProps) {
  if (analyses.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {analyses.map((analysis) => (
        <Link
          key={analysis.id}
          href={`/analysis/${analysis.slug}`}
          className="block bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-600 transition-all border border-gray-700"
        >
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {analysis.sport?.icon && (
                  <span className="text-sm">{analysis.sport.icon}</span>
                )}
                <span className="text-xs text-gray-400">
                  {analysis.sport?.nameKo || '스포츠'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {analysis.leagueRef?.nameKo || '리그'}
              </span>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-100 mb-2 line-clamp-2">
              {analysis.title}
            </h3>
            
            {analysis.metaDescription && (
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {analysis.metaDescription}
              </p>
            )}

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-gray-500">
                  by {analysis.author.username}
                </span>
                {analysis.author.analystProfile?.averageAccuracy != null && (
                  <span className="text-green-400">
                    정확도 {analysis.author.analystProfile.averageAccuracy.toFixed(0)}%
                  </span>
                )}
              </div>
              <span className="text-gray-500">
                조회 {analysis.views.toLocaleString()}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}