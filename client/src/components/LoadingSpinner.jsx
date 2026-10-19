import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-indigo-600`} />
    </div>
  );
};

export const ContactCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse flex flex-col justify-between h-56">
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="w-28 h-4 bg-slate-200 rounded" />
            <div className="w-20 h-3 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="w-6 h-6 bg-slate-200 rounded-full" />
      </div>
      <div className="space-y-2 mt-4">
        <div className="w-3/4 h-3 bg-slate-100 rounded" />
        <div className="w-1/2 h-3 bg-slate-100 rounded" />
      </div>
    </div>
    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
      <div className="w-16 h-5 bg-slate-200 rounded-full" />
      <div className="w-16 h-6 bg-slate-100 rounded" />
    </div>
  </div>
);

export default LoadingSpinner;
