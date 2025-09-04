// 자동답변 관련 타입 정의

// 자동답변 요약 API 응답 타입
export interface AutoReplySummaryResponse {
  chatroom_id: string;
  chatroom_name: string;
  auto_reply_enabled: boolean;
  last_updated: string;
}

// 개별 채팅방 자동답변 상태 응답 타입
export interface ChatroomAutoReplyStatus {
  chatroom_name: string;
  auto_reply_enabled: boolean;
  last_updated: string;
}

// 자동답변 설정 변경 요청 타입
export interface UpdateAutoReplyRequest {
  auto_reply_enabled: boolean;
}
