import { PendingReview } from "@/types/review";
import { CheckCircle, MessageSquareWarning, RefreshCw } from "lucide-react";

interface ReviewHeaderProps {
  loading: boolean;
  refreshData: () => void;
  activeTab: "confirmed" | "waiting";
  setActiveTab: (tab: "confirmed" | "waiting") => void;
  totalItems: number;
  pollingEnabled?: boolean;
  setPollingEnabled?: (enabled: boolean) => void;
}

export default function ReviewHeader({
  loading,
  refreshData,
  activeTab,
  setActiveTab,
  totalItems,
  pollingEnabled,
  setPollingEnabled,
}: ReviewHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {activeTab === "waiting" ? (
              <MessageSquareWarning className="w-6 h-6 text-orange-500" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
            {activeTab === "waiting" ? "검증 대기 질문" : "검증 완료 질문"}
          </h2>
          <p className="text-gray-600 mt-1">
            신뢰도가 낮은 AI 답변을 검증하고 직접 응답해주세요
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 실시간 알림 토글 - waiting 탭에서만 표시 */}
          {activeTab === "waiting" && setPollingEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">실시간 알림</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pollingEnabled}
                  onChange={(e) => setPollingEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {pollingEnabled ? "ON" : "OFF"}
                </span>
              </label>
            </div>
          )}

          {/* 새로고침 버튼 */}
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setActiveTab("waiting")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "waiting"
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          검증대기
        </button>
        <button
          onClick={() => setActiveTab("confirmed")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "confirmed"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          검증완료
        </button>
      </div>

      {/* 현재 탭 개수 표시 */}
      <div className="mt-4 text-sm text-gray-600">
        {activeTab === "waiting" ? (
          <>
            신뢰도 낮은 대기 항목:{" "}
            <span className="font-bold text-orange-600">{totalItems}개</span>
          </>
        ) : (
          <>
            검증 완료된 항목:{" "}
            <span className="font-bold text-green-600">{totalItems}개</span>
          </>
        )}
      </div>
    </div>
  );
}
