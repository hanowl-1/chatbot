"use client";

import { useState } from "react";
import { Database } from "lucide-react";
import QASearch from "@/components/settings/QASearch";
import ExcelUpload from "@/components/settings/ExcelUpload";
import QAAddForm from "@/components/settings/QAAddForm";
import QAList from "@/components/settings/QAList";

export default function SettingsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Database className="w-6 h-6" />
          Supabase Q-A 관리
        </h2>

        {/* 검색 섹션 */}
        <QASearch />

        {/* QA 추가 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Q-A 추가</h3>
            <div className="flex gap-2">
              <ExcelUpload onUploadSuccess={handleRefresh} />
              <QAAddForm onAddSuccess={handleRefresh} />
            </div>
          </div>
        </div>

        {/* 전체 QA 목록 */}
        <QAList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
