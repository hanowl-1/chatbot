export interface PromptData {
  text: string;
  lastModified?: string;
  version?: number;
}

export interface Prompts {
  // analyze_query: PromptData;
  refine_question: PromptData;
  generate_answer: PromptData;
  assess_confidence: PromptData;
  // generate_final_answer: PromptData;
  system: PromptData;
}
