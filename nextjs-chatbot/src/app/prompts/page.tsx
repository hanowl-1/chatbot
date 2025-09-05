"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Prompts } from "@/types/prompts";
import { useAtom } from "jotai";
import { promptsAtom } from "@/lib/atoms";
import Loading from "@/components/common/Loading";
import CurrentPrompt from "@/components/prompts/CurrentPrompt";
import { DEFAULT_PROMPTS, PROMPTS_TABS } from "@/constants/prompts";

// API 호출 실패 시 사용할 기본값 (폴백용)

export default function PromptsPage() {
  // const [prompts, setPrompts] = useState<Prompts>(DEFAULT_PROMPTS);
  const [prompts, setPrompts] = useAtom(promptsAtom);

  const [originalPrompts, setOriginalPrompts] =
    useState<Prompts>(DEFAULT_PROMPTS);

  // const [activeTab, setActiveTab] = useState<keyof Prompts>("analyze_query");
  const [activeTab, setActiveTab] = useState<keyof Prompts>("refine_question");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

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
          analyze_query: data.analyze_query || "",
          generate_answer: data.generate_answer || "",
          refine_question: data.refine_question || "",
          assess_confidence: data.assess_confidence || "",
          generate_final_answer: data.generate_final_answer || "",
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
          analyze_query: prompts.analyze_query,
          refine_question: prompts.refine_question,
          generate_answer: prompts.generate_answer,
          assess_confidence: prompts.assess_confidence,
          generate_final_answer: prompts.generate_final_answer,
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
          {PROMPTS_TABS.map((tab) => {
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
          <Loading size="lg" text="프롬프트 불러오는 중..." className="py-12" />
        ) : (
          <CurrentPrompt
            activeTab={activeTab}
            prompts={prompts}
            originalPrompts={originalPrompts}
            saveStatus={saveStatus}
            setPrompts={setPrompts}
            savePrompts={handleSave}
          />
        )}
      </div>
    </div>
  );
}
