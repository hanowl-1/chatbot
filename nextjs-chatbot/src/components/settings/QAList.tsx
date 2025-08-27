"use client";

import { useState, useEffect } from "react";
import { Trash2, FileSpreadsheet, Check, X, Download } from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import { QAItem, QAListProps } from "@/types/qa";
import { Pagination } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

export default function QAList({ refreshTrigger }: QAListProps) {
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchQAList = async (page: number = 1, size: number = 20) => {
    setLoading(true);
    try {
      const result = await fetchInstance(`/qa/?page=${page}&size=${size}`);

      if (result && result.data) {
        setQaList(result.data);
        setPagination(result.pagination);
        setCurrentPage(page);
      } else {
        console.error("예상하지 못한 응답 형식:", result);
      }
    } catch (error) {
      console.error("Failed to fetch QA list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 QA를 삭제하시겠습니까?")) return;

    setDeletingId(id);
    try {
      await fetchInstance(`/qa/${id}`, {
        method: "DELETE",
      });

      // 성공 시
      alert("✅ QA가 성공적으로 삭제되었습니다.");
      // 목록 새로고침
      fetchQAList(currentPage);
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ QA 삭제 중 오류가 발생했습니다.");
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
      alert("Excel 다운로드 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    console.log("refreshTrigger 변경됨:", refreshTrigger);
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
            onClick={() => fetchQAList(currentPage)}
            className="px-4 py-2 bg-gray-100 text-gray-700
  rounded-lg hover:bg-gray-200 flex items-center gap-2
  transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
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
                onClick={() => handleDelete(item.id)}
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
