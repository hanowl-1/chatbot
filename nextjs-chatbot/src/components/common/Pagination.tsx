import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}) => {
  // 표시할 페이지 번호 계산
  const getPageNumbers = () => {
    const delta = 2; // 현재 페이지 양옆에 표시할 페이지 수
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex items-center justify-between flex-1">
        {/* 왼쪽: 정보 표시 */}
        <div className="flex items-center gap-4">
          {totalItems !== undefined && (
            <p className="text-sm text-gray-700">
              총 <span className="font-medium">{totalItems}</span>개 항목
            </p>
          )}

          {/* 페이지 크기 선택 - 주석처리 */}
          {/* <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">페이지당</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}개
                </option>
              ))}
            </select>
          </div> */}
        </div>

        {/* 오른쪽: 페이지네이션 컨트롤 */}
        <div className="flex items-center gap-1">
          {/* 처음으로 */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="처음 페이지로"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>

          {/* 이전 */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="이전 페이지로"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* 페이지 번호 */}
          <div className="flex items-center gap-1 px-2">
            {getPageNumbers().map((pageNum, index) =>
              pageNum === "..." ? (
                <span
                  key={`dots-${index}`}
                  className="px-2 py-1 text-sm text-gray-500"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum as number)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>

          {/* 다음 */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="다음 페이지로"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 마지막으로 */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="마지막 페이지로"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
