import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'

// FAQ 데이터 로드
async function loadFAQData() {
  try {
    const faqPath = path.join(process.cwd(), 'data', 'processed_qna.json')
    const data = await fs.readFile(faqPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { 블로거: [], 광고주: [] }
  }
}

// 시스템 프롬프트 로드
async function loadSystemPrompt() {
  try {
    const promptPath = path.join(process.cwd(), 'data', 'prompts.json')
    const data = await fs.readFile(promptPath, 'utf-8')
    const prompts = JSON.parse(data)
    return prompts.systemPrompt
  } catch (error) {
    // 기본 프롬프트 반환
    return `당신은 슈퍼멤버스 플랫폼 전용 고객지원 AI 챗봇입니다.`
  }
}

// 시스템 프롬프트 생성
async function createSystemPrompt(faqData: any) {
  const basePrompt = await loadSystemPrompt()
  return `${basePrompt}

FAQ 데이터:
${JSON.stringify(faqData, null, 2)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, model, api_key, temperature = 0.1, max_tokens = 500 } = body

    const faqData = await loadFAQData()
    const systemPrompt = await createSystemPrompt(faqData)

    let response = ''
    let tokensUsed = 0
    const startTime = Date.now()

    if (model.startsWith('gpt')) {
      const openai = new OpenAI({ apiKey: api_key })
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature,
        max_tokens
      })
      response = completion.choices[0].message.content || ''
      tokensUsed = completion.usage?.total_tokens || 0
    } else if (model.startsWith('claude')) {
      const anthropic = new Anthropic({ apiKey: api_key })
      const completion = await anthropic.completions.create({
        model: model,
        prompt: `${systemPrompt}\n\nHuman: ${message}\n\nAssistant:`,
        temperature,
        max_tokens_to_sample: max_tokens,
        stop_sequences: ["\n\nHuman:"]
      })
      response = completion.completion
      tokensUsed = Math.ceil((systemPrompt.length + message.length + response.length) / 4)
    } else if (model.startsWith('gemini')) {
      const genAI = new GoogleGenerativeAI(api_key)
      const modelName = model === 'gemini-2.0-flash-exp' ? 'gemini-2.0-flash-exp' : model
      const genModel = genAI.getGenerativeModel({ model: modelName })
      const result = await genModel.generateContent(`${systemPrompt}\n\nUser: ${message}`)
      response = result.response.text()
      tokensUsed = Math.ceil((systemPrompt.length + message.length + response.length) / 4)
    }

    const responseTime = (Date.now() - startTime) / 1000
    const cost = calculateCost(model, tokensUsed)

    return NextResponse.json({
      model,
      response,
      tokens_used: tokensUsed,
      response_time: responseTime,
      cost,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateCost(model: string, tokens: number) {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'gemini-pro': { input: 0.0005, output: 0.0015 }
  }

  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo']
  const avgPrice = (modelPricing.input + modelPricing.output) / 2
  return (tokens / 1000) * avgPrice
}