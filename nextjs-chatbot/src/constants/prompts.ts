import { RotateCcw, Sparkles, Shield, Brain } from "lucide-react";

import { Prompts } from "@/types/prompts";

export const DEFAULT_PROMPTS: Prompts = {
  // analyze_query: { text: "", lastModified: undefined, version: undefined },
  refine_question: { text: "", lastModified: undefined, version: undefined },
  generate_answer: { text: "", lastModified: undefined, version: undefined },
  assess_confidence: { text: "", lastModified: undefined, version: undefined },
  // generate_final_answer: { text: "", lastModified: undefined, version: undefined },
  system: { text: "", lastModified: undefined, version: undefined },
};

export const PROMPTS_TABS = [
  {
    id: "system" as const,
    label: "시스템 프롬프트",
    icon: Brain,
    description: "AI의 전반적인 동작 제어",
  },
  // {
  //   id: "analyze_query" as const,
  //   label: "질의분석 프롬프트",
  //   icon: Search,
  //   description: "사용자 질문 의도 파악 및 분류",
  // },
  {
    id: "refine_question" as const,
    label: "질의 재정의 프롬프트",
    icon: RotateCcw,
    description: "사용자 질문 재구성",
  },
  {
    id: "generate_answer" as const,
    label: "답변생성 프롬프트",
    icon: Sparkles,
    description: "RAG 기반 답변 생성",
  },
  {
    id: "assess_confidence" as const,
    label: "신뢰도검사 프롬프트",
    icon: Shield,
    description: "답변 품질 및 신뢰도 평가",
  },
  // {
  //   id: "generate_final_answer" as const,
  //   label: "최종 답변 프롬프트",
  //   icon: Check,
  //   description: "최종 답변 생성",
  // },
];
