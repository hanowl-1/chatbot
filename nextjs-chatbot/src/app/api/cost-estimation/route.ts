import { NextRequest, NextResponse } from 'next/server'

const PRICING = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'gemini-pro': { input: 0.0005, output: 0.0015 },
  'gemini-2.0-flash': { input: 0.0001, output: 0.0004 }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const monthlyQueries = parseInt(searchParams.get('monthly_queries') || '10000')
  const avgTokensPerQuery = 500

  const estimations: Record<string, any> = {}

  for (const [model, prices] of Object.entries(PRICING)) {
    const monthlyTokens = monthlyQueries * avgTokensPerQuery
    const inputCost = (monthlyTokens * 0.3 / 1000) * prices.input
    const outputCost = (monthlyTokens * 0.7 / 1000) * prices.output
    const totalCost = inputCost + outputCost

    estimations[model] = {
      monthly_cost: Math.round(totalCost * 100) / 100,
      yearly_cost: Math.round(totalCost * 12 * 100) / 100,
      cost_per_query: Math.round((totalCost / monthlyQueries) * 10000) / 10000
    }
  }

  return NextResponse.json({
    assumptions: {
      monthly_queries: monthlyQueries,
      avg_tokens_per_query: avgTokensPerQuery
    },
    estimations
  })
}