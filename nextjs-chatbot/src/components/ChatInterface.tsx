'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
  model?: string
  tokens?: number
  cost?: number
  time?: number
  timestamp: Date
}

interface ChatInterfaceProps {
  apiKeys: {
    openai: string
    anthropic: string
    google: string
  }
}

const MODELS = [
  { value: 'gpt-4', label: 'GPT-4', provider: 'openai' },
  { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo', provider: 'openai' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'openai' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus', provider: 'anthropic' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet', provider: 'anthropic' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', provider: 'anthropic' },
  { value: 'gemini-pro', label: 'Gemini Pro', provider: 'google' },
]

export default function ChatInterface({ apiKeys }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getApiKey = (model: string) => {
    const provider = MODELS.find(m => m.value === model)?.provider
    return apiKeys[provider as keyof typeof apiKeys]
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/chat', {
        message: input,
        model: selectedModel,
        api_key: getApiKey(selectedModel),
        temperature: 0.1,
        max_tokens: 500,
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        model: selectedModel,
        tokens: response.data.tokens_used,
        cost: response.data.cost,
        time: response.data.response_time,
        timestamp: new Date(response.data.timestamp),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      setError(`Error: ${err.response?.data?.error || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {MODELS.map(model => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white'
              }`}
            >
              {message.model && (
                <div className="text-xs mb-1 opacity-75">
                  {MODELS.find(m => m.value === message.model)?.label}
                  {message.tokens && ` • ${message.tokens} tokens`}
                  {message.cost !== undefined && ` • $${message.cost.toFixed(4)}`}
                  {message.time && ` • ${message.time.toFixed(2)}s`}
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div className="text-xs mt-1 opacity-50">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="질문을 입력하세요..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          전송
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">빠른 테스트 질문</h3>
        <div className="flex flex-wrap gap-2">
          {[
            '블로거 랭킹을 조회하고 싶은데요.',
            '등급 심사는 언제쯤 받을 수 있나요?',
            '광고 진행하고 싶어요. 어떤 순서로 진행해야 하나요?',
            '세금계산서 발행은 어떻게 하나요?',
          ].map((question, idx) => (
            <button
              key={idx}
              onClick={() => setInput(question)}
              className="px-3 py-1 bg-white border rounded-full hover:bg-gray-100 text-sm"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}