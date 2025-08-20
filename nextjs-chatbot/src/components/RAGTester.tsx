// 더 이상 사용하지 않음
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Plus,
  Check,
  Edit2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Medal,
  Award,
  MessageCircle,
  Search,
} from "lucide-react";

interface SearchResult {
  id: string;
  question: string;
  answer: string;
  similarity_score?: number;
  category?: string;
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  results?: SearchResult[];
  timestamp: Date;
}

export default function RAGTester() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResults, setCurrentResults] = useState<SearchResult[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(false);
  const [customAnswer, setCustomAnswer] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 검색 API 호출
  const handleSearch = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`/api/rag/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage.content,
          limit: 10,
        }),
      });

      const data = await response.json();
      console.log(data);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: userMessage.content,
        results: data.results || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentResults(data.results || []);
      setSelectedMessage(assistantMessage.id);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // QA 생성
  const createQA = async (question: string, answer: string) => {
    try {
      const response = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
        }),
      });

      if (response.ok) {
        alert("✅ QA가 성공적으로 저장되었습니다!");
        setEditingAnswer(false);
        setCustomAnswer("");
        setCustomQuestion("");
      }
    } catch (error) {
      console.error("Create QA error:", error);
      alert("❌ 저장 중 오류가 발생했습니다.");
    }
  };

  // 순위 아이콘 반환
  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-orange-600" />;
    return (
      <span className="text-sm font-medium text-gray-500">{index + 1}</span>
    );
  };

  // 메시지 클릭 시 결과 표시
  const handleMessageClick = (message: Message) => {
    if (message.type === "assistant" && message.results) {
      setCurrentResults(message.results);
      setSelectedMessage(message.id);
    }
  };

  return (
    <div className="flex h-[700px] max-w-full gap-4">
      {/* 왼쪽: 채팅 영역 */}
      <div className="flex flex-col w-1/2 bg-white rounded-lg shadow-lg">
        <div className="p-4 bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            질문 채팅
          </h3>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Search className="w-12 h-12 mb-4" />
              <p className="text-lg">질문을 입력해주세요</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
                onClick={() => handleMessageClick(message)}
              >
                {message.type === "user" ? (
                  <div className="max-w-xs px-4 py-2 bg-blue-500 text-white rounded-lg">
                    {message.content}
                  </div>
                ) : (
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg cursor-pointer transition-all ${
                      selectedMessage === message.id
                        ? "bg-green-100 border-2 border-green-400"
                        : "bg-white border border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">
                        {message.results?.length || 0}개 답변 찾음
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      클릭하여 결과 보기
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 bg-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSearch()
              }
              placeholder="질문을 입력하세요..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 오른쪽: 검색 결과 */}
      <div className="flex flex-col w-1/2 bg-white rounded-lg shadow-lg">
        <div className="p-4 bg-green-600 text-white rounded-t-lg">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            검색 결과
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {currentResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Search className="w-12 h-12 mb-4" />
              <p>검색 결과가 여기에 표시됩니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Top 3 결과 */}
              <div className="space-y-2">
                {currentResults.slice(0, 3).map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      index === 0
                        ? "bg-yellow-50 border-yellow-300 shadow-md"
                        : index === 1
                        ? "bg-gray-50 border-gray-300"
                        : "bg-orange-50 border-orange-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(index)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-700 mb-1">
                          Q: {result.question}
                        </div>
                        <div className="text-gray-900 text-sm">
                          A: {result.answer}
                        </div>
                        {result.similarity_score && (
                          <div className="text-xs text-gray-500 mt-1">
                            관련도: {(result.similarity_score * 100).toFixed(1)}
                            %
                          </div>
                        )}
                        <button
                          onClick={() =>
                            createQA(
                              messages.find((m) => m.id === selectedMessage)
                                ?.content || "",
                              result.answer
                            )
                          }
                          className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
                        >
                          <Check className="w-3 h-3 inline mr-1" />이 답변 선택
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 나머지 결과 (4-10위) */}
              {currentResults.length > 3 && (
                <div>
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mb-2"
                  >
                    {showMore ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {showMore
                      ? "접기"
                      : `나머지 ${currentResults.length - 3}개 답변 보기`}
                  </button>

                  {showMore && (
                    <div className="space-y-2">
                      {currentResults.slice(3).map((result, index) => (
                        <div
                          key={index + 3}
                          className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                              <span className="text-xs font-medium text-gray-600">
                                {index + 4}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-600 mb-1">
                                Q: {result.question}
                              </div>
                              <div className="text-sm text-gray-800">
                                A: {result.answer}
                              </div>
                              {result.similarity_score && (
                                <div className="text-xs text-gray-400 mt-1">
                                  관련도:{" "}
                                  {(result.similarity_score * 100).toFixed(1)}%
                                </div>
                              )}
                              <button
                                onClick={() =>
                                  createQA(
                                    messages.find(
                                      (m) => m.id === selectedMessage
                                    )?.content || "",
                                    result.answer
                                  )
                                }
                                className="mt-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors"
                              >
                                선택
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 커스텀 답변 작성 */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Edit2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    직접 답변 작성하기
                  </span>
                </div>
                {editingAnswer ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        질문
                      </label>
                      <textarea
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="질문을 입력하세요..."
                        className="w-full p-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        답변
                      </label>
                      <textarea
                        value={customAnswer}
                        onChange={(e) => setCustomAnswer(e.target.value)}
                        placeholder="답변을 입력하세요..."
                        className="w-full p-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          createQA(customQuestion, customAnswer);
                        }}
                        disabled={
                          !customQuestion.trim() || !customAnswer.trim()
                        }
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => {
                          setEditingAnswer(false);
                          setCustomAnswer("");
                          setCustomQuestion("");
                        }}
                        className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded-md transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingAnswer(true);
                      setCustomAnswer("");
                      setCustomQuestion("");
                    }}
                    className="px-3 py-1 bg-white hover:bg-gray-50 text-blue-600 text-sm rounded-md border border-blue-300 transition-colors"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />새 답변 작성
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
