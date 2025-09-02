// 임시 UI 페이지
"use client";

import { useState } from "react";
import {
  MessageSquareWarning,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  MessageSquare,
  Bot,
} from "lucide-react";
import { DUMMY_DATA, PendingReview } from "@/mock/review";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<PendingReview[]>(DUMMY_DATA);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending"
  );

  // 신뢰도에 따른 색상
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return "text-green-600 bg-green-50";
    if (confidence >= 0.4) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  // 신뢰도 레벨
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.7) return { label: "높음", icon: CheckCircle };
    if (confidence >= 0.4) return { label: "중간", icon: AlertTriangle };
    return { label: "낮음", icon: MessageSquareWarning };
  };

  // 카카오톡 채팅방으로 이동
  const openKakaoChat = (chatRoomId: string) => {
    // 실제로는 카카오톡 딥링크나 웹 어드민 URL로 연결
    console.log(`Opening KakaoTalk room: ${chatRoomId}`);
    // window.open(`kakaotalk://...${chatRoomId}`, '_blank');
    alert(`카카오톡 채팅방 ${chatRoomId}로 이동 (개발 중)`);
  };

  // AI 답변 전송 토글 변경
  const toggleShouldSendAiAnswer = (id: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? {
              ...review,
              shouldSendAiAnswer: !review.shouldSendAiAnswer,
            }
          : review
      )
    );
  };

  // 상태 변경 - 검토 완료시 status를 reviewed로 변경
  const updateStatus = (id: string) => {
    const review = reviews.find((r) => r.id === id);
    if (review?.shouldSendAiAnswer) {
      console.log(`AI 답변 전송: ${review.aiAnswer}`);
    } else {
      console.log("CX팀이 직접 응대했습니다.");
    }

    setReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? {
              ...review,
              status: "reviewed" as const,
              reviewedBy: "운영자",
              reviewedAt: new Date(),
              shouldSendAiAnswer: false, // 전송 후 다시 false로 초기화
            }
          : review
      )
    );
  };

  // 탭에 따른 필터링
  const filteredReviews = reviews.filter((review) => {
    if (activeTab === "pending") {
      return review.status === "pending" && review.confidence < 0.7;
    } else {
      return review.status === "reviewed" || review.status === "resolved";
    }
  });

  // 데이터 새로고침 (API 연동 시 사용)
  const refreshData = async () => {
    setLoading(true);
    try {
      // const response = await fetch("/api/pending-reviews");
      // const data = await response.json();
      // setReviews(data);

      // 현재는 더미 데이터 사용
      setTimeout(() => {
        setReviews([...DUMMY_DATA]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquareWarning className="w-6 h-6 text-orange-500" />
              검증 대기 질문
            </h2>
            <p className="text-gray-600 mt-1">
              신뢰도가 낮은 AI 답변을 검토하고 직접 응답해주세요
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            검토대기
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "completed"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            검토완료
          </button>
        </div>

        {/* 현재 탭 개수 표시 */}
        <div className="mt-4 text-sm text-gray-600">
          {activeTab === "pending" ? (
            <>
              신뢰도 낮은 대기 항목:{" "}
              <span className="font-bold text-orange-600">
                {filteredReviews.length}개
              </span>
            </>
          ) : (
            <>
              검토 완료된 항목:{" "}
              <span className="font-bold text-green-600">
                {filteredReviews.length}개
              </span>
            </>
          )}
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            <MessageSquareWarning className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            {activeTab === "pending"
              ? "검토 대기 중인 질문이 없습니다"
              : "검토 완료된 질문이 없습니다"}
          </div>
        ) : (
          filteredReviews.map((review) => {
            const confidenceLevel = getConfidenceLevel(review.confidence);
            const ConfidenceIcon = confidenceLevel.icon;

            return (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4"
              >
                {/* 첫번째 줄 - 헤더 정보 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* 신뢰도 배지 */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getConfidenceColor(
                        review.confidence
                      )}`}
                    >
                      <ConfidenceIcon className="w-3 h-3" />
                      {(review.confidence * 100).toFixed(0)}%
                    </span>

                    {/* 채팅방 정보 */}
                    <span className="text-xs text-gray-500">
                      {review.chatRoomName}
                    </span>

                    {/* 시간 */}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(review.timestamp).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* 액션 버튼 그룹 */}
                  <div className="flex items-center gap-2">
                    {activeTab === "pending" && (
                      /* AI 답변 전송 토글 */
                      <label
                        className="flex items-center cursor-pointer mr-2 relative group"
                        title={
                          review.shouldSendAiAnswer
                            ? "활성화: 검토완료 시 AI 답변이 유저에게 전송됩니다"
                            : "비활성화: 검토완료 시 AI 답변이 전송되지 않습니다 (CX팀 직접 응대시)"
                        }
                      >
                        <input
                          type="checkbox"
                          checked={review.shouldSendAiAnswer || false}
                          onChange={() => toggleShouldSendAiAnswer(review.id)}
                          className="sr-only"
                        />
                        <div
                          className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
                            review.shouldSendAiAnswer
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                              review.shouldSendAiAnswer
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                        <span className="ml-1.5 text-xs text-gray-600">
                          AI 답변
                        </span>

                        {/* 호버 시 나타나는 툴팁 */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                          {review.shouldSendAiAnswer
                            ? "✓ AI 답변을 유저에게 전송시"
                            : "✗ CX팀이 직접 응대시"}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      </label>
                    )}

                    {activeTab === "pending" && (
                      <button
                        onClick={() => updateStatus(review.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                      >
                        검토완료
                      </button>
                    )}

                    <button
                      onClick={() => openKakaoChat(review.chatRoomId)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      카톡
                    </button>
                  </div>
                </div>

                {/* 두번째 줄 - 유저 질문 */}
                <div className="mb-2 px-2">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">유저 질문</p>
                      <p className="text-sm text-gray-800 line-clamp-2">
                        {review.userQuestion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 세번째 줄 - AI 답변 */}
                <div className="px-2">
                  <div className="flex items-start gap-2">
                    <Bot className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">AI 답변</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {review.aiAnswer}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 검토완료 탭에서 검토자 정보 표시 */}
                {activeTab === "completed" && review.reviewedBy && (
                  <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                    검토자: {review.reviewedBy} |
                    {review.reviewedAt &&
                      new Date(review.reviewedAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
