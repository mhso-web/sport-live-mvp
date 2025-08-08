import { Suspense } from 'react';
import { HomeService } from '@/lib/services/homeService';
import TodayMatches from '@/components/home/TodayMatches';
import TodayAnalysis from '@/components/home/TodayAnalysis';
import RecentPosts from '@/components/home/RecentPosts';
import Notices from '@/components/home/Notices';
import PartnerBanners from '@/components/home/PartnerBanners';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const revalidate = 60; // ISR: 60초마다 재검증

export default async function Home() {
  const data = await HomeService.getAllHomeData();

  return (
    <main className="min-h-screen bg-gray-900">
      {/* 모바일: 배너를 최상단에 표시 */}
      <div className="block lg:hidden">
        <Suspense fallback={<LoadingSpinner />}>
          <PartnerBanners partners={data.partners} position="mobile" />
        </Suspense>
      </div>

      {/* 데스크톱: 3단 레이아웃 */}
      <div className="max-w-[1920px] mx-auto">
        <div className="lg:grid lg:grid-cols-[280px_1fr_280px] lg:gap-6 px-4 lg:px-6">
          {/* 왼쪽 배너 (데스크톱) */}
          <aside className="hidden lg:block sticky top-20 h-fit">
            <Suspense fallback={<LoadingSpinner />}>
              <PartnerBanners partners={data.partners} position="left" />
            </Suspense>
          </aside>

          {/* 메인 콘텐츠 */}
          <div className="py-6 lg:py-8">
            {/* 헤더 섹션 */}
            <div className="text-center mb-8 lg:mb-12">
              <h1 className="text-3xl lg:text-5xl font-bold mb-3">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Sports Live
                </span>
              </h1>
              <p className="text-gray-400 text-sm lg:text-base">
                실시간 스포츠 중계 및 AI 경기 분석 플랫폼
              </p>
            </div>

            {/* 공지사항 */}
            <section className="mb-8">
              <Suspense fallback={<LoadingSpinner />}>
                <Notices notices={data.notices} />
              </Suspense>
            </section>

            {/* 오늘의 경기 일정 */}
            <section className="mb-10">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                <span className="text-2xl">📅</span>
                오늘의 경기 일정
              </h2>
              <Suspense fallback={<LoadingSpinner />}>
                <TodayMatches matches={data.todayMatches} />
              </Suspense>
            </section>

            {/* 오늘의 경기 분석 */}
            {data.todayAnalysis.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  오늘의 경기 분석
                </h2>
                <Suspense fallback={<LoadingSpinner />}>
                  <TodayAnalysis analyses={data.todayAnalysis} />
                </Suspense>
              </section>
            )}

            {/* 게시판별 최근 글 */}
            <section>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                커뮤니티 최신글
              </h2>
              <Suspense fallback={<LoadingSpinner />}>
                <RecentPosts categories={data.recentPosts} />
              </Suspense>
            </section>
          </div>

          {/* 오른쪽 배너 (데스크톱) */}
          <aside className="hidden lg:block sticky top-20 h-fit">
            <Suspense fallback={<LoadingSpinner />}>
              <PartnerBanners partners={data.partners} position="right" />
            </Suspense>
          </aside>
        </div>
      </div>
    </main>
  );
}