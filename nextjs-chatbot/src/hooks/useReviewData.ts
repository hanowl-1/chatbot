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

  // useCallback을 사용하되, setState 함수들은 안정적이므로 의존성 불필요
  const fetchReviewData = async (
    currentTab: ReviewTabType,
    currentPage: number,
    size: number = 5
  ) => {
    setLoading(true);
    try {
      const isConfirmed = currentTab === "confirmed";
      const data = await fetchInstance(
        `/chatrooms/answers?has_assignee=false&requires_confirmation=true&has_slash_in_name=true&is_confirmed=${isConfirmed}&page=${currentPage}&size=${size}`
      );

      // const repsonse = await fetch(
      //   `${process.env.NEXT_PUBLIC_RAG_API_URL}/chatrooms/answers?has_assignee=false&requires_confirmation=true&has_slash_in_name=true&is_confirmed=${isConfirmed}&page=${currentPage}&size=${size}`,
      //   {
      //     method: "GET",
      //     headers: {
      //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_RAG_MASTER_TOKEN}`,
      //       "Content-Type": "application/json",
      //     },
      //     cache: "no-store", // 캐싱 비활성화
      //     next: { revalidate: 0 }, // Next.js 캐싱 비활성화
      //   }
      // );

      // // Response를 텍스트로 받기
      // const responseText = await repsonse.text();
      // // console.log("responseText", responseText);

      // // JSON 파싱 전에 큰 chat_dialog_id를 문자열로 변환
      // const safeParsedText = responseText.replace(
      //   /"chat_dialog_id"\s*:\s*(\d{16,})/g, // 16자리 이상의 숫자 탐지
      //   '"chat_dialog_id":"$1"' // 숫자를 문자열로 감싸기
      // );
      // console.log("safeParsedText", safeParsedText);
      // const data = JSON.parse(safeParsedText);
      console.log("data", data.data);

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

  // 탭 변경 시
  useEffect(() => {
    fetchReviewData(activeTab, 1);
  }, [activeTab]);

  // 페이지 변경 시
  useEffect(() => {
    if (page > 1) {
      fetchReviewData(activeTab, page);
    }
  }, [page, activeTab]);

  const refreshData = useCallback(async () => {
    await fetchReviewData(activeTab, page);
  }, [activeTab, page]); // fetchReviewData도 의존성에 포함

  return {
    reviews,
    loading,
    totalPages,
    totalItems,
    refreshData,
  };
}
