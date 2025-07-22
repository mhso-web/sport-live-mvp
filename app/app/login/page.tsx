import { Suspense } from 'react'
import LoginForm from '@/components/auth/LoginForm'

function LoginFormWrapper() {
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="text-gold-500">로딩중...</div>
    </div>}>
      <LoginFormWrapper />
    </Suspense>
  )
}