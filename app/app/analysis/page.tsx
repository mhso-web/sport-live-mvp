import { Metadata } from 'next';
import Link from 'next/link';
import AnalysisList from '@/components/analysis/AnalysisList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';

export const metadata: Metadata = {
  title: '경기 분석 | Sports Live',
  description: '전문 분석가들의 스포츠 경기 분석과 예측을 확인하세요. 축구, 야구, 농구 등 다양한 종목의 상세한 분석과 베팅 예측을 제공합니다.',
  keywords: ['스포츠 분석', '경기 예측', '베팅 분석', 'KBO 분석', 'K리그 분석', 'NBA 분석', 'MLB 분석'],
  openGraph: {
    title: '경기 분석 | Sports Live',
    description: '전문 분석가들의 스포츠 경기 분석과 예측',
    type: 'website',
  },
};

async function getTopAnalysts() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/analysis/top-analysts?limit=5`, {
      cache: 'no-store',
    });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching top analysts:', error);
    return [];
  }
}

async function getInitialAnalyses() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/analysis?pageSize=10`, {
      cache: 'no-store',
    });
    const data = await response.json();
    return data.success ? data.data.analyses : [];
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }
}

export default async function AnalysisPage() {
  const session = await getServerSession(authOptions);
  const isAnalyst = session?.user?.role === 'ANALYST' || session?.user?.role === 'ADMIN';
  
  const [topAnalysts, initialAnalyses] = await Promise.all([
    getTopAnalysts(),
    getInitialAnalyses(),
  ]);

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">경기 분석</h1>
              <p className="text-gray-400">전문 분석가들의 스포츠 경기 분석과 예측</p>
            </div>
            
            {isAnalyst && (
              <Link
                href="/analysis/create"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                분석 작성
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            <AnalysisList initialAnalyses={initialAnalyses} />
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* TOP 분석가 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <span className="text-yellow-400">🏆</span>
                TOP 분석가
              </h3>
              
              {topAnalysts.length > 0 ? (
                <div className="space-y-3">
                  {topAnalysts.map((analyst: any, index: number) => (
                    <div key={analyst.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-300">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium text-gray-100 truncate">
                            {analyst.displayName}
                          </p>
                          {analyst.isVerified && (
                            <span className="text-blue-400 text-xs">✓</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          정확도 {analyst.averageAccuracy?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {analyst.totalPredictions}개 예측
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">아직 랭킹 데이터가 없습니다.</p>
              )}
            </div>

            {/* 안내 사항 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">📌 안내 사항</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>모든 분석은 개인 의견이며, 투자 권유가 아닙니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>베팅은 본인 책임 하에 진행하시기 바랍니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>분석가 인증은 관리자 승인 후 가능합니다.</span>
                </li>
              </ul>
            </div>

            {/* 통계 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">📊 오늘의 통계</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">총 분석</span>
                  <span className="text-sm font-medium text-gray-100">128개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">오늘 작성</span>
                  <span className="text-sm font-medium text-gray-100">12개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">평균 정확도</span>
                  <span className="text-sm font-medium text-green-400">68.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}