'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SportAnalysis } from '@/types/analysis.types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AnalysisListProps {
  initialAnalyses?: SportAnalysis[];
  showAuthor?: boolean;
  authorId?: number;
}

const SPORT_LABELS: Record<string, string> = {
  soccer: '⚽ 축구',
  baseball: '⚾ 야구',
  basketball: '🏀 농구',
  esports: '🎮 e스포츠',
  volleyball: '🏐 배구',
  tennis: '🎾 테니스',
  golf: '⛳ 골프',
};

export default function AnalysisList({ initialAnalyses = [], showAuthor = true, authorId }: AnalysisListProps) {
  const [analyses, setAnalyses] = useState<SportAnalysis[]>(initialAnalyses);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'likes'>('date');
  const [sportFilter, setSportFilter] = useState<string>('');
  const [leagueFilter, setLeagueFilter] = useState<string>('');

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sortBy,
        ...(sportFilter && { sportType: sportFilter }),
        ...(leagueFilter && { league: leagueFilter }),
        ...(authorId && { authorId: authorId.toString() }),
      });

      const response = await fetch(`/api/analysis?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnalyses(data.data.analyses);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialAnalyses.length) {
      fetchAnalyses();
    }
  }, [page, sortBy, sportFilter, leagueFilter]);


  const getPredictionResultColor = (result?: string) => {
    switch (result) {
      case 'correct':
        return 'text-green-400';
      case 'incorrect':
        return 'text-red-400';
      case 'partial':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPredictionResultLabel = (result?: string) => {
    switch (result) {
      case 'correct':
        return '✅ 적중';
      case 'incorrect':
        return '❌ 실패';
      case 'partial':
        return '⚠️ 부분적중';
      default:
        return '⏳ 대기중';
    }
  };

  return (
    <div className="space-y-6">
      {/* 필터 및 정렬 */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">종목</label>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100"
            >
              <option value="">전체</option>
              {Object.entries(SPORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">정렬</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-100"
            >
              <option value="date">최신순</option>
              <option value="views">조회순</option>
              <option value="likes">인기순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 분석 목록 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">분석이 없습니다</h3>
          <p className="text-gray-400">아직 작성된 분석이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Link
              key={analysis.id}
              href={`/analysis/${analysis.slug}`}
              className="block bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors border border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{SPORT_LABELS[analysis.sportType]}</span>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                      {analysis.league}
                    </span>
                    {analysis.competition && (
                      <span className="px-2 py-1 bg-blue-900 rounded text-xs text-blue-300">
                        {analysis.competition}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-100 mb-2">
                    {analysis.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      🏟️ {analysis.homeTeam} vs {analysis.awayTeam}
                    </span>
                    <span>
                      📅 {format(new Date(analysis.matchDate), 'MM월 dd일 (E) HH:mm', { locale: ko })}
                    </span>
                  </div>
                </div>
              </div>

              {/* 예측 요약 */}
              <p className="text-gray-300 mb-4 line-clamp-2">
                {analysis.predictionSummary}
              </p>

              {/* 예측 결과 (경기 종료 후) */}
              {analysis.predictionResult && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-700 ${getPredictionResultColor(analysis.predictionResult)}`}>
                  {getPredictionResultLabel(analysis.predictionResult)}
                </div>
              )}

              {/* 통계 */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {showAuthor && analysis.author && (
                    <span className="flex items-center gap-1">
                      <img
                        src={analysis.author.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${analysis.author.displayName}`}
                        alt={analysis.author.displayName}
                        className="w-5 h-5 rounded-full"
                      />
                      {analysis.author.displayName}
                      {analysis.author.isVerified && ' ✓'}
                    </span>
                  )}
                  <span>👁 {analysis.views.toLocaleString()}</span>
                  <span>❤️ {analysis.likes}</span>
                  <span>💬 {analysis.commentsCount}</span>
                </div>
                
                <time className="text-sm text-gray-500">
                  {format(new Date(analysis.createdAt), 'yyyy.MM.dd')}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-100 rounded-lg transition-colors"
          >
            이전
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-100 rounded-lg transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}