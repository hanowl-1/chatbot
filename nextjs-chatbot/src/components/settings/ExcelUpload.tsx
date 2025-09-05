"use client";

import { useState, useRef } from "react";
import { FileSpreadsheet, Check, X } from "lucide-react";

interface ExcelUploadProps {
  onUploadSuccess?: () => void;
}

export default function ExcelUpload({ onUploadSuccess }: ExcelUploadProps) {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success?: boolean;
    message?: string | React.ReactNode;
    count?: number;
  } | null>(null);
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
      // FormData 생성 - 전체 File 객체를 서버로 전송
      const formData = new FormData();
      formData.append("file", selectedFile, selectedFile.name);

      // 기존 QA 데이터 삭제
      await fetch("/api/qa-upload", {
        method: "DELETE",
      });

      // QA 데이터 추가 (서버에서 청킹 처리)
      const response = await fetch("/api/qa-upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }
      
      const data = await response.json();
      console.log("Upload response:", data);

      // GitHub Actions 백그라운드 처리 결과 반영
      if (data.workflowUrl) {
        // GitHub Actions 방식
        setUploadResult({
          success: data.success,
          message: (
            <>
              {data.message}
              <br />
              <a 
                href={data.workflowUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                GitHub Actions에서 진행 상황 보기 →
              </a>
            </>
          ) as any,
          count: 0,
        });
      } else {
        // 기존 방식
        setUploadResult({
          success: data.success,
          message:
            data.message ||
            `처리 완료: 성공 ${data.successCount}개, 실패 ${data.failCount}개 (총 ${data.totalChunks}개 청크)`,
          count: data.successCount || data.totalRows,
        });
      }
      
      if (data.success) {
        onUploadSuccess?.();
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        message: error.message || "파일 업로드 중 오류가 발생했습니다.",
      });
    } finally {
      setUploadLoading(false);
      // 상태 초기화
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      {/* Excel 업로드 상태 메시지 */}
      {uploadLoading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-blue-700">
            Excel 파일 업로드 중... (서버에서 처리 중입니다. 페이지를 이동하셔도 됩니다.)
          </span>
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

      {/* Excel 업로드 버튼 */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Excel 업로드
      </button>

      {/* Excel 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Excel 파일 업로드</h3>
            <div className="space-y-4">
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
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                <p className="font-semibold mb-1">파일 형식 안내:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>지원 형식: .xlsx, .xls</li>
                  <li>첫 번째 행은 헤더로 인식됩니다</li>
                  <li>질문과 답변 콜럼이 포함되어야 합니다</li>
                </ul>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
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
                  업로드
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}