'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CreateAnalysisDto } from '@/types/analysis.types';
import { Match } from '@/types/match.types';
import MatchSelectorModal from '@/components/analysis/MatchSelectorModal';

const SPORT_TYPES = [
  { value: 'soccer', label: '⚽ 축구' },
  { value: 'baseball', label: '⚾ 야구' },
  { value: 'basketball', label: '🏀 농구' },
  { value: 'esports', label: '🎮 e스포츠' },
  { value: 'volleyball', label: '🏐 배구' },
  { value: 'tennis', label: '🎾 테니스' },
  { value: 'golf', label: '⛳ 골프' },
];

const BET_TYPES = [
  { value: 'match_result', label: '승무패' },
  { value: 'handicap', label: '핸디캡' },
  { value: 'over_under', label: '오버/언더' },
  { value: 'both_score', label: '양팀득점' },
  { value: 'correct_score', label: '정확한 스코어' },
  { value: 'first_goal', label: '첫 득점' },
  { value: 'half_time', label: '전반전 결과' },
  { value: 'special', label: '특별 베팅' },
];

export default function CreateAnalysisPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const [formData, setFormData] = useState({
    matchDate: '',
    sportType: 'soccer',
    league: '',
    competition: '',
    homeTeam: '',
    awayTeam: '',
    venue: '',
    title: '',
    metaDescription: '',
    metaKeywords: '',
    homeFormation: '',
    awayFormation: '',
    homeAnalysis: '',
    awayAnalysis: '',
    tacticalAnalysis: '',
    predictionSummary: '',
    predictions: [{
      betType: 'match_result' as const,
      prediction: '',
      odds: 0,
      stake: 0,
      reasoning: '',
    }],
  });

  // Map sport types from match.types to form values
  const mapSportType = (sportType: string): string => {
    const mapping: Record<string, string> = {
      'football': 'soccer',
      'baseball': 'baseball',
      'basketball': 'basketball',
      'esports': 'esports',
      'volleyball': 'volleyball',
    };
    return mapping[sportType] || 'soccer';
  };

  // Handle match selection from modal
  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    setFormData({
      ...formData,
      matchDate: new Date(match.scheduledTime).toISOString().slice(0, 16),
      sportType: mapSportType(match.sportType),
      league: match.competition || '',
      competition: match.round || '',
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      venue: match.venue || '',
      // Auto-generate title if empty
      title: formData.title || `${match.competition} ${match.homeTeam.name} vs ${match.awayTeam.name} 경기 분석`,
    });
    setIsModalOpen(false);
  };

  // Clear match selection and reset fields
  const handleClearSelection = () => {
    setSelectedMatch(null);
    setFormData({
      ...formData,
      matchDate: '',
      sportType: 'soccer',
      league: '',
      competition: '',
      homeTeam: '',
      awayTeam: '',
      venue: '',
    });
  };


  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-400 mb-6">분석을 작성하려면 로그인해주세요.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const keywords = formData.metaKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      // Remove venue field as it's not in the DTO
      const { venue, ...formDataWithoutVenue } = formData;
      
      const data: CreateAnalysisDto = {
        ...formDataWithoutVenue,
        metaKeywords: keywords,
        confidenceLevel: 3, // Default confidence level (1-5 scale)
      };

      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Use the SEO URL if available, otherwise fall back to the old slug format
        const redirectUrl = result.data.redirectUrl || `/analysis/${result.data.slug}`;
        router.push(redirectUrl);
      } else {
        setError(result.error?.message || '분석 작성에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addPrediction = () => {
    setFormData({
      ...formData,
      predictions: [
        ...formData.predictions,
        {
          betType: 'match_result' as const,
          prediction: '',
          odds: 0,
          stake: 0,
          reasoning: '',
        },
      ],
    });
  };

  const removePrediction = (index: number) => {
    setFormData({
      ...formData,
      predictions: formData.predictions.filter((_, i) => i !== index),
    });
  };

  const updatePrediction = (index: number, field: string, value: any) => {
    const newPredictions = [...formData.predictions];
    newPredictions[index] = {
      ...newPredictions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      predictions: newPredictions,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">경기 분석 작성</h1>
          <p className="mt-2 text-gray-400">전문적인 경기 분석과 예측을 작성해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Match Selector */}
          <div>
            <div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  경기 선택
                  {selectedMatch && (
                    <span className="ml-2 text-sm bg-green-700 px-2 py-1 rounded">
                      {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                    </span>
                  )}
                </button>
                {selectedMatch && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-gray-400 hover:text-gray-200 text-sm"
                  >
                    선택 취소
                  </button>
                )}
              </div>
            </div>

          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 기본 정보 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">기본 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  경기 일시 *
                  {selectedMatch && (
                    <span className="ml-2 text-xs bg-green-600 px-2 py-0.5 rounded">자동 입력됨</span>
                  )}
                </label>
                <input
                  type="datetime-local"
                  value={formData.matchDate}
                  onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                  readOnly={!!selectedMatch}
                  className={`w-full px-3 py-2 ${
                    selectedMatch 
                      ? 'bg-gray-800 border-green-600' 
                      : 'bg-gray-700 border-gray-600'
                  } border rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  종목 *
                  {selectedMatch && (
                    <span className="ml-2 text-xs bg-green-600 px-2 py-0.5 rounded">자동 입력됨</span>
                  )}
                </label>
                <select
                  value={formData.sportType}
                  onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                  disabled={!!selectedMatch}
                  className={`w-full px-3 py-2 ${
                    selectedMatch 
                      ? 'bg-gray-800 border-green-600' 
                      : 'bg-gray-700 border-gray-600'
                  } border rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                >
                  {SPORT_TYPES.map((sport) => (
                    <option key={sport.value} value={sport.value}>
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  리그 *
                  {selectedMatch && (
                    <span className="ml-2 text-xs bg-green-600 px-2 py-0.5 rounded">자동 입력됨</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.league}
                  onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                  readOnly={!!selectedMatch}
                  placeholder="예: K리그1, 프리미어리그"
                  className={`w-full px-3 py-2 ${
                    selectedMatch 
                      ? 'bg-gray-800 border-green-600' 
                      : 'bg-gray-700 border-gray-600'
                  } border rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  대회
                  {selectedMatch && formData.competition && (
                    <span className="ml-2 text-xs bg-green-600 px-2 py-0.5 rounded">자동 입력됨</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.competition}
                  onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                  readOnly={!!selectedMatch && !!formData.competition}
                  placeholder="예: 정규시즌, 플레이오프"
                  className={`w-full px-3 py-2 ${
                    selectedMatch && formData.competition
                      ? 'bg-gray-800 border-green-600' 
                      : 'bg-gray-700 border-gray-600'
                  } border rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  홈팀 *
                  {selectedMatch && (
                    <span className="ml-2 text-xs bg-green-600 px-2 py-0.5 rounded">자동 입력됨</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.homeTeam}
                  onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                  readOnly={!!selectedMatch}
                  className={`w-full px-3 py-2 ${
                    selectedMatch 
                      ? 'bg-gray-800 border-green-600' 
                      : 'bg-gray-700 border-gray-600'
                  } border rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  원정팀 *
                  {selectedMatch && (
                    <span className="ml-2 text-xs bg-green-600 px-2 py-0.5 rounded">자동 입력됨</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.awayTeam}
                  onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                  readOnly={!!selectedMatch}
                  className={`w-full px-3 py-2 ${
                    selectedMatch 
                      ? 'bg-gray-800 border-green-600' 
                      : 'bg-gray-700 border-gray-600'
                  } border rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  경기장
                  {selectedMatch && formData.venue && (
                    <span className="ml-2 text-xs bg-green-600 px-2 py-0.5 rounded">자동 입력됨</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  readOnly={!!selectedMatch && !!formData.venue}
                  placeholder="예: 서울월드컵경기장"
                  className={`w-full px-3 py-2 ${
                    selectedMatch && formData.venue
                      ? 'bg-gray-800 border-green-600' 
                      : 'bg-gray-700 border-gray-600'
                  } border rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="예: 2024 K리그1 서울 vs 전북 빅매치 완벽 분석"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SEO 설명
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="검색 결과에 표시될 설명 (160자 이내)"
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                키워드 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                placeholder="예: K리그, 서울FC, 전북현대, 축구분석"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 팀 분석 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">팀 분석</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    홈팀 포메이션
                  </label>
                  <input
                    type="text"
                    value={formData.homeFormation}
                    onChange={(e) => setFormData({ ...formData, homeFormation: e.target.value })}
                    placeholder="예: 4-4-2"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    원정팀 포메이션
                  </label>
                  <input
                    type="text"
                    value={formData.awayFormation}
                    onChange={(e) => setFormData({ ...formData, awayFormation: e.target.value })}
                    placeholder="예: 4-3-3"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  홈팀 분석 *
                </label>
                <textarea
                  value={formData.homeAnalysis}
                  onChange={(e) => setFormData({ ...formData, homeAnalysis: e.target.value })}
                  placeholder="홈팀의 최근 폼, 전력, 강점 등을 분석해주세요."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  원정팀 분석 *
                </label>
                <textarea
                  value={formData.awayAnalysis}
                  onChange={(e) => setFormData({ ...formData, awayAnalysis: e.target.value })}
                  placeholder="원정팀의 최근 폼, 전력, 강점 등을 분석해주세요."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  전술 분석
                </label>
                <textarea
                  value={formData.tacticalAnalysis}
                  onChange={(e) => setFormData({ ...formData, tacticalAnalysis: e.target.value })}
                  placeholder="양 팀의 전술적 특징과 상성을 분석해주세요."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 예측 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">예측</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                예측 요약 *
              </label>
              <textarea
                value={formData.predictionSummary}
                onChange={(e) => setFormData({ ...formData, predictionSummary: e.target.value })}
                placeholder="경기 결과에 대한 전체적인 예측을 요약해주세요."
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-200">베팅 예측</h3>
                <button
                  type="button"
                  onClick={addPrediction}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  예측 추가
                </button>
              </div>

              {formData.predictions.map((prediction, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-gray-200 font-medium">예측 #{index + 1}</h4>
                    {formData.predictions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrediction(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        베팅 타입
                      </label>
                      <select
                        value={prediction.betType}
                        onChange={(e) => updatePrediction(index, 'betType', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-gray-100 text-sm"
                      >
                        {BET_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        예측 내용
                      </label>
                      <input
                        type="text"
                        value={prediction.prediction}
                        onChange={(e) => updatePrediction(index, 'prediction', e.target.value)}
                        placeholder="예: 홈 승"
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        배당률
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={prediction.odds}
                        onChange={(e) => updatePrediction(index, 'odds', parseFloat(e.target.value))}
                        placeholder="2.5"
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        추천 유닛
                      </label>
                      <input
                        type="number"
                        value={prediction.stake}
                        onChange={(e) => updatePrediction(index, 'stake', parseInt(e.target.value))}
                        placeholder="3"
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      근거
                    </label>
                    <textarea
                      value={prediction.reasoning}
                      onChange={(e) => updatePrediction(index, 'reasoning', e.target.value)}
                      placeholder="이 예측의 근거를 설명해주세요."
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-500 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  작성 중...
                </>
              ) : (
                '분석 작성'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Match Selector Modal */}
      <MatchSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectMatch={handleMatchSelect}
      />
    </div>
  );
}