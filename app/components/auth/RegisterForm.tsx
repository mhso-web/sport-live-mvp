'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.errors) {
          // Zod validation errors
          const fieldErrors: FormErrors = {}
          data.error.errors.forEach((err: any) => {
            const field = err.path[0]
            fieldErrors[field as keyof FormErrors] = err.message
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: data.error?.message || '회원가입에 실패했습니다' })
        }
        return
      }

      // Registration successful - auto login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      })

      if (loginResponse.ok) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setErrors({ general: '서버 오류가 발생했습니다' })
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
            <span className="text-gray-100 ml-2">회원가입</span>
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-medium text-gold-500 hover:text-gold-400 transition-colors duration-200">
              로그인하기
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
                사용자명 <span className="text-red-400">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-dark-700 border border-dark-600 placeholder-gray-500 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all duration-200 sm:text-sm"
                placeholder="영문, 숫자, 언더스코어만 사용"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                이메일 <span className="text-gray-500">(선택사항)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-dark-700 border border-dark-600 placeholder-gray-500 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all duration-200 sm:text-sm"
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
              <p className="mt-1 text-xs text-gray-600">
                비밀번호 찾기 등에 사용됩니다
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                비밀번호 <span className="text-red-400">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-dark-700 border border-dark-600 placeholder-gray-500 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all duration-200 sm:text-sm"
                placeholder="8자 이상, 대소문자 및 숫자 포함"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                비밀번호 확인 <span className="text-red-400">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-dark-700 border border-dark-600 placeholder-gray-500 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all duration-200 sm:text-sm"
                placeholder="비밀번호를 다시 입력해주세요"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-dark-900 bg-gradient-gold hover:shadow-lg hover:shadow-gold-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 focus:ring-offset-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? '처리중...' : '회원가입'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}