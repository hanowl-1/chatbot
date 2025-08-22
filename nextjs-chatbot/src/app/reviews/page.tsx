// 임시 UI 페이지
"use client";

import PendingReviews from "@/components/PendingReviews";

import { useState, useEffect } from "react";
import {
  MessageSquareWarning,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter,
} from "lucide-react";

interface PendingReview {
  id: string;
  userQuestion: string;
  aiAnswer: string;
  confidence: number; // 0~1
  chatRoomId: string;
  chatRoomName: string;
  timestamp: Date;
  status: "pending" | "reviewed" | "resolved";
  reviewedBy?: string;
  reviewedAt?: Date;
}

// 더미 데이터 (API 개발 전)
const DUMMY_DATA: PendingReview[] = [
  {
    id: "1",
    userQuestion: "매장 광고 진행하고 싶은데 어떻게 시작하나요?",
    aiAnswer:
      "슈퍼멤버스 플랫폼에 회원가입 후 매장 정보를 등록하시면 광고를 시작하실 수 있습니다.",
    confidence: 0.45,
    chatRoomId: "kakao_room_123",
    chatRoomName: "고객상담방 A",
    timestamp: new Date("2024-01-20T10:30:00"),
    status: "pending",
  },
  {
    id: "2",
    userQuestion: "환급금은 언제 받을 수 있나요?",
    aiAnswer: "리뷰 작성 후 검수가 완료되면 영업일 기준 3-5일 내에 환급됩니다.",
    confidence: 0.62,
    chatRoomId: "kakao_room_456",
    chatRoomName: "고객상담방 B",
    timestamp: new Date("2024-01-20T11:15:00"),
    status: "pending",
  },
  {
    id: "3",
    userQuestion: "블로거 등급은 어떻게 올리나요?",
    aiAnswer: "죄송합니다. 해당 질문에 대한 명확한 답변을 찾을 수 없습니다.",
    confidence: 0.25,
    chatRoomId: "kakao_room_789",
    chatRoomName: "고객상담방 C",
    timestamp: new Date("2024-01-20T09:45:00"),
    status: "reviewed",
    reviewedBy: "운영자1",
    reviewedAt: new Date("2024-01-20T10:00:00"),
  },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<PendingReview[]>(DUMMY_DATA);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">(
    "pending"
  );
  const [loading, setLoading] = useState(false);

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

  // 상태 변경
  const updateStatus = (id: string, status: "reviewed" | "resolved") => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? {
              ...review,
              status,
              reviewedBy: "현재 운영자",
              reviewedAt: new Date(),
            }
          : review
      )
    );
  };

  // 필터링된 리뷰
  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    return review.status === filter;
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

        {/* 필터 탭 */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-gray-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            전체 ({reviews.length})
          </button>
          <button
            onClick={() => setFilter("reviewed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "reviewed"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            검토 완료 ({reviews.filter((r) => r.status === "reviewed").length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "pending"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            대기 중 ({reviews.filter((r) => r.status === "pending").length})
          </button>
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
            검토 대기 중인 질문이 없습니다
          </div>
        ) : (
          filteredReviews.map((review) => {
            const confidenceLevel = getConfidenceLevel(review.confidence);
            const ConfidenceIcon = confidenceLevel.icon;

            return (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* 상단 정보 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getConfidenceColor(
                          review.confidence
                        )}`}
                      >
                        <ConfidenceIcon className="w-4 h-4" />
                        신뢰도 {confidenceLevel.label} (
                        {(review.confidence * 100).toFixed(0)}%)
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(review.timestamp).toLocaleString("ko-KR")}
                      </span>
                    </div>
                    {review.status === "pending" ? (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        검토 필요
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        검토 완료
                      </span>
                    )}
                  </div>

                  {/* 질문과 답변 */}
                  <div className="space-y-3 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        유저 질문
                      </p>
                      <p className="text-gray-800">{review.userQuestion}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        AI 답변
                      </p>
                      <p className="text-gray-800">{review.aiAnswer}</p>
                    </div>
                  </div>

                  {/* 하단 액션 */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">채팅방:</span>
                      <span>{review.chatRoomName}</span>
                      {review.reviewedBy && (
                        <>
                          <span className="text-gray-400">|</span>
                          <span>검토자: {review.reviewedBy}</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {review.status === "pending" && (
                        <button
                          onClick={() => updateStatus(review.id, "reviewed")}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                        >
                          검토 완료
                        </button>
                      )}
                      <button
                        onClick={() => openKakaoChat(review.chatRoomId)}
                        className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-1 text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        카카오톡 열기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 통계 요약 */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">통계 요약</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-500">
              {reviews.filter((r) => r.status === "pending").length}
            </p>
            <p className="text-sm text-gray-600">검토 대기</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">
              {reviews.filter((r) => r.status === "reviewed").length}
            </p>
            <p className="text-sm text-gray-600">검토 완료</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">
              {reviews.filter((r) => r.confidence < 0.4).length}
            </p>
            <p className="text-sm text-gray-600">낮은 신뢰도</p>
          </div>
        </div>
      </div>
    </div>
  );
}
