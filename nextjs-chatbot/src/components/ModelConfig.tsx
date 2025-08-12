'use client'

import { useState } from 'react'

interface ModelConfigProps {
  apiKeys: {
    openai: string
    anthropic: string
    google: string
  }
  onSave: (keys: { openai: string; anthropic: string; google: string }) => void
}

export default function ModelConfig({ apiKeys, onSave }: ModelConfigProps) {
  const [keys, setKeys] = useState(apiKeys)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave(keys)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">AI 모델 설정</h2>
      
      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          API 키가 저장되었습니다.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
          <input
            type="password"
            value={keys.openai}
            onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="sk-..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Anthropic API Key</label>
          <input
            type="password"
            value={keys.anthropic}
            onChange={(e) => setKeys({ ...keys, anthropic: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="sk-ant-..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Google API Key</label>
          <input
            type="password"
            value={keys.google}
            onChange={(e) => setKeys({ ...keys, google: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="AIza..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          저장
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">API 키 발급 안내</h3>
        <ul className="space-y-2 text-sm">
          <li>• OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-500 hover:underline">platform.openai.com/api-keys</a></li>
          <li>• Anthropic: <a href="https://console.anthropic.com/" target="_blank" className="text-blue-500 hover:underline">console.anthropic.com</a></li>
          <li>• Google: <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-500 hover:underline">makersuite.google.com/app/apikey</a></li>
        </ul>
      </div>
    </div>
  )
}