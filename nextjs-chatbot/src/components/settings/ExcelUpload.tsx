"use client";

import { useState, useRef } from "react";
import { FileSpreadsheet, Check, X } from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";

interface ExcelUploadProps {
  onUploadSuccess?: () => void;
}

export default function ExcelUpload({ onUploadSuccess }: ExcelUploadProps) {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success?: boolean;
    message?: string;
    count?: number;
  } | null>(null);
  const [sheetName, setSheetName] = useState("Sheet1");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("파일을 선택해주세요.");
      return;
    }

    setUploadLoading(true);
    setUploadResult(null);
    setShowUploadModal(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const fileName = selectedFile.name || "FAQ관리.xlsx";
      const data = await fetchInstance(
        `/qa/bulk-upload?file_path=${encodeURIComponent(
          fileName
        )}&sheet_name=${encodeURIComponent(sheetName)}`,
        {
          method: "POST",
          body: formData,
        }
      );

      setUploadResult({
        success: true,
        message: `${data.count || 0}개의 QA가 성공적으로 추가되었습니다.`,
        count: data.count,
      });
      onUploadSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        message: "파일 추가 중 오류가 발생했습니다.",
      });
    } finally {
      setUploadLoading(false);
      // 상태 초기화
      setSelectedFile(null);
      setSheetName("Sheet1");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      {/* Excel 추가 상태 메시지 */}
      {uploadLoading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-blue-700">Excel 파일 추가 중...</span>
        </div>
      )}

      {uploadResult && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
            uploadResult.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {uploadResult.success ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-red-600" />
            )}
            <span
              className={
                uploadResult.success ? "text-green-700" : "text-red-700"
              }
            >
              {uploadResult.message}
            </span>
          </div>
          <button
            onClick={() => setUploadResult(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Excel 추가 버튼 */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Excel 추가
      </button>

      {/* Excel 추가 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Excel 파일 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시트 이름 (기본값: Sheet1)
                </label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Sheet1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excel 파일 선택
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!file.name.match(/\.(xlsx|xls)$/)) {
                        alert("Excel 파일만 추가 가능합니다.");
                        e.target.value = "";
                        return;
                      }
                      setSelectedFile(file);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    선택된 파일: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSheetName("Sheet1");
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
