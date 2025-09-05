// 리뷰 관련 상수

export const POLLING_INTERVAL = 60000; // 60초

export const MODAL_MESSAGES = {
  ai: {
    title: "AI 답변 전송 확인",
    message: "AI 답변을 전송하고 검증을 완료하시겠습니까?",
    variant: "info" as const,
  },
  manual: {
    title: "검증 완료 확인",
    message: "AI 답변 없이 검증만 완료하시겠습니까? (CX팀이 직접 응대합니다)",
    variant: "success" as const,
  },
} as const;

export const TAB_MESSAGES = {
  waiting: {
    empty: "검증 대기 중인 질문이 없습니다",
    loadingText: "검증 대기 질문을 불러오는 중...",
  },
  confirmed: {
    empty: "검증 완료된 질문이 없습니다",
    loadingText: "검증 완료 질문을 불러오는 중...",
  },
} as const;
