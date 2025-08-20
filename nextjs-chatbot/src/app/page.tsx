'use client'

import { useState } from 'react'
import PromptsPage from '@/app/prompts/page'
import RAGTesterNew from '@/components/RAGTesterNew'
import Settings from '@/components/Settings'

export default function Home() {
  const [activeTab, setActiveTab] = useState('rag')
  const [ragMessages, setRagMessages] = useState<any[]>([])
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: ''
  })

  const tabs = [
    { id: 'rag', label: 'RAG 테스터' },
    { id: 'prompts', label: '프롬프트 관리' },
    { id: 'settings', label: '설정' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">슈퍼멤버스 RAG 시스템</h1>
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
            {activeTab === 'rag' && <RAGTesterNew messages={ragMessages} setMessages={setRagMessages} />}
            {activeTab === 'prompts' && <PromptsPage />}
            {activeTab === 'settings' && <Settings />}
          </div>
        </div>
      </main>
    </div>
  )
}