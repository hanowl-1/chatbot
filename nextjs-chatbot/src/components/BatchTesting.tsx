'use client'

import { useState } from 'react'

interface BatchTestingProps {
  apiKeys: {
    openai: string
    anthropic: string
    google: string
  }
}

export default function BatchTesting({ apiKeys }: BatchTestingProps) {
  const [queries, setQueries] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const defaultQueries = [
    '블로거 랭킹을 조회하고 싶은데요.',
    '등급 심사는 언제쯤 받을 수 있나요?',
    '광고 진행하고 싶어요. 어떤 순서로 진행해야 하나요?',
    '세금계산서 발행은 어떻게 하나요?',
    '포인트는 언제 입금될까요?',
  ]

  const handleBatchTest = async () => {
    const testQueries = queries.split('\n').filter(q => q.trim())
    if (testQueries.length === 0) return

    setLoading(true)
    setResults([])

    // TODO: Implement batch test API
    // For now, just show a placeholder message
    setTimeout(() => {
      setResults([
        {
          query: testQueries[0],
          results: [
            { model: 'GPT-4', response: 'GPT-4 응답 예시...', tokens: 150, cost: 0.0045, time: 1.2 },
            { model: 'Claude 3', response: 'Claude 응답 예시...', tokens: 140, cost: 0.0021, time: 1.1 },
          ]
        }
      ])
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">배치 테스트</h2>

      <div>
        <label className="block text-sm font-medium mb-2">
          테스트 질문 (한 줄에 하나씩)
        </label>
        <textarea
          value={queries}
          onChange={(e) => setQueries(e.target.value)}
          placeholder={defaultQueries.join('\n')}
          className="w-full h-40 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleBatchTest}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            테스트 실행
          </button>
          
          <button
            onClick={() => setQueries(defaultQueries.join('\n'))}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            예제 질문 사용
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">테스트 진행 중...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">테스트 결과</h3>
          {results.map((result, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">질문: {result.query}</h4>
              <div className="space-y-2">
                {result.results.map((r: any, ridx: number) => (
                  <div key={ridx} className="bg-gray-50 p-3 rounded">
                    <div className="font-medium">{r.model}</div>
                    <div className="text-sm text-gray-600">{r.response}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {r.tokens} tokens • ${r.cost.toFixed(4)} • {r.time}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}