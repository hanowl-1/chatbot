'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, RotateCcw } from 'lucide-react'

export default function PromptsPage() {
  const [systemPrompt, setSystemPrompt] = useState('')
  const [originalPrompt, setOriginalPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [lastModified, setLastModified] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    loadPrompt()
  }, [])

  const loadPrompt = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/prompts')
      if (!response.ok) throw new Error('Failed to load prompt')
      
      const data = await response.json()
      setSystemPrompt(data.systemPrompt)
      setOriginalPrompt(data.systemPrompt)
      setLastModified(data.lastModified)
      setVersion(data.version)
    } catch (error) {
      setMessage({ type: 'error', text: '프롬프트를 불러오는데 실패했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const savePrompt = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt })
      })
      
      if (!response.ok) throw new Error('Failed to save prompt')
      
      const data = await response.json()
      setOriginalPrompt(systemPrompt)
      setLastModified(data.data.lastModified)
      setVersion(data.data.version)
      setMessage({ type: 'success', text: '프롬프트가 성공적으로 저장되었습니다.' })
    } catch (error) {
      setMessage({ type: 'error', text: '프롬프트 저장에 실패했습니다.' })
    } finally {
      setSaving(false)
    }
  }

  const resetPrompt = () => {
    setSystemPrompt(originalPrompt)
    setMessage(null)
  }

  const hasChanges = systemPrompt !== originalPrompt

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">시스템 프롬프트 관리</h2>
          <p className="text-sm text-gray-600 mt-1">
            챗봇의 시스템 프롬프트를 확인하고 수정할 수 있습니다.
          </p>
        </div>
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>버전: {version}</span>
                <span>
                  마지막 수정: {lastModified ? new Date(lastModified).toLocaleString('ko-KR') : '-'}
                </span>
              </div>

              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full min-h-[500px] p-3 font-mono text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="시스템 프롬프트를 입력하세요..."
              />

              {message && (
                <div className={`p-3 rounded-md ${
                  message.type === 'error' 
                    ? 'bg-red-50 text-red-800 border border-red-200' 
                    : 'bg-green-50 text-green-800 border border-green-200'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={resetPrompt}
                  disabled={!hasChanges || saving}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  원래대로
                </button>
                <button
                  onClick={savePrompt}
                  disabled={!hasChanges || saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  저장
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}