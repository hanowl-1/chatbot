"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Settings2,
  X,
  ExternalLink,
} from "lucide-react";

// AI 모델 목록
const MODELS = [
  { value: "gemini-2.0-flash", label: "Gemini Flash 2.0", provider: "google" },
  { value: "gemini-2.5-flash", label: "Gemini Flash 2.5", provider: "google" },
  { value: "gpt-4.1", label: "GPT-4.1", provider: "openai" },
  { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { value: "gpt-5", label: "GPT-5", provider: "openai" },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
  qa_id?: string;
  similarity?: number;
}

interface RAGTesterProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function RAGTesterNew({
  messages,
  setMessages,
}: RAGTesterProps) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);
  const [loading, setLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 프롬프트 가져오기
  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      const response = await fetch("/api/prompts");
      const data = await response.json();
      if (data && data.systemPrompt) {
        setCurrentPrompt(data.systemPrompt);
      }
    } catch (error) {
      console.error("Failed to fetch prompt:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // QA 상세 정보 가져오기 및 채팅에 추가
  const fetchQADetail = async (qaId: string) => {
    console.log("Fetching QA detail for ID:", qaId);
    try {
      const response = await fetch(`/api/rag/${qaId}`);
      const data = await response.json();

      const qaMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `📋 QA 상세 정보\n\nID: ${data.id}\n질문: ${
          data.question
        }\n답변: ${data.answer}${
          data.category ? `\n카테고리: ${data.category}` : ""
        }${
          data.updated_at
            ? `\n수정일: ${new Date(data.updated_at).toLocaleDateString(
                "ko-KR"
              )}`
            : ""
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const newMessages = [...prev, qaMessage];
        console.log("Updated messages:", newMessages);
        return newMessages;
      });
    } catch (error) {
      console.error("Failed to fetch QA detail:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "❌ QA 정보를 가져올 수 없습니다.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // RAG Generate API 호출
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    console.log(selectedModel);

    try {
      const response = await fetch("/api/rag/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          prompt_text: currentPrompt,
          model: selectedModel,
          embedding_count: 1,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.generated_answer || "답변을 생성할 수 없습니다.",
        model: selectedModel,
        timestamp: new Date(),
        qa_id: data.referenced_vectors?.[0]?.qa_id,
        similarity: data.referenced_vectors?.[0]?.similarity_score
          ? data.referenced_vectors[0].similarity_score * 100
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "오류가 발생했습니다. 다시 시도해주세요.",
        model: selectedModel,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[700px] flex flex-col">
      {/* 상단 설정 바 */}
      <div className="bg-white rounded-t-lg shadow-md p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              RAG 테스터
            </h2>
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-gray-500" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            프롬프트와 임베딩 벡터를 활용한 답변 품질 테스트
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot className="w-12 h-12 mb-4" />
            <p className="text-lg">질문을 입력하면 RAG 시스템이 답변합니다</p>
            <p className="text-sm mt-2">
              현재 모델: {MODELS.find((m) => m.value === selectedModel)?.label}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl ${
                  message.role === "user" ? "order-2" : "order-1"
                }`}
              >
                <div
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      message.role === "user" ? "bg-blue-500" : "bg-green-500"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.role === "assistant" && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        {message.qa_id && (
                          <p className="text-xs text-gray-500">
                            📌 참조 qa_id:
                            <button
                              onClick={() => fetchQADetail(message.qa_id!)}
                              className="ml-1 text-blue-500 hover:text-blue-700 underline"
                            >
                              {message.qa_id}
                              <ExternalLink className="w-3 h-3 inline ml-1" />
                            </button>
                          </p>
                        )}
                        {message.similarity !== undefined && (
                          <p className="text-xs text-gray-500">
                            🎯 유사도: {message.similarity.toFixed(1)}%
                          </p>
                        )}
                        {message.model && (
                          <p className="text-xs text-gray-500">
                            🤖 모델:{" "}
                            {
                              MODELS.find((m) => m.value === message.model)
                                ?.label
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-green-500">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t p-4 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="질문을 입력하세요..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {currentPrompt && (
          <p className="text-xs text-gray-500 mt-2">
            프롬프트 적용됨 (프롬프트 관리 탭에서 수정 가능)
          </p>
        )}
      </div>
    </div>
  );
}
