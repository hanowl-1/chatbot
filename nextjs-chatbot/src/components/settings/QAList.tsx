"use client";

import { useState, useEffect } from "react";
import { Trash2, Download, RefreshCw } from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import { QAItem, QAListProps } from "@/types/qa";
import { Pagination } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

export default function QAList({ refreshTrigger }: QAListProps) {
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [serverBusy, setServerBusy] = useState(false);

  const fetchQAList = async (page: number = 1, size: number = 20) => {
    setLoading(true);
    setServerBusy(false); // 재시도 시 초기화
    try {
      const result = await fetchInstance(`/qa?page=${page}&size=${size}`);
      if (result && result.data) {
        setQaList(result.data);
        setPagination(result.pagination);
        setCurrentPage(page);
      } else {
        console.error("예상하지 못한 응답 형식:", result);
      }
    } catch (error: any) {
      console.error("Failed to fetch QA list:", error);

      // 502 에러는 서버가 바쁜 상태
      if (error.message?.includes("502")) {
        setServerBusy(true);
        // 기존 데이터는 유지
      } else {
        // 다른 에러는 toast로 알림
        toast.error("목록을 불러오는데 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  //  벡터 상태 확인 필요 할 경우 사용
  // const fetchVectorStatus = async () => {
  //   const result = await fetchInstance(`/qa/vector-status`);
  //   console.log("result", result);
  // };

  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 QA를 삭제하시겠습니까?")) return;

    setDeletingId(id);
    try {
      await fetchInstance(`/qa/${id}`, {
        method: "DELETE",
      });

      // 성공 시
      toast.success("QA가 성공적으로 삭제되었습니다.");
      // 목록 새로고침
      fetchQAList(currentPage);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("QA 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExcelDownload = async () => {
    try {
      let allData: QAItem[] = [];
      let page = 1;
      let hasMore = true;

      // 모든 페이지 순회하며 데이터 수집
      while (hasMore) {
        const result = await fetchInstance(`/qa/?page=${page}&size=100`);
        allData = [...allData, ...result.data];
        hasMore = result.pagination.has_next;
        page++;
      }

      // 엑셀 데이터 준비
      const excelData = allData.map((item: QAItem) => ({
        question: item.question,
        answer: item.answer,
        slack: item.requires_confirmation,
      }));

      // 워크시트 생성...
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "QA목록");
      XLSX.writeFile(
        wb,
        `QA목록_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Failed to download Excel:", error);
      toast.error("Excel 다운로드 중 오류가 발생했습니다.");
    }
  };

  // 백터 DB와 Q-A DB 행 동기화
  const handleSync = async () => {
    toast("동기화중... 완료시 알려드립니다.", {
      icon: "🔄",
      duration: 3000,
    });
    // 동기화 작업은 백그라운드에서 처리
    await fetchInstance(`/qa/reset-and-sync`, {
      method: "POST",
    });
    // 동기화 시작했으니 상태 체크 시작
    checkSyncStatus();
  };

  // 동기화 상태 확인
  const checkSyncStatus = async () => {
    const interval = setInterval(async () => {
      try {
        const result = await fetchInstance(`/qa/vector-status`);
        console.log("result", result);
        if (result.synchronization.status === "synced") {
          clearInterval(interval);
          toast.success("동기화 완료!");
        }
      } catch (error) {
        clearInterval(interval);
      }
    }, 10000); // 10초마다 상태 확인

    setTimeout(() => {
      clearInterval(interval);
    }, 300000); // 5분 후 종료
  };

  // useEffect(() => {
  //   fetchVectorStatus();
  // }, []);

  useEffect(() => {
    fetchQAList(1);
  }, [refreshTrigger]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          전체 Q-A 목록 {pagination && `(${pagination.total_items}개)`}
        </h3>

        <div className="flex gap-2">
          <button
            onClick={handleExcelDownload}
            className="px-4 py-2 bg-green-500 text-white rounded-lg
   hover:bg-green-600 flex items-center gap-2 
  transition-colors"
          >
            <Download className="w-4 h-4" />
            Excel 다운로드
          </button>
          <button
            onClick={() => handleSync()}
            className="px-4 py-2 bg-gray-100 text-gray-700
  rounded-lg hover:bg-gray-200 flex items-center gap-2
  transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            DB 동기화
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : serverBusy ? (
        // 서버가 바쁠 때 보여줄 UI
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-6xl">⏳</div>
          <h3 className="text-lg font-semibold text-gray-700">
            서버가 처리 중입니다
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            현재 서버가 다른 작업을 처리 중입니다.
            <br />
            잠시 후 다시 시도해주세요.
          </p>

          {qaList.length > 0 && (
            <div className="w-full mt-4 pt-4 border-t">
              <p className="text-xs text-gray-400 text-center mb-2">
                이전 데이터 (최신 정보가 아닐 수 있음)
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2 opacity-50">
                {qaList.map((item) => (
                  <div key={item.id} className="p-2 border rounded text-sm">
                    <p className="text-gray-600">Q: {item.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {qaList.map((item) => (
            <div
              key={item.id}
              className="p-3 border rounded-lg hover:bg-gray-50 relative group"
            >
              <div className="pr-8">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700 flex-1">
                    Q: {item.question}
                  </p>
                  <span className="text-xs text-blue-600 font-semibold ml-2">
                    qa_id: {item.id}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">A: {item.answer}</p>
                {item.updated_at && (
                  <p className="text-xs text-gray-400 mt-1">
                    수정일:{" "}
                    {new Date(item.updated_at).toLocaleDateString("ko-KR")}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id!)}
                disabled={deletingId === item.id}
                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                title="삭제"
              >
                {deletingId === item.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => fetchQAList(currentPage - 1)}
            disabled={!pagination.has_previous || loading}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">
            {currentPage} / {pagination.total_pages}
          </span>
          <button
            onClick={() => fetchQAList(currentPage + 1)}
            disabled={!pagination.has_next || loading}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
