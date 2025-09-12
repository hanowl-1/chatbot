import React from "react";
import { Save, RotateCcw, FileText } from "lucide-react";
import { Prompts } from "@/types/prompts";
import { DEFAULT_PROMPTS, PROMPTS_TABS } from "@/constants/prompts";

export default function CurrentPrompt({
  activeTab,
  prompts,
  originalPrompts,
  saveStatus,
  setPrompts,
  savePrompts,
}: {
  activeTab: string;
  prompts: Prompts;
  originalPrompts: Prompts;
  saveStatus: string;
  setPrompts: (prompts: Prompts) => void;
  savePrompts: () => void;
}) {
  const hasChanges =
    JSON.stringify(prompts) !== JSON.stringify(originalPrompts);
  const ActiveIcon =
    PROMPTS_TABS.find((t) => t.id === activeTab)?.icon || FileText;

  // 프롬프트 초기화
  const handleCancel = () => {
    setPrompts(originalPrompts);
  };

  // 기본값으로 복원
  // const handleRestoreDefault = () => {
  //   if (confirm("기본 프롬프트로 복원하시겠습니까?")) {
  //     setPrompts(DEFAULT_PROMPTS);
  //   }
  // };

  return (
    <div className="space-y-4">
      {/* 현재 탭 설명 */}
      <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
        <ActiveIcon className="w-5 h-5 text-gray-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-800">
            {PROMPTS_TABS.find((t) => t.id === activeTab)?.label}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {PROMPTS_TABS.find((t) => t.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* 텍스트 에리어 */}
      <div>
        <textarea
          value={prompts[activeTab as keyof Prompts]?.text || ""}
          onChange={(e) =>
            setPrompts({
              ...prompts,
              [activeTab]: {
                ...prompts[activeTab as keyof Prompts],
                text: e.target.value,
              },
            })
          }
          className="w-full h-96 p-4 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={`${
            PROMPTS_TABS.find((t) => t.id === activeTab)?.label
          }을 입력하세요...`}
        />
        <div className="mt-2 text-right text-sm text-gray-500">
          {prompts[activeTab as keyof Prompts]?.text?.length || 0}
          글자
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-between items-center">
        {/* <div className="flex gap-2">
          <button
            onClick={handleRestoreDefault}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            기본값 복원
          </button>
        </div> */}
        <div className="flex gap-2">
          {hasChanges && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              변경 취소
            </button>
          )}
          <button
            onClick={savePrompts}
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
  );
}
