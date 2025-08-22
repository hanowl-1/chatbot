import { Search, Sparkles, Shield, ArrowRight } from "lucide-react";

export const PIPELINE_OPTIONS = [
  {
    value: "queryAnalysis",
    label: "질의분석만",
    stages: ["queryAnalysis"],
    description: "사용자 질문 의도 파악 및 분류",
    icon: Search,
    color: "blue",
  },
  {
    value: "answerGeneration",
    label: "질의분석 + 답변생성",
    stages: ["queryAnalysis", "answerGeneration"],
    description: "질문 분석 후 RAG 기반 답변 생성",
    icon: Sparkles,
    color: "purple",
  },
  {
    value: "confidenceCheck",
    label: "전체 파이프라인",
    stages: ["queryAnalysis", "answerGeneration", "confidenceCheck"],
    description: "신뢰도 검증까지 모든 단계 실행",
    icon: Shield,
    color: "green",
  },
];

// 파이프라인 시각화 컴포넌트
export const PipelineVisualization = ({ selected }: { selected: string }) => {
  const option = PIPELINE_OPTIONS.find((p) => p.value === selected);
  const stages = option?.stages || [];

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded ${
          stages.includes("queryAnalysis")
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        <Search className="w-3 h-3" />
        <span className="text-xs font-medium">질의분석</span>
      </div>

      {stages.includes("queryAnalysis") && (
        <ArrowRight className="w-4 h-4 text-gray-400" />
      )}

      <div
        className={`flex items-center gap-1 px-2 py-1 rounded ${
          stages.includes("answerGeneration")
            ? "bg-purple-100 text-purple-700"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        <Sparkles className="w-3 h-3" />
        <span className="text-xs font-medium">답변생성</span>
      </div>

      {stages.includes("answerGeneration") &&
        stages.includes("confidenceCheck") && (
          <ArrowRight className="w-4 h-4 text-gray-400" />
        )}

      <div
        className={`flex items-center gap-1 px-2 py-1 rounded ${
          stages.includes("confidenceCheck")
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        <Shield className="w-3 h-3" />
        <span className="text-xs font-medium">신뢰도</span>
      </div>
    </div>
  );
};
