export interface QAItem {
  id: number;
  qa_id: string;
  question: string;
  answer: string;
  updated_at?: string;
  similarity_score?: number;
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
