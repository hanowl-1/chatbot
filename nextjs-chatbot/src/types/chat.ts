export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  timestamp: Date;
  selectedPipeline?: string;
  referencedVectors?: Array<{
    qa_id: number;
    question: string;
    answer: string;
    similarity_score: number;
    updated_at: string;
  }>;
}
