'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface CostEstimation {
  assumptions: {
    monthly_queries: number
    avg_tokens_per_query: number
  }
  estimations: {
    [model: string]: {
      monthly_cost: number
      yearly_cost: number
      cost_per_query: number
    }
  }
}

export default function CostAnalysis() {
  const [monthlyQueries, setMonthlyQueries] = useState(10000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<CostEstimation | null>(null)

  const fetchEstimation = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(
        `/api/cost-estimation?monthly_queries=${monthlyQueries}`
      )
      setData(response.data)
    } catch (err: any) {
      setError('비용 추정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEstimation()
  }, [monthlyQueries])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">비용 분석</h2>

      <div>
        <label className="block text-sm font-medium mb-2">월간 예상 질의 수</label>
        <input
          type="number"
          value={monthlyQueries}
          onChange={(e) => setMonthlyQueries(Number(e.target.value))}
          className="w-full max-w-xs px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {data && !loading && (
        <>
          <p className="text-sm text-gray-600">
            * 예상 토큰/쿼리: {data.assumptions.avg_tokens_per_query}
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    모델
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    쿼리당 비용
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    월간 비용
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연간 비용
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(data.estimations).map(([model, costs]) => (
                  <tr key={model}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {model.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${costs.cost_per_query.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${costs.monthly_cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${costs.yearly_cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}