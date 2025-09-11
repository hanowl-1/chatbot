"use client";

import { useState, useCallback } from "react";
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";

export type DateFilterMode = "single" | "range";

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

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean | null;
  isInRange: boolean | null;
  isRangeStart: boolean | null;
  isRangeEnd: boolean | null;
}

export default function DateTimeFilter({
  value,
  onChange,
  onClear,
}: DateTimeFilterProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempSelection, setTempSelection] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: value.startDate,
    endDate: value.endDate,
  });

  // 달력 날짜 생성
  const generateCalendarDays = (year: number, month: number): CalendarDay[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();

      const isSelected =
        (tempSelection.startDate &&
          date.getTime() === tempSelection.startDate.getTime()) ||
        (tempSelection.endDate &&
          date.getTime() === tempSelection.endDate.getTime());

      const isInRange =
        tempSelection.startDate &&
        tempSelection.endDate &&
        date.getTime() > tempSelection.startDate.getTime() &&
        date.getTime() < tempSelection.endDate.getTime();

      const isRangeStart =
        tempSelection.startDate &&
        date.getTime() === tempSelection.startDate.getTime();
      const isRangeEnd =
        tempSelection.endDate &&
        date.getTime() === tempSelection.endDate.getTime();

      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        isInRange,
        isRangeStart,
        isRangeEnd,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    if (
      !tempSelection.startDate ||
      (tempSelection.startDate && tempSelection.endDate)
    ) {
      // 첫 번째 선택 또는 리셋 후 첫 선택
      setTempSelection({
        startDate: clickedDate,
        endDate: null,
      });
    } else if (tempSelection.startDate && !tempSelection.endDate) {
      // 두 번째 선택
      if (clickedDate.getTime() === tempSelection.startDate.getTime()) {
        // 같은 날짜 클릭 시 단일 선택으로 처리
        setTempSelection({
          startDate: clickedDate,
          endDate: null,
        });
      } else if (clickedDate < tempSelection.startDate) {
        // 이전 날짜 선택 시 순서 바꿈
        setTempSelection({
          startDate: clickedDate,
          endDate: tempSelection.startDate,
        });
      } else {
        // 나중 날짜 선택 시 범위 완성
        setTempSelection({
          startDate: tempSelection.startDate,
          endDate: clickedDate,
        });
      }
    }
  };

  // 적용 버튼 클릭
  const handleApply = () => {
    const mode = tempSelection.endDate ? "range" : "single";
    onChange({
      startDate: tempSelection.startDate,
      endDate: tempSelection.endDate,
      mode,
    });
    setIsCalendarOpen(false);
  };

  // 취소 버튼 클릭
  const handleCancel = () => {
    setTempSelection({
      startDate: value.startDate,
      endDate: value.endDate,
    });
    setIsCalendarOpen(false);
  };

  // 이전/다음 달
  const goToPrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  // 현재 필터 상태 확인
  const hasActiveFilter = value.startDate || value.endDate;

  // 선택된 날짜 표시 텍스트
  const getDisplayText = () => {
    if (!hasActiveFilter) return "날짜 선택";

    if (value.mode === "single" && value.startDate) {
      return value.startDate.toLocaleDateString("ko-KR");
    }

    if (value.mode === "range" && value.startDate && value.endDate) {
      return `${value.startDate.toLocaleDateString(
        "ko-KR"
      )} - ${value.endDate.toLocaleDateString("ko-KR")}`;
    }

    return "날짜 선택";
  };

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

      {/* 날짜 선택 버튼 */}
      <div className="relative">
        <button
          onClick={() => {
            setIsCalendarOpen(!isCalendarOpen);
            setTempSelection({
              startDate: value.startDate,
              endDate: value.endDate,
            });
            // 캘린더 열 때 현재 날짜로 이동
            if (!isCalendarOpen) {
              setCurrentDate(new Date());
            }
          }}
          className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <div className="flex items-center justify-between">
            <span
              className={hasActiveFilter ? "text-gray-900" : "text-gray-500"}
            >
              {getDisplayText()}
            </span>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        {/* 커스텀 캘린더 */}
        {isCalendarOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80">
            {/* 캘린더 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <button
                onClick={goToPrevMonth}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold">
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              </span>
              <button
                onClick={goToNextMonth}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 border-b">
              {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                <div
                  key={index}
                  className="p-2 text-xs font-medium text-center text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 캘린더 본체 */}
            <div className="p-2">
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  const isDisabled = !day.isCurrentMonth;

                  let dayClasses =
                    "w-8 h-8 flex items-center justify-center text-xs rounded cursor-pointer ";

                  if (isDisabled) {
                    dayClasses += "text-gray-300 cursor-not-allowed ";
                  } else if (day.isToday) {
                    dayClasses += "text-blue-600 font-semibold ";
                  } else {
                    dayClasses += "text-gray-700 hover:bg-gray-100 ";
                  }

                  if (day.isRangeStart || day.isRangeEnd) {
                    dayClasses += "bg-blue-500 text-white hover:bg-blue-600 ";
                  } else if (day.isInRange) {
                    dayClasses += "bg-blue-100 text-blue-800 ";
                  } else if (day.isSelected) {
                    dayClasses += "bg-blue-500 text-white hover:bg-blue-600 ";
                  }

                  return (
                    <div key={index} className="p-1">
                      <button
                        onClick={() => !isDisabled && handleDateClick(day.date)}
                        disabled={isDisabled}
                        className={dayClasses}
                      >
                        {day.date.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 캘린더 푸터 */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="text-xs text-gray-600">
                {tempSelection.startDate &&
                  !tempSelection.endDate &&
                  "종료일을 선택하세요 (선택)"}
                {tempSelection.startDate &&
                  tempSelection.endDate &&
                  "기간이 선택됨"}
                {!tempSelection.startDate && "날짜를 선택하세요"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  onClick={handleApply}
                  disabled={!tempSelection.startDate}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 현재 필터 상태 표시 */}
      {hasActiveFilter && (
        <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <Calendar className="inline w-4 h-4 mr-2" />
          {value.mode === "single" && value.startDate && (
            <span className="font-medium">
              {value.startDate.toLocaleDateString("ko-KR")}
            </span>
          )}
          {value.mode === "range" && value.startDate && value.endDate && (
            <span className="font-medium">
              {value.startDate.toLocaleDateString("ko-KR")} ~{" "}
              {value.endDate.toLocaleDateString("ko-KR")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
