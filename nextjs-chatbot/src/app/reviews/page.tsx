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
import DateTimeFilter, {
  DateTimeFilterValue,
} from "@/components/reviews/DateTimeFilter";
import {
  POLLING_INTERVAL,
  MODAL_MESSAGES,
  TAB_MESSAGES,
} from "@/constants/review";

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<ReviewTabType>("waiting");
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  // 선택된 답변 IDs 관리 (검증완료 탭에서만 사용)
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<number[]>([]);

  // 날짜/시간 필터 상태
  const [dateFilter, setDateFilter] = useState<DateTimeFilterValue>({
    startDate: null,
    endDate: null,
    mode: "range",
  });

  // Date 객체를 Unix timestamp로 변환
  const dateToUnixTimestamp = useCallback(
    (date: Date | null): number | undefined => {
      return date ? Math.floor(date.getTime() / 1000) : undefined;
    },
    []
  );

  // 현재 날짜 필터에서 timestamp 추출
  const startTs = dateToUnixTimestamp(
    dateFilter.mode === "before" ? null : dateFilter.startDate
  );
  const endTs = dateToUnixTimestamp(
    dateFilter.mode === "after" ? null : dateFilter.endDate
  );

  const { reviews, loading, totalPages, totalItems, refreshData } =
    useReviewData({
      activeTab,
      page,
      isHidden,
      startTs,
      endTs,
    });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<"ai" | "manual">("manual");

  const hasDateFilter = dateFilter.startDate || dateFilter.endDate;

  // 업데이트 체크 훅
  const { updateCount, isChecking, resetUpdates } = useUpdateChecker({
    currentReviewCount: totalItems,
    interval: POLLING_INTERVAL,
    enabled: activeTab === "waiting" && pollingEnabled && !hasDateFilter,
  });

  // 탭 변경 시 페이지 리셋 및 선택 항목 초기화
  useEffect(() => {
    setPage(1);
    setSelectedAnswerIds([]); // 탭 변경시 선택 항목 초기화
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

  // 개별 항목 선택/해제
  const toggleAnswerSelection = useCallback((answerId: number) => {
    setSelectedAnswerIds((prev) =>
      prev.includes(answerId)
        ? prev.filter((id) => id !== answerId)
        : [...prev, answerId]
    );
  }, []);

  // 전체 선택/해제
  const toggleAllSelection = useCallback(() => {
    if (selectedAnswerIds.length === reviews.length) {
      setSelectedAnswerIds([]); // 전체 해제
    } else {
      setSelectedAnswerIds(reviews.map((review) => review.id)); // 전체 선택
    }
  }, [selectedAnswerIds.length, reviews]);

  // 전체 선택 상태 확인
  const isAllSelected =
    reviews.length > 0 && selectedAnswerIds.length === reviews.length;
  const isPartiallySelected =
    selectedAnswerIds.length > 0 && selectedAnswerIds.length < reviews.length;

  // 일괄 노출여부 변경 함수
  const handleBulkVisibilityChange = useCallback(
    async (isHidden: boolean) => {
      if (selectedAnswerIds.length === 0) {
        alert("변경할 항목을 선택해주세요.");
        return;
      }

      try {
        const response = await fetchInstance("/chatrooms/answers/visibility", {
          method: "PATCH",
          body: JSON.stringify({
            answer_ids: selectedAnswerIds,
            is_hidden: isHidden,
          }),
        });

        if (response.ok) {
          setSelectedAnswerIds([]);
          refreshData();
          alert(
            `${selectedAnswerIds.length}개 항목의 노출여부가 변경되었습니다.`
          );
        } else {
          throw new Error("노출여부 변경에 실패했습니다.");
        }
      } catch (error) {
        console.error("노출여부 변경 오류:", error);
        alert("노출여부 변경에 실패했습니다. 다시 시도해주세요.");
      }
    },
    [selectedAnswerIds, refreshData]
  );

  // 날짜 필터 초기화 함수
  const handleDateFilterClear = useCallback(() => {
    setDateFilter({
      startDate: null,
      endDate: null,
      mode: "range",
    });
    setPage(1); // 페이지도 1로 초기화
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

      {/* 날짜/시간 필터 */}
      <DateTimeFilter
        value={dateFilter}
        onChange={setDateFilter}
        onClear={handleDateFilterClear}
      />

      {/* 검증완료 탭에서 필터 및 일괄 처리 */}
      {activeTab === "confirmed" && (
        <div className="space-y-4">
          <div className="mb-4 bg-white rounded-lg shadow-sm p-4 space-y-4">
            {/* 숨김/보이기 필터 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                숨김 처리된 항목만 보기
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHidden}
                  onChange={() => setIsHidden(!isHidden)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {isHidden ? "ON" : "OFF"}
                </span>
              </label>
            </div>

            {/* 일괄 선택 및 처리 */}
            {!loading && reviews.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 전체 선택 체크박스 */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isPartiallySelected;
                        }}
                        onChange={toggleAllSelection}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        전체 선택 ({selectedAnswerIds.length}/{reviews.length})
                      </span>
                    </label>
                  </div>

                  {/* 일괄 처리 버튼들 */}
                  {selectedAnswerIds.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBulkVisibilityChange(true)}
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        선택 항목 숨기기
                      </button>
                      <button
                        onClick={() => handleBulkVisibilityChange(false)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        선택 항목 보이기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
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
                // 검증완료 탭에서만 선택 기능 활성화
                isSelected={
                  activeTab === "confirmed"
                    ? selectedAnswerIds.includes(filteredReview.id)
                    : undefined
                }
                onToggleSelect={
                  activeTab === "confirmed"
                    ? () => toggleAnswerSelection(filteredReview.id)
                    : undefined
                }
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
