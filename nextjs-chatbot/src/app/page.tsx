'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import CostAnalysis from '@/components/CostAnalysis'
import BatchTesting from '@/components/BatchTesting'
import FAQUploader from '@/components/FAQUploader'
import GoogleSheetsFAQ from '@/components/GoogleSheetsFAQ'
import PromptsPage from '@/app/prompts/page'
import QuickSyncButton from '@/components/QuickSyncButton'

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: ''
  })

  const tabs = [
    { id: 'chat', label: '챗봇 테스트' },
    { id: 'cost', label: '비용 분석' },
    { id: 'batch', label: '일괄 테스트' },
    { id: 'faq', label: 'FAQ 시트 연동' },
    { id: 'prompts', label: '프롬프트 관리' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">슈퍼멤버스 FAQ 챗봇 테스터</h1>
          <QuickSyncButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'chat' && <ChatInterface apiKeys={apiKeys} />}
            {activeTab === 'cost' && <CostAnalysis />}
            {activeTab === 'batch' && <BatchTesting apiKeys={apiKeys} />}
            {activeTab === 'faq' && <GoogleSheetsFAQ />}
            {activeTab === 'prompts' && <PromptsPage />}
          </div>
        </div>
      </main>
    </div>
  )
}