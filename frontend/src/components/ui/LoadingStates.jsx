import Card from './Card';

// Skeleton loader for better perceived performance
export const SkeletonCard = ({ height = "h-32", width = "w-full" }) => (
  <Card className={`${height} ${width} animate-pulse`}>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </Card>
);

// Grid skeleton for dashboard overview
export const DashboardSkeleton = ({ cards = 4 }) => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-gray-200 rounded w-48"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(cards)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded w-32"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonCard height="h-24" />
        <SkeletonCard height="h-24" />
      </div>
    </div>
  </div>
);

// Loading states with progress indicators
export const LoadingState = ({ 
  message = "Loading...", 
  size = "default",
  showProgress = false,
  progress = 0 
}) => {
  const sizes = {
    sm: "w-4 h-4",
    default: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Spinner */}
      <div className={`${sizes[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4`}></div>
      
      {/* Message */}
      <p className="text-gray-600 text-center mb-2">{message}</p>
      
      {/* Progress bar */}
      {showProgress && (
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
    </div>
  );
};

// Error state component
export const ErrorState = ({ 
  title = "Something went wrong",
  message = "Please try again later",
  onRetry,
  showIcon = true 
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {showIcon && (
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )}
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md">{message}</p>
    
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Try Again
      </button>
    )}
  </div>
);

// Empty state component
export const EmptyState = ({ 
  title = "No data available",
  message = "There's nothing to show here yet",
  action,
  actionText = "Get Started",
  icon 
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon ? (
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
    ) : (
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
    )}
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md">{message}</p>
    
    {action && (
      <button
        onClick={action}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {actionText}
      </button>
    )}
  </div>
);

export default LoadingState;