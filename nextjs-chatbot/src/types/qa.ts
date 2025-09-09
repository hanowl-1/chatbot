export interface QAItem {
  qa_id: number;
  question: string;
  answer: string;
  similarity_score: number;
  updated_at: string;
  requires_confirmation?: boolean;
}

export interface QAListProps {
  refreshTrigger?: number;
}

export interface QASearchProps {
  onSearchComplete?: (results: QAItem[]) => void;
  onQAAdded?: () => void;
}

export interface QAAddFormProps {
  onAddSuccess?: () => void;
}
