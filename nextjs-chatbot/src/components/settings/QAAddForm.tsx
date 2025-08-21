"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";

interface QAAddFormProps {
  onAddSuccess?: () => void;
}

export default function QAAddForm({ onAddSuccess }: QAAddFormProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddQA = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    setLoading(true);
    try {
      const data = await fetchInstance("/qa/", {
        method: "POST",
        body: JSON.stringify({
          question: newQuestion,
          answer: newAnswer,
        }),
      });

      console.log("data", data);
      setNewQuestion("");
      setNewAnswer("");
      setShowAddForm(false);
      onAddSuccess?.();
    } catch (error) {
      console.error("Add QA error:", error);
      alert("❌ QA 추가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowAddForm(true)}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        직접 추가
      </button>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h3 className="text-lg font-semibold mb-4">새 Q-A 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  질문
                </label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="질문을 입력하세요..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  답변
                </label>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewQuestion("");
                    setNewAnswer("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  onClick={handleAddQA}
                  disabled={!newQuestion.trim() || !newAnswer.trim() || loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                >
                  {loading ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
