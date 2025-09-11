"use client";

import { useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock, X } from "lucide-react";

export type DateFilterMode = "range" | "after" | "before";

export interface DateTimeFilterValue {
  startDate: Date | null;
  endDate: Date | null;
  mode: DateFilterMode;
}

interface DateTimeFilterProps {
  value: DateTimeFilterValue;
  onChange: (value: DateTimeFilterValue) => void;
  onClear: () => void;
}

export default function DateTimeFilter({
  value,
  onChange,
  onClear,
}: DateTimeFilterProps) {
  // 빠른 선택 함수들
  // const handleQuickSelect = useCallback(
  //   (days: number) => {
  //     const now = new Date();
  //     const startDate = new Date();
  //     startDate.setDate(now.getDate() - days);

  //     onChange({
  //       ...value,
  //       startDate,
  //       endDate: now,
  //       mode: "range",
  //     });
  //   },
  //   [value, onChange]
  // );

  const handleModeChange = (mode: DateFilterMode) => {
    onChange({
      ...value,
      mode,
      // 모드 변경 시 적절한 초기값 설정
      startDate: mode === "before" ? null : value.startDate,
      endDate: mode === "after" ? null : value.endDate,
    });
  };

  const handleStartDateChange = (date: Date | null) => {
    onChange({
      ...value,
      startDate: date,
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    onChange({
      ...value,
      endDate: date,
    });
  };

  // 현재 필터 상태 확인
  const hasActiveFilter = value.startDate || value.endDate;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">기간 필터</span>
        </div>
        {hasActiveFilter && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 rounded"
          >
            <X className="w-3 h-3" />
            초기화
          </button>
        )}
      </div>

      {/* 모드 선택 */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value.mode === "range"}
            onChange={() => handleModeChange("range")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm">범위</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value.mode === "after"}
            onChange={() => handleModeChange("after")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm">~이후</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value.mode === "before"}
            onChange={() => handleModeChange("before")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm">~이전</span>
        </label>
      </div>

      {/* 날짜 선택기 */}
      <div className="space-y-3">
        {/* 범위 모드 */}
        {value.mode === "range" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                시작 일시
              </label>
              <DatePicker
                selected={value.startDate}
                onChange={handleStartDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="시작 일시 (선택)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                maxDate={value.endDate || undefined}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                종료 일시
              </label>
              <DatePicker
                selected={value.endDate}
                onChange={handleEndDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="종료 일시 (선택)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                minDate={value.startDate || undefined}
              />
            </div>
          </div>
        )}

        {/* 이후 모드 */}
        {value.mode === "after" && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              기준 일시 (이후)
            </label>
            <DatePicker
              selected={value.startDate}
              onChange={handleStartDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="기준 일시 선택"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* 이전 모드 */}
        {value.mode === "before" && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              기준 일시 (이전)
            </label>
            <DatePicker
              selected={value.endDate}
              onChange={handleEndDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="기준 일시 선택"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* 빠른 선택 버튼들 */}
      {/* <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-600">빠른 선택:</span>
        <button
          onClick={() => handleQuickSelect(0)}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          오늘
        </button>
        <button
          onClick={() => handleQuickSelect(1)}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          어제
        </button>
        <button
          onClick={() => handleQuickSelect(7)}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          지난 7일
        </button>
        <button
          onClick={() => handleQuickSelect(30)}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          지난 30일
        </button>
      </div> */}

      {/* 현재 필터 상태 표시 */}
      {hasActiveFilter && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <Clock className="inline w-3 h-3 mr-1" />
          {value.mode === "range" && value.startDate && value.endDate && (
            <>
              {value.startDate.toLocaleString("ko-KR")} ~{" "}
              {value.endDate.toLocaleString("ko-KR")}
            </>
          )}
          {value.mode === "after" && value.startDate && (
            <>{value.startDate.toLocaleString("ko-KR")} 이후</>
          )}
          {value.mode === "before" && value.endDate && (
            <>{value.endDate.toLocaleString("ko-KR")} 이전</>
          )}
        </div>
      )}
    </div>
  );
}
