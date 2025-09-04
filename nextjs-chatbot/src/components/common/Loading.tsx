import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bar' | 'skeleton';
  color?: 'blue' | 'gray' | 'white' | 'primary';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'blue',
  fullScreen = false,
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    gray: 'border-gray-500',
    white: 'border-white',
    primary: 'border-primary'
  };

  const wrapperClasses = fullScreen
    ? 'fixed inset-0 flex justify-center items-center bg-white/80 backdrop-blur-sm z-50'
    : 'flex justify-center items-center';

  const renderSpinner = () => (
    <div
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`rounded-full bg-${color}-500 ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} animate-bounce`}
          style={{ animationDelay: `${index * 0.15}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} bg-${color}-500 rounded-full animate-ping absolute`} />
      <div className={`${sizeClasses[size]} bg-${color}-500 rounded-full`} />
    </div>
  );

  const renderBar = () => (
    <div className="w-full max-w-xs">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]`}
          style={{
            animation: 'loading 1.5s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );

  const renderSkeleton = () => (
    <div className="w-full space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bar':
        return renderBar();
      case 'skeleton':
        return renderSkeleton();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`${wrapperClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {renderLoader()}
        {text && (
          <p className={`text-${size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'base'} text-gray-600 font-medium`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;