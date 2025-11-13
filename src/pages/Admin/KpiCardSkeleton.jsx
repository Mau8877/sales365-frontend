import React from 'react';

const KpiCardSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="p-3 rounded-full bg-gray-200 h-12 w-12"></div>
      </div>
    </div>
  );
};

export default KpiCardSkeleton;