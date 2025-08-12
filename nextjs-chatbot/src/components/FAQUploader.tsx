'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

export default function FAQUploader() {
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [faqData, setFaqData] = useState<any>(null)

  const fetchFAQData = async () => {
    try {
      const response = await axios.get('/api/faq-data')
      setFaqData(response.data)
    } catch (err) {
      console.error('Failed to fetch FAQ data:', err)
    }
  }

  useEffect(() => {
    fetchFAQData()
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess(false)

    // For now, just read the file locally
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        setFaqData({ data, count: Object.values(data).flat().length })
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch (err) {
        setError('파일 파싱 중 오류가 발생했습니다.')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsText(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">FAQ 데이터 관리</h2>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {isDragActive ? (
          <p className="mt-2">파일을 여기에 놓으세요...</p>
        ) : (
          <>
            <p className="mt-2">JSON 파일을 드래그하거나 클릭하여 업로드하세요</p>
            <p className="text-sm text-gray-600">(슈퍼멤버스 FAQ JSON 형식만 지원)</p>
          </>
        )}
      </div>

      {uploading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          FAQ 데이터가 성공적으로 업로드되었습니다.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {faqData && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">현재 FAQ 데이터</h3>
          <div className="space-y-2">
            {Object.entries(faqData.data || {}).map(([category, items]: any) => (
              <div key={category} className="flex justify-between">
                <span>{category}</span>
                <span className="text-blue-600 font-medium">{items.length}개 질문</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            전체 FAQ 수: {faqData.count}개
          </p>
        </div>
      )}
    </div>
  )
}