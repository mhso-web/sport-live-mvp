import Navigation from '@/components/layout/Navigation'

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
              Sports Live
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              실시간 스포츠 중계 및 AI 분석 플랫폼
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">⚽</div>
                <h3 className="text-lg font-medium text-gray-900">실시간 경기</h3>
                <p className="mt-2 text-sm text-gray-500">
                  다양한 스포츠 경기를 실시간으로 확인하세요
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-gray-900">AI 분석</h3>
                <p className="mt-2 text-sm text-gray-500">
                  인공지능이 제공하는 심층 경기 분석
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900">실시간 채팅</h3>
                <p className="mt-2 text-sm text-gray-500">
                  다른 팬들과 함께 경기를 즐기세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}