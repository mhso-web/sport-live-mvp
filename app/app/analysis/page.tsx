import Navigation from '@/components/layout/Navigation'

export default function AnalysisPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-3xl font-bold text-gray-100 mb-4">AI 분석</h1>
            <p className="text-gray-400">AI 기반 경기 분석 서비스가 곧 제공될 예정입니다.</p>
          </div>
        </div>
      </main>
    </>
  )
}