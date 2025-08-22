import { Search, Sparkles, Shield, ArrowRight, Check } from "lucide-react";

export const PIPELINE_OPTIONS = [
  {
    value: "analyze_query",
    label: "질의분석",
    stages: ["analyze_query"],
    description: "사용자 질문 의도 파악 및 분류",
    icon: Search,
    color: "blue",
  },
  {
    value: "generate_answer",
    label: "질의분석 + 답변생성",
    stages: ["analyze_query", "generate_answer"],
    description: "질문 분석 후 RAG 기반 답변 생성",
    icon: Sparkles,
    color: "purple",
  },
  {
    value: "assess_confidence",
    label: "질의분석 + 답변생성 + 신뢰도 검사",
    stages: ["analyze_query", "generate_answer", "assess_confidence"],
    description: "RAG 기반 답변 생성 후 신뢰도 검사",
    icon: Shield,
    color: "green",
  },
  {
    value: "all",
    label: "최종 답변",
    stages: ["analyze_query", "generate_answer", "assess_confidence", "all"],
    description: "신뢰도 검증까지 모든 단계 실행",
    icon: Check,
    color: "red",
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
          stages.includes("analyze_query")
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        <Search className="w-3 h-3" />
        <span className="text-xs font-medium">질의분석</span>
      </div>

      {stages.includes("analyze_query") &&
        stages.includes("generate_answer") && (
          <ArrowRight className="w-4 h-4 text-gray-400" />
        )}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded ${
          stages.includes("generate_answer")
            ? "bg-purple-100 text-purple-700"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        <Sparkles className="w-3 h-3" />
        <span className="text-xs font-medium">답변생성</span>
      </div>

      {stages.includes("generate_answer") &&
        stages.includes("assess_confidence") && (
          <ArrowRight className="w-4 h-4 text-gray-400" />
        )}

      <div
        className={`flex items-center gap-1 px-2 py-1 rounded ${
          stages.includes("assess_confidence")
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        <Shield className="w-3 h-3" />
        <span className="text-xs font-medium">신뢰도</span>
      </div>

      {stages.includes("assess_confidence") && stages.includes("all") && (
        <ArrowRight className="w-4 h-4 text-gray-400" />
      )}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded ${
          stages.includes("all")
            ? "bg-red-100 text-red-700"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        <Check className="w-3 h-3" />
        <span className="text-xs font-medium">최종 답변</span>
      </div>
    </div>
  );
};
