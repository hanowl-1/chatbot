"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, Plus } from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import { QAItem, QASearchProps } from "@/types/qa";
import { useAtom } from "jotai";
import { promptsAtom } from "@/lib/atoms";

export default function QASearch({
  onSearchComplete,
  onQAAdded,
}: QASearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGeneratedQA, setAiGeneratedQA] = useState<{
    question: string;
    answer: string;
  } | null>(null);
  const [savingQA, setSavingQA] = useState(false);
  const [prompts, setPrompts] = useAtom(promptsAtom);

  // 컴포넌트 마운트 시 프롬프트 로드
  useEffect(() => {
    // 프롬프트가 비어있으면 로드
    if (!prompts.generate_answer || !prompts.refine_question || !prompts.assess_confidence) {
      fetchPrompts();
    }
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts");
      const data = await response.json();

      if (data) {
        setPrompts({
          analyze_query: data.analyze_query || "",
          refine_question: data.refine_question || "",
          generate_answer: data.generate_answer || "",
          assess_confidence: data.assess_confidence || "",
          generate_final_answer: data.generate_final_answer || "",
          system: data.system || "",
        });
        console.log("✅ QASearch: 프롬프트 로드 완료");
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setAiGeneratedQA(null); // 새 검색 시 초기화
    try {
      const data = await fetchInstance("/qa/search", {
        method: "POST",
        body: JSON.stringify({
          question: searchQuery,
          limit: 5,
        }),
      });
      if (data.results) {
        setSearchResults(data.results);
        onSearchComplete?.(data.results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // AI로 답변 추천
  const generateAIAnswer = async () => {
    setGeneratingAI(true);
    try {
      const data = await fetchInstance("/qa/rag-test/v2", {
        method: "POST",
        body: JSON.stringify({
          question: searchQuery,
          refine_question_prompt: prompts.refine_question,
          generate_answer_prompt: prompts.generate_answer,
          assess_confidence_prompt: prompts.assess_confidence,
          system_prompt: prompts.system,
          model: "gemini-2.0-flash",
          embedding_count: 1,
          scope: "generate_answer",
        }),
      });
      console.log("data", data);

      if (data.generated_answer) {
        setAiGeneratedQA({
          question: searchQuery,
          answer: data.generated_answer,
        });
      }
    } catch (error) {
      console.error("AI generation error:", error);
      alert("❌ AI 답변 생성 중 오류가 발생했습니다.");
    } finally {
      setGeneratingAI(false);
    }
  };

  // 생성된 QA 저장
  const saveGeneratedQA = async () => {
    if (!aiGeneratedQA) return;

    setSavingQA(true);
    try {
      await fetchInstance("/qa/", {
        method: "POST",
        body: JSON.stringify({
          question: aiGeneratedQA.question,
          answer: aiGeneratedQA.answer,
        }),
      });

      // 성공 시
      setAiGeneratedQA(null);
      setSearchQuery("");
      setSearchResults([]);
      onQAAdded?.(); // 목록 새로고침
    } catch (error) {
      console.error("Save QA error:", error);
      alert("❌ QA 저장 중 오류가 발생했습니다.");
    } finally {
      setSavingQA(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Q-A 검색 (유사도 순)</h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="질문을 입력하여 검색..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !searchQuery.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600">검색 중...</span>
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      {!loading && searchResults.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">
              검색 결과: {searchResults.length}개
            </p>
            {/* 최고 유사도가 90% 미만일 때만 버튼 표시 */}
            {searchResults[0]?.similarity_score &&
              searchResults[0].similarity_score < 0.9 &&
              !aiGeneratedQA && (
                <button
                  onClick={generateAIAnswer}
                  disabled={generatingAI}
                  className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 disabled:bg-gray-400 flex items-center gap-1"
                >
                  {generatingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                      AI 생성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      AI로 새 QA 만들기
                    </>
                  )}
                </button>
              )}
          </div>

          {/* AI 생성 결과 */}
          {aiGeneratedQA && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI 생성 QA
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    질문:
                  </label>
                  <textarea
                    value={aiGeneratedQA.question}
                    onChange={(e) =>
                      setAiGeneratedQA({
                        ...aiGeneratedQA,
                        question: e.target.value,
                      })
                    }
                    className="mt-1 w-full p-2 bg-white rounded border border-purple-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    답변:
                  </label>
                  <textarea
                    value={aiGeneratedQA.answer}
                    onChange={(e) =>
                      setAiGeneratedQA({
                        ...aiGeneratedQA,
                        answer: e.target.value,
                      })
                    }
                    className="mt-1 w-full p-2 bg-white rounded border border-purple-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent whitespace-pre-wrap"
                    rows={5}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={saveGeneratedQA}
                    disabled={savingQA}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    {savingQA ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />새 QA로 추가
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setAiGeneratedQA(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {searchResults.map((item, index) => (
            <div key={index} className="p-3 border rounded-lg bg-gray-50">
              <div className="flex items-start gap-2">
                <span className="text-sm font-bold text-gray-500">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700">
                      Q: {item.question}
                    </p>
                    <div className="flex gap-3 text-xs">
                      {item.qa_id && (
                        <span className="text-blue-600 font-semibold">
                          qa_id: {item.qa_id}
                        </span>
                      )}
                      {item.similarity_score !== undefined && (
                        <span className="text-green-600 font-semibold">
                          유사도: {(item.similarity_score * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">A: {item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
