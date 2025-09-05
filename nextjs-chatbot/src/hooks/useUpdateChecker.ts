import { useState, useEffect, useRef, useCallback } from "react";
import { fetchInstance } from "@/lib/fetchInstance";

interface UseUpdateCheckerProps {
  currentReviewCount?: number; // 현재 페이지의 리뷰 개수
  interval?: number; // 폴링 간격 (ms)
  enabled?: boolean; // 폴링 활성화 여부
}

export function useUpdateChecker({
  currentReviewCount = 0,
  interval = 60000,
  enabled = true,
}: UseUpdateCheckerProps) {
  const [hasUpdates, setHasUpdates] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 실제 검증 대기 개수 가져오기
  const getActualReviewCount = useCallback(async () => {
    try {
      const result = await fetchInstance(
        "/chatrooms/answers?has_assignee=false&requires_confirmation=true&is_confirmed=false&page=1&size=5"
      );
      return result.pagination?.total_items || 0;
    } catch (error) {
      console.error("Failed to get pending count:", error);
      return 0;
    }
  }, []);

  // 업데이트 여부 확인
  const checkForUpdates = useCallback(async () => {
    if (!enabled || currentReviewCount === 0) return;

    setIsChecking(true);
    try {
      const actualReviewCount = await getActualReviewCount();
      const newItemsCount = Math.max(0, actualReviewCount - currentReviewCount);
      // console.log("newItemsCount", newItemsCount);
      // console.log("actualReviewCount", actualReviewCount);
      // console.log("currentReviewCount", currentReviewCount);

      if (newItemsCount > 0) {
        setHasUpdates(true);
        setUpdateCount(newItemsCount);
      } else {
        setHasUpdates(false);
        setUpdateCount(0);
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    } finally {
      setIsChecking(false);
    }
  }, [enabled, getActualReviewCount, currentReviewCount]);

  // 폴링 설정
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 초기 체크 제거 - 이미 데이터를 가져온 상태이므로 불필요
    // 폴링 시작 - interval 후에 첫 체크가 실행됨
    intervalRef.current = setInterval(() => {
      checkForUpdates();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, checkForUpdates]);

  // 탭 비활성화 시 폴링 중단
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 탭이 비활성화되면 폴링 중단
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // 탭이 활성화되면 즉시 체크 후 폴링 재시작
        if (enabled) {
          checkForUpdates();
          intervalRef.current = setInterval(() => {
            checkForUpdates();
          }, interval);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, interval, checkForUpdates]);

  // 업데이트 리셋 (새로고침 후)
  const resetUpdates = useCallback(() => {
    setHasUpdates(false);
    setUpdateCount(0);
  }, []);

  return {
    hasUpdates,
    updateCount,
    isChecking,
    resetUpdates,
  };
}
