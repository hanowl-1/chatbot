// 임시 UI 페이지
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MessageSquareWarning } from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import Loading from "@/components/common/Loading";
import ConfirmModal from "@/components/reviews/ConfirmModal";
import Pagination from "@/components/common/Pagination";
import ReviewItem from "@/components/reviews/ReviewItem";
import UpdateNotification from "@/components/reviews/UpdateNotification";
import { PendingReview } from "@/types/review";
import ReviewHeader from "@/components/reviews/ReviewHeader";
import { useUpdateChecker } from "@/hooks/useUpdateChecker";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [activeTab, setActiveTab] = useState<"confirmed" | "waiting">(
    "waiting"
  );

  // 폴링 토글 상태
  const [pollingEnabled, setPollingEnabled] = useState(true);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(
    null
  );
  const [modalType, setModalType] = useState<"ai" | "manual">("manual");

  // 현재 리뷰의 최대 ID 계산
  const currentMaxId = useMemo(() => {
    if (reviews.length === 0) return null;
    return Math.max(...reviews.map((review) => review.id));
  }, [reviews]);

  // 업데이트 콜백 - useCallback으로 메모이제이션
  const handleUpdate = useCallback((latestId: number) => {
    console.log("New updates detected! Latest ID:", latestId);
  }, []);

  // 업데이트 체크 훅
  const { updateCount, isChecking, resetUpdates } = useUpdateChecker({
    currentMaxId,
    currentReviewCount: activeTab === "waiting" ? totalItems : 0, // waiting 탭의 전체 아이템 개수
    interval: 60000,
    enabled: activeTab === "waiting" && pollingEnabled, // waiting 탭이면서 폴링이 활성화된 경우만
    onUpdate: handleUpdate,
  });

  const fetchReviewData = async (
    currentTab: "waiting" | "confirmed" = activeTab,
    currentPage: number = page,
    size: number = 5
  ) => {
    setLoading(true);
    try {
      // 탭에 따라 다른 API 호출
      const isConfirmed = currentTab === "confirmed";
      const data = await fetchInstance(
        `/chatrooms/answers?requires_confirmation=true&is_confirmed=${isConfirmed}&page=${currentPage}&size=${size}`
      );

      // console.log(`API Response (${currentTab}):`, data);
      setReviews(data.data || []);
      setTotalItems(data.pagination?.total_items || 0);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setReviews([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // API 데이터 불러오기 - 탭 변경 시에도 호출
  useEffect(() => {
    setPage(1); // 탭 변경 시 첫 페이지로
    fetchReviewData(activeTab, 1);
  }, [activeTab]);

  // 페이지 변경 시 데이터 불러오기
  useEffect(() => {
    fetchReviewData(activeTab, page);
  }, [page]);

  // AI 답변 전송 모달 열기
  const openAIConfirmModal = (reviewId: number) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (review) {
      setSelectedReviewId(reviewId);
      setSelectedReview(review);
      setModalType("ai");
      setIsModalOpen(true);
    }
  };

  // 수동 검증완료 모달 열기
  const openManualConfirmModal = (reviewId: number) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (review) {
      setSelectedReviewId(reviewId);
      setSelectedReview(review);
      setModalType("manual");
      setIsModalOpen(true);
    }
  };

  // 데이터 새로고침
  const refreshData = async () => {
    await fetchReviewData(activeTab, page);
    resetUpdates(); // 업데이트 상태 리셋
  };

  // 모달에서 확인 후 API 호출
  const handleConfirmReview = async () => {
    if (!selectedReviewId) return;

    try {
      let result;
      if (modalType === "ai") {
        // AI 답변 전송 승인 API 호출
        result = await fetchInstance(
          `/chatrooms/answers/${selectedReviewId}/approve`,
          { method: "POST" }
        );
      } else {
        // 수동 검증완료 API 호출
        result = await fetchInstance(
          `/chatrooms/answers/${selectedReviewId}/reject`,
          { method: "POST" }
        );
      }

      await refreshData();

      // 모달 닫기
      setIsModalOpen(false);
      setSelectedReviewId(null);
      setSelectedReview(null);
    } catch (error) {
      console.error("Failed to update review status:", error);
      alert("검증 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <ReviewHeader
        loading={loading}
        refreshData={refreshData}
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as "confirmed" | "waiting")}
        totalItems={totalItems}
        pollingEnabled={pollingEnabled}
        setPollingEnabled={setPollingEnabled}
      />

      {/* 업데이트 알림 */}
      {activeTab === "waiting" && (
        <UpdateNotification
          updateCount={updateCount}
          onRefresh={refreshData}
          isLoading={loading || isChecking}
        />
      )}

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {loading ? (
          <Loading
            size="lg"
            text="검토 대기 질문을 불러오는 중..."
            className="py-12"
          />
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            <MessageSquareWarning className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            {activeTab === "waiting"
              ? "검토 대기 중인 질문이 없습니다"
              : "검토 완료된 질문이 없습니다"}
          </div>
        ) : (
          reviews.map((filteredReview) => {
            return (
              <ReviewItem
                key={filteredReview.id}
                filteredReview={filteredReview}
                activeTab={activeTab}
                openAIConfirmModal={openAIConfirmModal}
                openManualConfirmModal={openManualConfirmModal}
              />
            );
          })
        )}
      </div>

      {/* 페이지네이션 */}
      {!loading && (
        <div className="mt-6 bg-white rounded-lg shadow-sm">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            // onPageSizeChange={(newSize) => {
            //   // setSize(newSize);
            //   // setPage(1); // 페이지 크기 변경 시 1페이지로 이동
            // }}
            totalItems={totalItems}
            // pageSizeOptions={[5, 10, 20]}
          />
        </div>
      )}

      {/* 확인 모달 */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReviewId(null);
          setSelectedReview(null);
          setModalType("manual");
        }}
        onConfirm={handleConfirmReview}
        title={modalType === "ai" ? "AI 답변 전송 확인" : "검증 완료 확인"}
        message={
          modalType === "ai"
            ? "AI 답변을 전송하고 검증을 완료하시겠습니까?"
            : "AI 답변 없이 검증만 완료하시겠습니까? (CX팀이 직접 응대합니다)"
        }
        confirmText="확인"
        cancelText="취소"
        variant={modalType === "ai" ? "info" : "success"}
      />
    </div>
  );
}
