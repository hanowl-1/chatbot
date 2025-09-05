import { useState, useEffect } from "react";
import { PendingReview } from "@/types/review";
import {
  Clock,
  Bot,
  ExternalLink,
  MessageSquareWarning,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  Loader2,
} from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import { ReviewChatDialog } from "@/types/review";
import { CHANNEL_ID } from "@/constants/channel";

interface ReviewItemProps {
  filteredReview: PendingReview;
  activeTab: "waiting" | "confirmed";
  openConfirmModal: (reviewId: number, modalType: "ai" | "manual") => void;
}

export default function ReviewItem({
  filteredReview,
  activeTab,
  openConfirmModal,
}: ReviewItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatDialogs, setChatDialogs] = useState<ReviewChatDialog[]>([]);
  const [loadingDialogs, setLoadingDialogs] = useState(true);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // 채팅 대화 내역 가져오기
  useEffect(() => {
    if (isExpanded && chatDialogs.length === 0) {
      fetchChatDialogs();
    }
  }, [isExpanded]);

  const fetchChatDialogs = async () => {
    setLoadingDialogs(true);
    setDialogError(null);

    try {
      const result = await fetchInstance(
        `/chatrooms/${filteredReview.chatroom_id}/dialogs?chat_dialog_id=${filteredReview.chat_dialog_id}&dialog_length=15`
      );
      //   console.log("Chat dialogs:", result.messages);

      setChatDialogs(result.messages);
    } catch (error) {
      console.error("Failed to fetch chat dialogs:", error);
      setDialogError("채팅 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoadingDialogs(false);
    }
  };
  // 신뢰도 색상
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return "text-green-600 bg-green-50";
    if (confidence >= 0.4) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  // 카카오톡 채팅방으로 이동
  const openKakaoChat = (chatRoomId: number) => {
    console.log(`Opening KakaoTalk room: ${chatRoomId}`);
    window.open(
      ` https://center-pf.kakao.com/${CHANNEL_ID["희다"]}/chats/${chatRoomId}`,
      "kakao_admin_center",
      "width=1000,height=800"
    );
    // alert(`카카오톡 채팅방 ${chatRoomId}로 이동 (개발 중)`);
  };

  // 신뢰도 레벨
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.7) return { label: "높음", icon: CheckCircle };
    if (confidence >= 0.4) return { label: "중간", icon: AlertTriangle };
    return { label: "낮음", icon: MessageSquareWarning };
  };

  const confidenceLevel = getConfidenceLevel(filteredReview.confidence);
  const ConfidenceIcon = confidenceLevel.icon;

  return (
    <div
      key={filteredReview.id}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4"
    >
      {/* 첫번째 줄 - 헤더 정보 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* 신뢰도 배지 */}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getConfidenceColor(
              filteredReview.confidence
            )}`}
          >
            <ConfidenceIcon className="w-3 h-3" />
            {(filteredReview.confidence * 100).toFixed(0)}%
          </span>

          {/* 채팅방 정보 */}
          <span className="text-xs text-gray-500">
            {filteredReview.chatroom_name}
          </span>

          {/* 시간 */}
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(filteredReview.created_at).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex items-center gap-2">
          {activeTab === "waiting" && (
            <>
              {/* AI 답변 전송 버튼 */}
              <button
                onClick={() => openConfirmModal(filteredReview.id, "ai")}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center gap-1"
                title="AI 답변을 전송하고 검증완료"
              >
                <Bot className="w-3 h-3" />
                AI 답변후 검증완료
              </button>

              {/* 수동 검증완료 버튼 */}
              <button
                onClick={() => openConfirmModal(filteredReview.id, "manual")}
                className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                title="AI 답변 없이 검증만 완료 (CX팀 직접 응대)"
              >
                즉시 검증완료
              </button>
            </>
          )}

          <button
            onClick={() => openKakaoChat(filteredReview.chatroom_id)}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            카톡
          </button>
        </div>
      </div>

      {/* 두번째 줄 - 유저 질문 */}
      {/* <div className="mb-2 px-2">
        <div className="flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">유저 질문</p>
            <p className="text-sm text-gray-800 line-clamp-2">
              {review.userQuestion}
            </p>
          </div>
        </div>
      </div> */}

      {/* 세번째 줄 - AI 답변 */}
      <div className="px-2">
        <div className="flex items-start gap-2">
          <Bot className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">AI 답변</p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {filteredReview.generated_answer}
            </p>
          </div>
        </div>
      </div>

      {/* 채팅 내역 펼치기/접기 버튼 */}
      <div className="px-2 mt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span>채팅 내역 {isExpanded ? "접기" : "보기"}</span>
        </button>
      </div>

      {/* 펼쳐진 채팅 내역 */}
      {isExpanded && (
        <div className="mt-3 mx-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {loadingDialogs ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">
                채팅 내역 불러오는 중...
              </span>
            </div>
          ) : dialogError ? (
            <div className="text-sm text-red-600 text-center py-2">
              {dialogError}
            </div>
          ) : chatDialogs.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {chatDialogs.map((dialog) => (
                <div
                  key={dialog.id}
                  className={`flex gap-2 ${
                    dialog.sender_type === "0" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${
                      dialog.sender_type === "0"
                        ? "flex-row"
                        : "flex-row-reverse"
                    }`}
                  >
                    {dialog.sender_type === "0" ? (
                      <User className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                    )}
                    <div
                      className={`p-2 rounded-lg text-sm ${
                        dialog.sender_type === "0"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-white border border-gray-200 text-gray-800"
                      }`}
                    >
                      {dialog.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-2">
              대화 내역이 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
}
