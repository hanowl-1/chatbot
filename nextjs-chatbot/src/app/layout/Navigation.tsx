"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, Settings2 } from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import {
  PIPELINE_OPTIONS,
  PipelineVisualization,
} from "@/components/chatbot/PipelineVisualization";
import { MODELS } from "@/constants/model";
import { Prompts } from "@/types/prompts";
import { Message } from "@/types/chat";

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);
  const [selectedPipeline, setSelectedPipeline] = useState(
    PIPELINE_OPTIONS[0].value
  );
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<Prompts>({
    queryAnalysis: "",
    answerGeneration: "",
    confidenceCheck: "",
  });
  const [messages, setMessages] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 프롬프트 가져오기
  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts");
      const data = await response.json();
      if (data) {
        setPrompts({
          queryAnalysis: data.queryAnalysisPrompt || "",
          answerGeneration: data.systemPrompt || "",
          confidenceCheck: data.confidenceCheckPrompt || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 파이프라인 실행
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 선택된 파이프라인 정보
      const pipelineInfo = PIPELINE_OPTIONS.find(
        (p) => p.value === selectedPipeline
      );

      // API 호출 (실제 구현 시 수정 필요)
      // const response = await fetch("/api/rag/test", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     question: input,
      //     model: selectedModel,
      //     pipeline: selectedPipeline,
      //     stages: pipelineInfo?.stages,
      //     prompts: {
      //       queryAnalysis: prompts.queryAnalysis,
      //       answerGeneration: prompts.answerGeneration,
      //       confidenceCheck: prompts.confidenceCheck,
      //     },
      //   }),
      // });
      const data = await fetchInstance(`/qa/rag-generate`, {
        method: "POST",
        body: JSON.stringify({
          question: input,
          prompt_text: prompts.answerGeneration,
          model: selectedModel,
          embedding_count: 3,
        }),
      });

      // const data = await response.json();

      // 결과 메시지 생성
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.generated_answer || "답변을 생성할 수 없습니다.",
        model: selectedModel,
        timestamp: new Date(),
        // pipelineResults: data,
        // selectedPipeline: selectedPipeline,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);

      // 더미 응답 (개발용)
      const pipelineInfo = PIPELINE_OPTIONS.find(
        (p) => p.value === selectedPipeline
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "오류가 발생했습니다. 다시 시도해주세요.",
        model: selectedModel,
        timestamp: new Date(),
        // pipelineResults: dummyResults,
        // selectedPipeline: selectedPipeline,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  // 파이프라인 결과 포맷팅
  // const formatPipelineResults = (results: any, stages: string[]) => {
  //   let formatted = "";

  //   if (stages.includes("queryAnalysis") && results.queryAnalysis) {
  //     formatted += "### 📊 질의분석 결과\n";
  //     formatted += `- **의도**: ${results.queryAnalysis.intent}\n`;
  //     formatted += `- **카테고리**: ${results.queryAnalysis.category}\n`;
  //     formatted += `- **키워드**: ${results.queryAnalysis.keywords?.join(
  //       ", "
  //     )}\n`;
  //     formatted += `- **질문 유형**: ${results.queryAnalysis.questionType}\n\n`;
  //   }

  //   if (stages.includes("answerGeneration") && results.answerGeneration) {
  //     formatted += "### 💬 생성된 답변\n";
  //     formatted += `${results.answerGeneration.answer}\n\n`;
  //     if (results.answerGeneration.sources) {
  //       formatted += `*참조: ${results.answerGeneration.sources.join(
  //         ", "
  //       )}*\n\n`;
  //     }
  //   }

  //   if (stages.includes("confidenceCheck") && results.confidenceCheck) {
  //     formatted += "### 🛡️ 신뢰도 검사\n";
  //     formatted += `- **신뢰도**: ${(
  //       results.confidenceCheck.confidence * 100
  //     ).toFixed(1)}%\n`;
  //     formatted += `- **정확도**: ${results.confidenceCheck.accuracy}\n`;
  //     formatted += `- **자동응답 가능**: ${
  //       results.confidenceCheck.autoResponse ? "✅ 예" : "❌ 아니오"
  //     }\n`;
  //     formatted += `- **피드백**: ${results.confidenceCheck.feedback}\n`;
  //   }

  //   return formatted;
  // };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="max-w-5xl mx-auto h-[700px] flex flex-col">
        {/* 상단 설정 바 */}
        <div className="bg-white rounded-t-lg shadow-md p-4 border-b">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                챗봇 파이프라인 테스터
              </h2>
              <div className="text-xs text-gray-500">
                단계별 프롬프트 테스트 및 검증
              </div>
            </div>

            {/* 설정 컨트롤 */}
            <div className="flex items-center gap-4">
              {/* 모델 선택 */}
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 파이프라인 선택 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">테스트 범위:</span>
                <select
                  value={selectedPipeline}
                  onChange={(e) => setSelectedPipeline(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  {PIPELINE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <PipelineVisualization selected={selectedPipeline} />
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Bot className="w-12 h-12 mb-4" />
              <p className="text-lg">
                질문을 입력하면 선택한 파이프라인으로 테스트합니다
              </p>
              <p className="text-sm mt-2">
                현재 선택:{" "}
                {
                  PIPELINE_OPTIONS.find((p) => p.value === selectedPipeline)
                    ?.label
                }
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3xl ${
                    message.role === "user" ? "order-2" : "order-1"
                  }`}
                >
                  <div
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        message.role === "user" ? "bg-blue-500" : "bg-green-500"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                      {message.role === "assistant" &&
                        message.selectedPipeline && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>
                                파이프라인:{" "}
                                {
                                  PIPELINE_OPTIONS.find(
                                    (p) => p.value === message.selectedPipeline
                                  )?.label
                                }
                              </span>
                              <span>•</span>
                              <span>
                                모델:{" "}
                                {
                                  MODELS.find((m) => m.value === message.model)
                                    ?.label
                                }
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-green-500">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="bg-white border-t p-4 rounded-b-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              placeholder="질문을 입력하세요..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            선택된 프롬프트가 적용되어 단계별로 처리됩니다
          </div>
        </div>
      </div>
    </div>
  );
}
