import React from 'react';
import { RefreshCw, Bell } from 'lucide-react';

interface UpdateNotificationProps {
  updateCount: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  updateCount,
  onRefresh,
  isLoading = false
}) => {
  if (updateCount <= 0) return null;

  return (
    <div className="animate-slideDown">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded-r-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 animate-bounce" />
            <p className="text-sm font-medium text-blue-900">
              새로운 질문 <span className="font-bold">{updateCount}개</span>가 있습니다
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '새로고침 중...' : '새로고침'}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UpdateNotification;