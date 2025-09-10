"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquareWarning } from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import Loading from "@/components/common/Loading";
import ConfirmModal from "@/components/reviews/ConfirmModal";
import Pagination from "@/components/common/Pagination";
import ReviewItem from "@/components/reviews/ReviewItem";
import UpdateNotification from "@/components/reviews/UpdateNotification";
import { ReviewTabType } from "@/types/review";
import ReviewHeader from "@/components/reviews/ReviewHeader";
import { useUpdateChecker } from "@/hooks/useUpdateChecker";
import { useReviewData } from "@/hooks/useReviewData";
import {
  POLLING_INTERVAL,
  MODAL_MESSAGES,
  TAB_MESSAGES,
} from "@/constants/review";

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<ReviewTabType>("waiting");
  const [pollingEnabled, setPollingEnabled] = useState(true);

  const { reviews, loading, totalPages, totalItems, refreshData } =
    useReviewData({
      activeTab,
      page,
    });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<"ai" | "manual">("manual");

  // 업데이트 체크 훅
  const { updateCount, isChecking, resetUpdates } = useUpdateChecker({
    currentReviewCount: totalItems,
    interval: POLLING_INTERVAL,
    enabled: activeTab === "waiting" && pollingEnabled,
  });

  // 탭 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // 모달 열기
  const openConfirmModal = useCallback(
    (reviewId: number, modalType: "ai" | "manual") => {
      const review = reviews.find((r) => r.id === reviewId);
      if (review) {
        setSelectedReviewId(reviewId);
        setModalType(modalType);
        setIsModalOpen(true);
      }
    },
    [reviews]
  );

  const handleRefreshData = useCallback(async () => {
    await refreshData();
    resetUpdates();
  }, [refreshData, resetUpdates]);

  const resetModalState = useCallback(() => {
    setIsModalOpen(false);
    setSelectedReviewId(null);
    setModalType("manual");
  }, []);

  const handleConfirmReview = async () => {
    if (!selectedReviewId) return;

    try {
      if (modalType === "ai") {
        // AI 답변 전송 승인 API 호출
        await fetchInstance(`/chatrooms/answers/${selectedReviewId}/approve`, {
          method: "POST",
        });
      } else {
        // 수동 검증완료 API 호출
        await fetchInstance(`/chatrooms/answers/${selectedReviewId}/reject`, {
          method: "POST",
        });
      }
      await handleRefreshData();
      resetModalState();
    } catch (error) {
      console.error("Failed to update review status:", error);
      // TODO:" TOAST로 대체해도 좋을듯
      // alert("검증 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <ReviewHeader
        loading={loading}
        refreshData={handleRefreshData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalItems={totalItems}
        pollingEnabled={pollingEnabled}
        setPollingEnabled={setPollingEnabled}
      />

      {/* 업데이트 알림 */}
      {activeTab === "waiting" && (
        <UpdateNotification
          updateCount={updateCount}
          onRefresh={handleRefreshData}
          isLoading={loading || isChecking}
        />
      )}

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {loading ? (
          <Loading
            size="lg"
            text={TAB_MESSAGES[activeTab].loadingText}
            className="py-12"
          />
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            <MessageSquareWarning className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            {TAB_MESSAGES[activeTab].empty}
          </div>
        ) : (
          reviews.map((filteredReview) => {
            return (
              <ReviewItem
                key={filteredReview.id}
                filteredReview={filteredReview}
                activeTab={activeTab}
                openConfirmModal={openConfirmModal}
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
        onClose={resetModalState}
        onConfirm={handleConfirmReview}
        title={MODAL_MESSAGES[modalType].title}
        message={MODAL_MESSAGES[modalType].message}
        confirmText="확인"
        cancelText="취소"
        variant={MODAL_MESSAGES[modalType].variant}
      />
    </div>
  );
}
