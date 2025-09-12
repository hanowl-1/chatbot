"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Prompts } from "@/types/prompts";
import Loading from "@/components/common/Loading";
import CurrentPrompt from "@/components/prompts/CurrentPrompt";
import { DEFAULT_PROMPTS, PROMPTS_TABS } from "@/constants/prompts";
import { fetchInstance } from "@/lib/fetchInstance";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompts>(DEFAULT_PROMPTS);

  const [originalPrompts, setOriginalPrompts] =
    useState<Prompts>(DEFAULT_PROMPTS);

  const [activeTab, setActiveTab] = useState<keyof Prompts>("system");
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
      const data = await fetchInstance("/prompts");
      // API에서 받은 프롬프트 설정
      if (data && Array.isArray(data)) {
        // 배열을 prompt_type으로 매핑
        const promptMap = data.reduce((acc, item) => {
          acc[item.prompt_type] = item;
          return acc;
        }, {} as any);

        const newPrompts = {
          generate_answer: {
            text: promptMap.answer_generation?.prompt_text || "",
            lastModified: promptMap.answer_generation?.last_modified,
            version: promptMap.answer_generation?.version,
          },
          assess_confidence: {
            text: promptMap.confidence_check?.prompt_text || "",
            lastModified: promptMap.confidence_check?.last_modified,
            version: promptMap.confidence_check?.version,
          },
          refine_question: {
            text: promptMap.refine_question?.prompt_text || "",
            lastModified: promptMap.refine_question?.last_modified,
            version: promptMap.refine_question?.version,
          },
          system: {
            text: promptMap.system?.prompt_text || "",
            lastModified: promptMap.system?.last_modified,
            version: promptMap.system?.version,
          },
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
          prompt_text: prompts[activeTab].text,
        }),
      });

      // 응답에서 업데이트된 메타데이터 반영
      if (result) {
        const updatedPrompts = {
          ...prompts,
          [activeTab]: {
            ...prompts[activeTab],
            lastModified: result.last_modified,
            version: result.version,
          },
        };
        setPrompts(updatedPrompts);
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
          {prompts[activeTab] && (
            <div className="text-sm text-gray-500">
              {prompts[activeTab].version &&
                `버전: ${prompts[activeTab].version}`}
              {prompts[activeTab].version &&
                prompts[activeTab].lastModified &&
                " | "}
              {prompts[activeTab].lastModified &&
                `수정일: ${new Date(
                  prompts[activeTab].lastModified
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
