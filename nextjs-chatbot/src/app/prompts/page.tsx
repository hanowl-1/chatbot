"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Prompts } from "@/types/prompts";
import CurrentPrompt from "@/components/prompts/CurrentPrompt";
import { PROMPTS_TABS } from "@/constants/prompts";
import { fetchInstance } from "@/lib/fetchInstance";
import { useAtom } from "jotai";
import { promptsAtom } from "@/lib/atoms";
import { useLoadPrompts } from "@/hooks/useLoadPrompts";

export default function PromptsPage() {
  useLoadPrompts(); // 초기 로드 처리
  const [prompts, setPrompts] = useAtom(promptsAtom); // 전역 상태 읽기/쓰기

  const [editingPrompts, setEditingPrompts] = useState<Prompts>(prompts);
  const [originalPrompts, setOriginalPrompts] = useState<Prompts>(prompts);

  const [activeTab, setActiveTab] = useState<keyof Prompts>("system");

  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // 전역 상태가 변경되면 로컬 상태도 업데이트
  useEffect(() => {
    setEditingPrompts(prompts);
    setOriginalPrompts(prompts);
  }, [prompts]);

  // 프롬프트 저장
  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      // prompt_type을 API 형식으로 매핑
      const typeMapping: Record<string, string> = {
        generate_answer: "answer_generation",
        assess_confidence: "confidence_check",
        refine_question: "refine_question",
        system: "system",
      };

      const result = await fetchInstance("/prompts", {
        method: "PATCH",
        body: JSON.stringify({
          prompt_type: typeMapping[activeTab] || activeTab,
          prompt_text: editingPrompts[activeTab].text,
        }),
      });

      // 응답에서 업데이트된 메타데이터 반영
      if (result) {
        const updatedPrompts = {
          ...editingPrompts,
          [activeTab]: {
            ...editingPrompts[activeTab],
            lastModified: result.last_modified,
            version: result.version,
          },
        };
        // 전역 상태 업데이트!
        setPrompts(updatedPrompts);
        setEditingPrompts(updatedPrompts);
        setOriginalPrompts(updatedPrompts);
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
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
          {editingPrompts[activeTab] && (
            <div className="text-sm text-gray-500">
              {editingPrompts[activeTab].version &&
                `버전: ${editingPrompts[activeTab].version}`}
              {editingPrompts[activeTab].version &&
                editingPrompts[activeTab].lastModified &&
                " | "}
              {editingPrompts[activeTab].lastModified &&
                `수정일: ${new Date(
                  editingPrompts[activeTab].lastModified
                ).toLocaleDateString("ko-KR")}`}
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
        <CurrentPrompt
          activeTab={activeTab}
          prompts={editingPrompts}
          originalPrompts={originalPrompts}
          saveStatus={saveStatus}
          setPrompts={setEditingPrompts}
          savePrompts={handleSave}
        />
      </div>
    </div>
  );
}
