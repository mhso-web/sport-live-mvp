'use client'

import { useState, useEffect, useRef } from 'react'
import { FaTimes, FaUpload, FaImage } from 'react-icons/fa'

interface Partner {
  id: number
  name: string
  description: string
  detailContent?: string
  websiteUrl?: string
  bannerImage?: string
  isActive: boolean
}

interface PartnerFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  partner?: Partner | null
}

export default function PartnerFormModal({
  isOpen,
  onClose,
  onSubmit,
  partner
}: PartnerFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    detailContent: '',
    websiteUrl: '',
    bannerImage: '',
    isActive: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingContent, setUploadingContent] = useState(false)
  const detailContentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        description: partner.description,
        detailContent: partner.detailContent || '',
        websiteUrl: partner.websiteUrl || '',
        bannerImage: partner.bannerImage || '',
        isActive: partner.isActive
      })
    } else {
      setFormData({
        name: '',
        description: '',
        detailContent: '',
        websiteUrl: '',
        bannerImage: '',
        isActive: true
      })
    }
    setErrors({})
  }, [partner])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '업체명은 필수입니다'
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명은 필수입니다'
    } else if (formData.description.length < 10) {
      newErrors.description = '설명은 최소 10자 이상이어야 합니다'
    }

    if (!formData.detailContent.trim()) {
      newErrors.detailContent = '상세 내용은 필수입니다'
    }

    if (formData.websiteUrl && !/^https?:\/\/.+/.test(formData.websiteUrl)) {
      newErrors.websiteUrl = '올바른 URL 형식이 아닙니다'
    }

    // 배너 이미지는 파일 업로드로 처리하므로 URL 검증 제거

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBanner(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        setFormData(prev => ({ ...prev, bannerImage: data.data.url }))
      } else {
        alert(data.error || '파일 업로드에 실패했습니다')
      }
    } catch (error) {
      console.error('배너 업로드 오류:', error)
      alert('파일 업로드 중 오류가 발생했습니다')
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingContent(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        // 상세 내용에 이미지 태그 삽입
        if (detailContentRef.current) {
          const textarea = detailContentRef.current
          const cursorPos = textarea.selectionStart
          const textBefore = textarea.value.substring(0, cursorPos)
          const textAfter = textarea.value.substring(cursorPos)
          
          const imageTag = `\n![${data.data.originalName}](${data.data.url})\n`
          
          setFormData(prev => ({
            ...prev,
            detailContent: textBefore + imageTag + textAfter
          }))
          
          // 커서 위치 조정
          setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(
              cursorPos + imageTag.length,
              cursorPos + imageTag.length
            )
          }, 0)
        }
      } else {
        alert(data.error || '파일 업로드에 실패했습니다')
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      alert('파일 업로드 중 오류가 발생했습니다')
    } finally {
      setUploadingContent(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const url = partner 
        ? `/api/admin/partners/${partner.id}`
        : '/api/admin/partners'
      
      const method = partner ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        onSubmit()
      } else {
        if (data.details) {
          const newErrors: Record<string, string> = {}
          data.details.forEach((error: any) => {
            newErrors[error.path[0]] = error.message
          })
          setErrors(newErrors)
        }
      }
    } catch (error) {
      console.error('보증업체 저장 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            {partner ? '보증업체 수정' : '새 보증업체 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 업체명 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              업체명 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none ${
                errors.name ? 'border-red-500' : 'border-gray-700 focus:border-yellow-500'
              }`}
              placeholder="업체명을 입력하세요"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              설명 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none ${
                errors.description ? 'border-red-500' : 'border-gray-700 focus:border-yellow-500'
              }`}
              rows={4}
              placeholder="업체 설명을 입력하세요 (최소 10자)"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* 상세 내용 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">
                상세 내용 <span className="text-red-400">*</span>
              </label>
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleContentImageUpload}
                  disabled={uploadingContent}
                />
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                  {uploadingContent ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                      <span className="text-gray-300">업로드 중...</span>
                    </>
                  ) : (
                    <>
                      <FaImage className="text-gray-300" />
                      <span className="text-gray-300">이미지 삽입</span>
                    </>
                  )}
                </div>
              </label>
            </div>
            <textarea
              ref={detailContentRef}
              value={formData.detailContent}
              onChange={(e) => setFormData({ ...formData, detailContent: e.target.value })}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none ${
                errors.detailContent ? 'border-red-500' : 'border-gray-700 focus:border-yellow-500'
              }`}
              rows={8}
              placeholder="업체의 상세 정보를 입력하세요 (서비스 특징, 보너스 정보 등)\n\n이미지는 '이미지 삽입' 버튼을 클릭하여 추가할 수 있습니다."
            />
            {errors.detailContent && (
              <p className="mt-1 text-sm text-red-400">{errors.detailContent}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              이미지는 Markdown 형식으로 삽입됩니다. 예: ![alt text](image-url)
            </p>
          </div>

          {/* 웹사이트 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              웹사이트 URL
            </label>
            <input
              type="text"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none ${
                errors.websiteUrl ? 'border-red-500' : 'border-gray-700 focus:border-yellow-500'
              }`}
              placeholder="https://example.com"
            />
            {errors.websiteUrl && (
              <p className="mt-1 text-sm text-red-400">{errors.websiteUrl}</p>
            )}
          </div>

          {/* 배너 이미지 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              배너 이미지
            </label>
            <div className="space-y-2">
              {/* 이미지 미리보기 */}
              {formData.bannerImage && (
                <div className="relative rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={formData.bannerImage}
                    alt="배너 미리보기"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bannerImage: '' })}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* 파일 업로드 버튼 */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                />
                <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-dashed border-gray-600 rounded-lg transition-colors">
                  {uploadingBanner ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
                      <span className="text-gray-300">업로드 중...</span>
                    </>
                  ) : (
                    <>
                      <FaUpload className="text-gray-400" />
                      <span className="text-gray-300">
                        {formData.bannerImage ? '다른 이미지로 변경' : '배너 이미지 업로드'}
                      </span>
                    </>
                  )}
                </div>
              </label>
              <p className="text-xs text-gray-500">
                권장 크기: 800x200px, 최대 5MB (JPG, PNG, GIF, WebP)
              </p>
            </div>
          </div>

          {/* 활성 상태 */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-yellow-500 bg-gray-800 border-gray-700 rounded focus:ring-yellow-500"
              />
              <span className="text-gray-300">활성 상태로 등록</span>
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '저장 중...' : (partner ? '수정' : '추가')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}