export interface Prompts {
  analyze_query: string;
  refine_question: string;
  generate_answer: string;
  assess_confidence: string;
  generate_final_answer: string;
  system: string;
  lastModified?: string;
  version?: number;
}
