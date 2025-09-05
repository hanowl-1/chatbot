import { useState, useEffect, useCallback } from "react";
import { fetchInstance } from "@/lib/fetchInstance";
import { PendingReview, ReviewTabType } from "@/types/review";

interface UseReviewDataProps {
  activeTab: ReviewTabType;
  page: number;
}

export function useReviewData({ activeTab, page }: UseReviewDataProps) {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchReviewData = useCallback(
    async (
      currentTab: ReviewTabType,
      currentPage: number,
      size: number = 5
    ) => {
      setLoading(true);
      try {
        const isConfirmed = currentTab === "confirmed";
        // 슬래시 필터링 쿼리 파라미터 추가"";
        const data = await fetchInstance(
          `/chatrooms/answers?has_assignee=false&requires_confirmation=true&has_slash_in_name=true&is_confirmed=${isConfirmed}&page=${currentPage}&size=${size}`
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
    },
    []
  );

  // 탭 변경 시 데이터 불러오기
  useEffect(() => {
    fetchReviewData(activeTab, 1);
  }, [activeTab, fetchReviewData]);

  // 페이지 변경 시 데이터 불러오기
  useEffect(() => {
    if (page > 1) {
      // 첫 페이지는 탭 변경 시 이미 로드됨
      fetchReviewData(activeTab, page);
    }
  }, [page, activeTab, fetchReviewData]);

  const refreshData = useCallback(async () => {
    await fetchReviewData(activeTab, page);
  }, [activeTab, page, fetchReviewData]);

  return {
    reviews,
    loading,
    totalPages,
    totalItems,
    refreshData,
  };
}
