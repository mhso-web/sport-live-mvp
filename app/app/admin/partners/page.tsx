import { Suspense } from 'react'
import PartnerManagementContent from '@/components/admin/partners/PartnerManagementContent'

export const dynamic = 'force-dynamic'

export default function AdminPartnersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">보증업체 관리</h1>
        <p className="text-gray-400">보증업체를 등록하고 관리할 수 있습니다.</p>
      </div>

      <Suspense fallback={<AdminPartnersLoading />}>
        <PartnerManagementContent />
      </Suspense>
    </div>
  )
}

function AdminPartnersLoading() {
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-10 bg-gray-800 rounded w-64"></div>
          <div className="h-10 bg-gray-800 rounded w-32"></div>
        </div>
        
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}