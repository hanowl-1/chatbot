'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function QuickSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')

  const handleQuickSync = async () => {
    const savedUrl = localStorage.getItem('googleSheetsUrl')
    
    if (!savedUrl) {
      setMessage('Google Sheets URL이 설정되지 않았습니다. FAQ 업로드 탭에서 먼저 설정해주세요.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setSyncing(true)
    setMessage('')

    try {
      const response = await fetch('/api/google-sheets-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl: savedUrl })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '동기화 실패')
      }

      setMessage(`✓ FAQ 동기화 완료 (${data.data.total}개)`)
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage(`✗ ${error.message}`)
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleQuickSync}
        disabled={syncing}
        className="px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
        title="Google Sheets에서 FAQ 동기화"
      >
        <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
        FAQ 동기화
      </button>
      {message && (
        <span className={`text-sm ${message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </span>
      )}
    </div>
  )
}