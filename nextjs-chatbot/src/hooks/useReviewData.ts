import { useState, useEffect, useCallback } from "react";
import { fetchInstance } from "@/lib/fetchInstance";
import { PendingReview, ReviewTabType } from "@/types/review";

interface UseReviewDataProps {
  activeTab: ReviewTabType;
  page: number;
  isHidden: boolean;
  startTs?: number;
  endTs?: number;
}

export function useReviewData({
  activeTab,
  page,
  isHidden,
  startTs,
  endTs,
}: UseReviewDataProps) {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // useCallback을 사용하되, setState 함수들은 안정적이므로 의존성 불필요
  const fetchReviewData = async (
    currentTab: ReviewTabType,
    currentPage: number,
    size: number = 5
  ) => {
    setLoading(true);
    try {
      const isConfirmed = currentTab === "confirmed";

      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams({
        has_assignee: "false",
        requires_confirmation: "true",
        has_slash_in_name: "true",
        is_confirmed: isConfirmed.toString(),
        page: currentPage.toString(),
        size: size.toString(),
        is_hidden: (isHidden && isConfirmed).toString(),
      });

      // timestamp 파라미터 추가 (값이 있을 때만)
      if (startTs) queryParams.append("start_ts", startTs.toString());
      if (endTs) queryParams.append("end_ts", endTs.toString());

      const data = await fetchInstance(
        `/chatrooms/answers?${queryParams.toString()}`
      );

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

  useEffect(() => {
    fetchReviewData(activeTab, 1);
  }, [activeTab, isHidden, startTs, endTs]);

  // 페이지 변경 시
  useEffect(() => {
    if (page > 1) {
      fetchReviewData(activeTab, page);
    }
  }, [page, activeTab, isHidden, startTs, endTs]);

  const refreshData = useCallback(async () => {
    await fetchReviewData(activeTab, page);
  }, [activeTab, page, isHidden, startTs, endTs]); // timestamp도 의존성에 포함

  return {
    reviews,
    loading,
    totalPages,
    totalItems,
    refreshData,
  };
}
