'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  username: string
  password: string
}

interface FormErrors {
  username?: string
  password?: string
  general?: string
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/'
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      // NextAuth signIn 사용
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false
      })

      console.log('Login result:', result) // 디버깅용

      if (result?.error) {
        console.error('Login error:', result.error)
        setErrors({ general: '아이디 또는 비밀번호가 올바르지 않습니다' })
      } else if (result?.ok) {
        // 로그인 성공
        window.location.href = from // router.push 대신 전체 페이지 리로드
      }
    } catch (error) {
      console.error('Login exception:', error)
      setErrors({ general: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            <span className="text-gradient-gold">Sports Live</span>
            <span className="text-gray-100 ml-2">로그인</span>
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            아직 계정이 없으신가요?{' '}
            <Link href="/register" className="font-medium text-gold-500 hover:text-gold-400 transition-colors duration-200">
              회원가입하기
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="rounded-md bg-red-900/20 border border-red-800/50 p-4">
              <p className="text-sm text-red-400">{errors.general}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                사용자명
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-dark-700 border border-dark-600 placeholder-gray-500 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all duration-200 sm:text-sm"
                placeholder="사용자명을 입력하세요"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-dark-700 border border-dark-600 placeholder-gray-500 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all duration-200 sm:text-sm"
                placeholder="비밀번호를 입력하세요"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-gold-500 bg-dark-700 border-dark-600 focus:ring-gold-500/50 focus:ring-2 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                로그인 상태 유지
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-gold-500 hover:text-gold-400 transition-colors duration-200">
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-dark-900 bg-gradient-gold hover:shadow-lg hover:shadow-gold-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 focus:ring-offset-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}