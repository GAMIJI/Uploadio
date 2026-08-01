import React from 'react';

export const ImageSkeleton = () => (
  <div className="w-full aspect-[4/3] bg-slate-100 rounded-2xl animate-pulse flex flex-col items-center justify-center border border-slate-200">
    <div className="w-12 h-12 rounded-full bg-slate-200 mb-3" />
    <div className="w-32 h-4 bg-slate-200 rounded-md mb-2" />
    <div className="w-20 h-3 bg-slate-200 rounded-md" />
  </div>
);

export const ToolSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
    <div className="w-1/3 h-5 bg-slate-200 rounded-md" />
    <div className="space-y-2">
      <div className="w-full h-10 bg-slate-100 rounded-xl" />
      <div className="w-full h-10 bg-slate-100 rounded-xl" />
    </div>
    <div className="w-full h-12 bg-sky-100 rounded-xl mt-6" />
  </div>
);

export const PageSkeleton = () => (
  <div className="min-h-screen bg-slate-50 p-6 lg:p-12 animate-pulse space-y-8">
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="w-1/4 h-8 bg-slate-200 rounded-lg" />
      <div className="w-1/2 h-4 bg-slate-200 rounded-md" />
    </div>
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
      <div className="lg:col-span-2">
        <ImageSkeleton />
      </div>
      <div>
        <ToolSkeleton />
      </div>
    </div>
  </div>
);