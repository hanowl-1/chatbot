"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Save,
  RotateCcw,
  Sparkles,
  Search,
  Shield,
} from "lucide-react";

interface Prompts {
  queryAnalysis: string;
  answerGeneration: string;
  confidenceCheck: string;
  lastModified?: string;
  version?: number;
}

// API 호출 실패 시 사용할 기본값 (폴백용)
const DEFAULT_PROMPTS = {
  queryAnalysis: "",
  answerGeneration: "",
  confidenceCheck: "",
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompts>(DEFAULT_PROMPTS);
  const [originalPrompts, setOriginalPrompts] =
    useState<Prompts>(DEFAULT_PROMPTS);
  const [activeTab, setActiveTab] = useState<keyof Prompts>("queryAnalysis");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const tabs = [
    {
      id: "queryAnalysis" as const,
      label: "질의분석 프롬프트",
      icon: Search,
      description: "사용자 질문 의도 파악 및 분류",
    },
    {
      id: "answerGeneration" as const,
      label: "답변생성 프롬프트",
      icon: Sparkles,
      description: "RAG 기반 답변 생성",
    },
    {
      id: "confidenceCheck" as const,
      label: "신뢰도검사 프롬프트",
      icon: Shield,
      description: "답변 품질 및 신뢰도 평가",
    },
  ];

  // 프롬프트 불러오기
  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/prompts");
      const data = await response.json();

      // API에서 받은 프롬프트 설정
      if (data) {
        const newPrompts = {
          queryAnalysis: data.queryAnalysisPrompt || "",
          answerGeneration: data.answerGenerationPrompt || "",
          confidenceCheck: data.confidenceCheckPrompt || "",
          lastModified: data.lastModified,
          version: data.version,
        };
        setPrompts(newPrompts);
        setOriginalPrompts(newPrompts);
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
      setPrompts(DEFAULT_PROMPTS);
      setOriginalPrompts(DEFAULT_PROMPTS);
    } finally {
      setLoading(false);
    }
  };

  // 프롬프트 저장
  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const response = await fetch("/api/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryAnalysisPrompt: prompts.queryAnalysis,
          answerGenerationPrompt: prompts.answerGeneration,
          confidenceCheckPrompt: prompts.confidenceCheck,
        }),
      });

      if (response.ok) {
        setSaveStatus("saved");
        setOriginalPrompts(prompts);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  // 프롬프트 초기화
  const handleReset = () => {
    setPrompts(originalPrompts);
  };

  // 기본값으로 복원
  const handleRestoreDefault = () => {
    if (confirm("기본 프롬프트로 복원하시겠습니까?")) {
      setPrompts(DEFAULT_PROMPTS);
    }
  };

  const hasChanges =
    JSON.stringify(prompts) !== JSON.stringify(originalPrompts);
  const ActiveIcon = tabs.find((t) => t.id === activeTab)?.icon || FileText;

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* 헤더 */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              프롬프트 관리
            </h2>
            <p className="text-gray-600 mt-1">
              각 LLM 단계별 프롬프트를 관리하고 최적화하세요
            </p>
          </div>
          {prompts.version && (
            <div className="text-sm text-gray-500">
              버전: {prompts.version} | 수정일:{" "}
              {prompts.lastModified
                ? new Date(prompts.lastModified).toLocaleDateString("ko-KR")
                : "-"}
            </div>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b">
        <nav className="flex px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 mr-2 font-medium transition-all flex items-center gap-2 border-b-2 ${
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 border-transparent hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 프롬프트 에디터 */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* 현재 탭 설명 */}
            <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
              <ActiveIcon className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-800">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {tabs.find((t) => t.id === activeTab)?.description}
                </p>
              </div>
            </div>

            {/* 텍스트 에리어 */}
            <div>
              <textarea
                value={prompts[activeTab]}
                onChange={(e) =>
                  setPrompts({
                    ...prompts,
                    [activeTab]: e.target.value,
                  })
                }
                className="w-full h-96 p-4 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`${
                  tabs.find((t) => t.id === activeTab)?.label
                }을 입력하세요...`}
              />
              <div className="mt-2 text-right text-sm text-gray-500">
                {typeof prompts[activeTab] === "string"
                  ? prompts[activeTab].length
                  : 0}{" "}
                글자
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreDefault}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  기본값 복원
                </button>
              </div>
              <div className="flex gap-2">
                {hasChanges && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    변경 취소
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saveStatus === "saving"}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    hasChanges
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {saveStatus === "saving"
                    ? "저장 중..."
                    : saveStatus === "saved"
                    ? "저장 완료!"
                    : saveStatus === "error"
                    ? "저장 실패"
                    : "저장"}
                </button>
              </div>
            </div>

            {/* 상태 메시지 */}
            {saveStatus === "saved" && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                ✅ 프롬프트가 성공적으로 저장되었습니다.
              </div>
            )}
            {saveStatus === "error" && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg">
                ❌ 저장 중 오류가 발생했습니다. 다시 시도해주세요.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
