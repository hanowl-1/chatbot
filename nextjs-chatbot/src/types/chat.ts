export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  timestamp: Date;
  pipelineResults?: {
    queryAnalysis?: any;
    answerGeneration?: any;
    confidenceCheck?: any;
  };
  selectedPipeline?: string;
}
