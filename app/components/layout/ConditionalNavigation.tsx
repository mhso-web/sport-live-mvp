'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

export default function ConditionalNavigation() {
  const pathname = usePathname()
  
  // 관리자 페이지에서는 네비게이션을 숨김
  const isAdminPage = pathname.startsWith('/admin')
  
  if (isAdminPage) {
    return null
  }
  
  return <Navigation />
}