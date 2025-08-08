'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateAnalysisDto, BetType } from '@/types/analysis.types';
import { format } from 'date-fns';

interface AnalysisFormProps {
  onSubmit: (data: CreateAnalysisDto) => Promise<void>;
  initialData?: Partial<CreateAnalysisDto>;
  isEditing?: boolean;
}

const SPORT_TYPES = [
  { value: 'soccer', label: '축구' },
  { value: 'baseball', label: '야구' },
  { value: 'basketball', label: '농구' },
  { value: 'esports', label: 'e스포츠' },
  { value: 'volleyball', label: '배구' },
  { value: 'tennis', label: '테니스' },
  { value: 'golf', label: '골프' },
];

const LEAGUES = {
  soccer: ['K리그1', 'K리그2', '프리미어리그', '라리가', '분데스리가', '세리에A', '리그1', '챔피언스리그'],
  baseball: ['KBO', 'MLB', 'NPB'],
  basketball: ['KBL', 'NBA', 'WKBL', 'WNBA'],
  esports: ['LCK', 'LPL', 'LEC', 'LCS'],
  volleyball: ['V리그', 'V리그 여자부'],
  tennis: ['ATP', 'WTA'],
  golf: ['PGA', 'LPGA', 'KPGA'],
};

const BET_TYPES: { value: BetType; label: string }[] = [
  { value: 'match_result', label: '승무패' },
  { value: 'handicap', label: '핸디캡' },
  { value: 'over_under', label: '오버/언더' },
  { value: 'both_score', label: '양팀득점' },
  { value: 'correct_score', label: '정확한 스코어' },
  { value: 'first_goal', label: '첫 득점' },
  { value: 'half_time', label: '전반전 결과' },
  { value: 'special', label: '특별 베팅' },
];

export default function AnalysisForm({ onSubmit, initialData, isEditing }: AnalysisFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAnalysisDto>({
    matchDate: initialData?.matchDate || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    sportType: initialData?.sportType || 'soccer',
    league: initialData?.league || '',
    competition: initialData?.competition || '',
    homeTeam: initialData?.homeTeam || '',
    awayTeam: initialData?.awayTeam || '',
    title: initialData?.title || '',
    metaDescription: initialData?.metaDescription || '',
    metaKeywords: initialData?.metaKeywords || [],
    homeFormation: initialData?.homeFormation || '',
    awayFormation: initialData?.awayFormation || '',
    homeAnalysis: initialData?.homeAnalysis || '',
    awayAnalysis: initialData?.awayAnalysis || '',
    tacticalAnalysis: initialData?.tacticalAnalysis || '',
    keyPlayers: initialData?.keyPlayers || { home: [], away: [] },
    injuryInfo: initialData?.injuryInfo || { home: [], away: [] },
    headToHead: initialData?.headToHead || null,
    recentForm: initialData?.recentForm || { home: '', away: '' },
    predictionSummary: initialData?.predictionSummary || '',
    confidenceLevel: initialData?.confidenceLevel || 3,
    predictions: initialData?.predictions || [
      {
        betType: 'match_result',
        prediction: '',
        odds: undefined,
        stake: undefined,
        reasoning: '',
      },
    ],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
    setFormData(prev => ({
      ...prev,
      metaKeywords: keywords,
    }));
  };

  const handlePredictionChange = (index: number, field: string, value: any) => {
    const newPredictions = [...formData.predictions];
    newPredictions[index] = {
      ...newPredictions[index],
      [field]: value,
    };
    setFormData(prev => ({
      ...prev,
      predictions: newPredictions,
    }));
  };

  const addPrediction = () => {
    setFormData(prev => ({
      ...prev,
      predictions: [
        ...prev.predictions,
        {
          betType: 'match_result',
          prediction: '',
          odds: undefined,
          stake: undefined,
          reasoning: '',
        },
      ],
    }));
  };

  const removePrediction = (index: number) => {
    if (formData.predictions.length > 1) {
      const newPredictions = formData.predictions.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        predictions: newPredictions,
      }));
    }
  };

  const generateTitle = () => {
    if (formData.matchDate && formData.homeTeam && formData.awayTeam && formData.league) {
      const date = format(new Date(formData.matchDate), 'MM월dd일');
      const title = `${date} ${formData.homeTeam} vs ${formData.awayTeam} ${formData.league} 분석 및 예측`;
      setFormData(prev => ({
        ...prev,
        title,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 경기 정보 섹션 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">경기 정보</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              경기 날짜 및 시간
            </label>
            <input
              type="datetime-local"
              name="matchDate"
              value={formData.matchDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              종목
            </label>
            <select
              name="sportType"
              value={formData.sportType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {SPORT_TYPES.map(sport => (
                <option key={sport.value} value={sport.value}>
                  {sport.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              리그
            </label>
            <select
              name="league"
              value={formData.league}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">선택하세요</option>
              {LEAGUES[formData.sportType as keyof typeof LEAGUES]?.map(league => (
                <option key={league} value={league}>
                  {league}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              대회명 (선택)
            </label>
            <input
              type="text"
              name="competition"
              value={formData.competition}
              onChange={handleInputChange}
              placeholder="예: 플레이오프, 결승전"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              홈팀
            </label>
            <input
              type="text"
              name="homeTeam"
              value={formData.homeTeam}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              원정팀
            </label>
            <input
              type="text"
              name="awayTeam"
              value={formData.awayTeam}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* SEO 정보 섹션 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">SEO 최적화</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              제목
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={generateTitle}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                자동 생성
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              메타 설명 (선택)
            </label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              rows={2}
              placeholder="검색 결과에 표시될 설명 (160자 이내)"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              키워드 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={formData.metaKeywords?.join(', ')}
              onChange={handleKeywordsChange}
              placeholder="예: KBO, 한화, KT, 야구 분석, 스포츠 베팅"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 팀 분석 섹션 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">팀 분석</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              홈팀 포메이션
            </label>
            <input
              type="text"
              name="homeFormation"
              value={formData.homeFormation}
              onChange={handleInputChange}
              placeholder="예: 4-2-3-1"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              원정팀 포메이션
            </label>
            <input
              type="text"
              name="awayFormation"
              value={formData.awayFormation}
              onChange={handleInputChange}
              placeholder="예: 4-4-2"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              홈팀 분석 *
            </label>
            <textarea
              name="homeAnalysis"
              value={formData.homeAnalysis}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              원정팀 분석 *
            </label>
            <textarea
              name="awayAnalysis"
              value={formData.awayAnalysis}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              전술 분석 (선택)
            </label>
            <textarea
              name="tacticalAnalysis"
              value={formData.tacticalAnalysis}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 예측 섹션 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">예측 및 베팅 추천</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              예측 요약 *
            </label>
            <textarea
              name="predictionSummary"
              value={formData.predictionSummary}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              신뢰도
            </label>
            <select
              name="confidenceLevel"
              value={formData.confidenceLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, confidenceLevel: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>⭐ 매우 낮음</option>
              <option value={2}>⭐⭐ 낮음</option>
              <option value={3}>⭐⭐⭐ 보통</option>
              <option value={4}>⭐⭐⭐⭐ 높음</option>
              <option value={5}>⭐⭐⭐⭐⭐ 매우 높음</option>
            </select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                베팅 예측
              </label>
              <button
                type="button"
                onClick={addPrediction}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                + 예측 추가
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.predictions.map((prediction, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-200">예측 #{index + 1}</h4>
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
                      <label className="block text-xs text-gray-400 mb-1">베팅 타입</label>
                      <select
                        value={prediction.betType}
                        onChange={(e) => handlePredictionChange(index, 'betType', e.target.value)}
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-gray-100"
                      >
                        {BET_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">예측</label>
                      <input
                        type="text"
                        value={prediction.prediction}
                        onChange={(e) => handlePredictionChange(index, 'prediction', e.target.value)}
                        placeholder="예: 홈팀 승"
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-gray-100"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">배당률 (선택)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={prediction.odds || ''}
                        onChange={(e) => handlePredictionChange(index, 'odds', parseFloat(e.target.value) || undefined)}
                        placeholder="예: 1.85"
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">추천 단위 (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={prediction.stake || ''}
                        onChange={(e) => handlePredictionChange(index, 'stake', parseInt(e.target.value) || undefined)}
                        placeholder="예: 3"
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-gray-100"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">예측 근거</label>
                    <textarea
                      value={prediction.reasoning}
                      onChange={(e) => handlePredictionChange(index, 'reasoning', e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-gray-100"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors"
        >
          취소
        </button>
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {loading ? '저장 중...' : isEditing ? '수정하기' : '작성하기'}
          </button>
        </div>
      </div>
    </form>
  );
}