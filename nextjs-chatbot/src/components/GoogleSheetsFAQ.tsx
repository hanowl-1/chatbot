'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Link, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react'

export default function GoogleSheetsFAQ() {
  const [sheetUrl, setSheetUrl] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [faqCount, setFaqCount] = useState({ 블로거: 0, 광고주: 0, total: 0 })

  useEffect(() => {
    // 고정된 Google Sheets URL 설정
    const fixedUrl = 'https://docs.google.com/spreadsheets/d/1QyimFEo-B9-5Nxt4OwWemAUr7aT6xxX0LGKGwSE0UDA/edit?gid=0#gid=0'
    setSheetUrl(fixedUrl)
    localStorage.setItem('googleSheetsUrl', fixedUrl)
    
    // 초기 상태 로드
    loadSyncStatus()
  }, [])

  const loadSyncStatus = async () => {
    try {
      const response = await fetch('/api/google-sheets-sync')
      const data = await response.json()
      setFaqCount(data.count)
      if (data.lastSync) {
        setLastSync(data.lastSync)
      }
    } catch (error) {
      console.error('Failed to load sync status:', error)
    }
  }

  const handleSync = async () => {
    if (!sheetUrl) {
      setMessage('Google Sheets URL을 입력해주세요.')
      setSyncStatus('error')
      return
    }

    setSyncing(true)
    setSyncStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/google-sheets-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '동기화 실패')
      }

      // URL 저장
      localStorage.setItem('googleSheetsUrl', sheetUrl)
      
      setSyncStatus('success')
      setMessage(data.message)
      setFaqCount(data.data)
      setLastSync(new Date().toISOString())
    } catch (error: any) {
      setSyncStatus('error')
      setMessage(error.message || '동기화 중 오류가 발생했습니다.')
    } finally {
      setSyncing(false)
    }
  }

  const templateUrl = 'https://docs.google.com/spreadsheets/d/1QyimFEo-B9-5Nxt4OwWemAUr7aT6xxX0LGKGwSE0UDA/edit?gid=0#gid=0'

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <FileSpreadsheet className="mr-2" />
          Google Sheets FAQ 관리
        </h2>

        <div className="space-y-4">
          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">슈퍼멤버스 FAQ Google Sheets 연동</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p className="font-medium">📊 공식 FAQ 시트:</p>
              <a 
                href={templateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-blue-700 font-medium">슈퍼멤버스 FAQ 시트 열기</span>
              </a>
              
              <div className="mt-4 pt-3 border-t border-blue-200">
                <p className="font-medium mb-2">✅ 시트 구성:</p>
                <ul className="space-y-1 ml-4">
                  <li>• <strong>블로거</strong> 시트: 블로거 관련 FAQ</li>
                  <li>• <strong>광고주</strong> 시트: 광고주 관련 FAQ</li>
                  <li>• 열 구성: A(질문) | B(답변) | C(타입)</li>
                </ul>
              </div>

              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800">
                  <strong>주의:</strong> FAQ 수정은 Google Sheets에서 직접 하시고, 여기서는 동기화만 하세요.
                </p>
              </div>
            </div>
          </div>

          {/* URL 입력 필드 - 숨김 처리 */}
          <div className="hidden">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Sheets URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                동기화
              </button>
            </div>
          </div>

          {/* 동기화 버튼 */}
          <div className="flex justify-center">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg font-medium"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              FAQ 데이터 동기화
            </button>
          </div>

          {/* 상태 메시지 */}
          {message && (
            <div className={`p-3 rounded-md flex items-center ${
              syncStatus === 'error' 
                ? 'bg-red-50 text-red-800 border border-red-200' 
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
              {syncStatus === 'error' ? (
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              {message}
            </div>
          )}

          {/* FAQ 현황 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">현재 FAQ 데이터</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">블로거 FAQ:</span>
                <p className="font-semibold text-lg">{faqCount.블로거}개</p>
              </div>
              <div>
                <span className="text-gray-600">광고주 FAQ:</span>
                <p className="font-semibold text-lg">{faqCount.광고주}개</p>
              </div>
              <div>
                <span className="text-gray-600">전체:</span>
                <p className="font-semibold text-lg text-blue-600">{faqCount.total}개</p>
              </div>
            </div>
            {lastSync && (
              <p className="text-xs text-gray-500 mt-3">
                마지막 동기화: {new Date(lastSync).toLocaleString('ko-KR')}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}