export interface PendingReview {
  chat_dialog_id: number;
  chatroom_id: number;
  chatroom_name: string;
  confidence: number;
  created_at: string;
  generated_answer: string;
  id: number;
  is_confirmed: boolean;
  requires_confirmation: boolean;
  status: string;
  updated_at: string;
}

export interface ReviewChatDialog {
  hatroom_id: number;
  collected_at: string;
  created_at: string;
  id: number;
  message: string;
  sender_type: string;
}

export type ReviewTabType = "confirmed" | "waiting";
