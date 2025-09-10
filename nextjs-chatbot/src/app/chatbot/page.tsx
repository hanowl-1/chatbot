"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, Settings2 } from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import {
  PIPELINE_OPTIONS,
  PipelineVisualization,
} from "@/components/chatbot/PipelineVisualization";
import { MODELS } from "@/constants/model";
import { Message } from "@/types/chat";
import { useAtom } from "jotai";
import { chatMessagesAtom, promptsAtom } from "@/lib/atoms";

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);
  const [selectedPipeline, setSelectedPipeline] = useState(
    PIPELINE_OPTIONS[0].value
  );
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useAtom(promptsAtom);

  const [messages, setMessages] = useAtom(chatMessagesAtom);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 프롬프트 가져오기
  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts");
      const data = await response.json();

      if (data) {
        setPrompts({
          // analyze_query: data.analyze_query || "",
          analyze_query: "",
          refine_question: data.refine_question || "",
          generate_answer: data.generate_answer || "",
          assess_confidence: data.assess_confidence || "",
          // generate_final_answer: data.generate_final_answer || "",
          generate_final_answer: "",
          system: data.system || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    }
  };

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
      // API 호출 - 최종 답변일 때는 scope 필드 제외
      const requestBody: any = {
        question: input,
        embedding_count: 3,
        // analyze_query_prompt: prompts.analyze_query,
        refine_question_prompt: prompts.refine_question,
        generate_answer_prompt: prompts.generate_answer,
        assess_confidence_prompt: prompts.assess_confidence,
        // generate_final_answer_prompt: prompts.generate_final_answer,
        system_prompt: prompts.system,
        model: selectedModel,
      };

      // 최종 답변이 아닐 때만 scope 추가
      if (selectedPipeline !== "all") {
        requestBody.scope = selectedPipeline;
      }

      const data = await fetchInstance(`/qa/rag-test/v2`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      // 결과 메시지 생성
      let content = "답변을 생성할 수 없습니다.";

      // 파이프라인에 따라 적절한 응답 선택
      // 질의분석 주석처리
      // if (selectedPipeline === "analyze_query" && data.query_analysis) {
      //   // query_analysis가 객체인 경우 JSON 문자열로 변환
      //   content =
      //     typeof data.query_analysis === "object"
      //       ? JSON.stringify(data.query_analysis, null, 2)
      //       : data.query_analysis;
      // } else if (
      if (selectedPipeline === "refine_question" && data.refined_question) {
        content = data.refined_question;
      } else if (
        selectedPipeline === "generate_answer" &&
        data.raw_generated_answer
      ) {
        content = data.raw_generated_answer;
      } else if (
        selectedPipeline === "assess_confidence" &&
        data.confidence_assessment
      ) {
        content =
          typeof data.confidence_assessment === "object"
            ? JSON.stringify(data.confidence_assessment, null, 2)
            : data.confidence_assessment;
      }
      // 최종답변 주석처리
      // else if (selectedPipeline === "all" && data.final_answer) {
      //   content = data.final_answer;
      // }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content,
        model: selectedModel,
        timestamp: new Date(),
        selectedPipeline,
        referencedVectors: data.referenced_vectors,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `오류가 발생했습니다 : ${error}`,
        model: selectedModel,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

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
                        message.role === "user"
                          ? "bg-blue-500"
                          : message.role === "system"
                          ? "bg-gray-500"
                          : "bg-green-500"
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
                          : message.role === "system"
                          ? "bg-gray-100 border border-gray-300"
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
                      {message.role === "assistant" &&
                        message.referencedVectors &&
                        message.referencedVectors.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-600 mb-2">
                              참조된 FAQ (유사도 높은 순):
                            </div>
                            <div className="space-y-2">
                              {message.referencedVectors.map(
                                (vector: any, index: number) => (
                                  <button
                                    key={vector.qa_id}
                                    onClick={() => {
                                      const detailMessage: Message = {
                                        id: Date.now().toString(),
                                        role: "system",
                                        content: `📌 QA_ID #${
                                          vector.qa_id
                                        } 상세 정보\n\n❓ 질문:\n${
                                          vector.question
                                        }\n\n💬 답변:\n${
                                          vector.answer
                                        }\n\n📊 유사도: ${(
                                          vector.similarity_score * 100
                                        ).toFixed(1)}%`,
                                        timestamp: new Date(),
                                      };
                                      setMessages((prev) => [
                                        ...prev,
                                        detailMessage,
                                      ]);
                                    }}
                                    className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-700 truncate flex-1">
                                        {index + 1}. {vector.question}
                                      </span>
                                      <span className="text-xs text-gray-500 ml-2">
                                        {(
                                          vector.similarity_score * 100
                                        ).toFixed(1)}
                                        %
                                      </span>
                                    </div>
                                  </button>
                                )
                              )}
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
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
              className="flex-1 p-2 border rounded-lg resize-none"
              rows={3}
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
