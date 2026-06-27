import React from "react";
import { Skeleton } from "@/shared/ui/skeleton";

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-9 w-16 mb-2" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <Skeleton className="h-4 w-28 mb-4" />
        <Skeleton className="h-48 w-full rounded-full" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0">
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-6 w-32 rounded" />
          <Skeleton className="h-6 w-32 rounded" />
          <Skeleton className="h-6 w-16 rounded" />
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-6 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

export function Loader() {
  return (
    <div className="flex items-center justify-center p-12">
      <img src="/logo.png" alt="Loading..." className="w-12 h-12 animate-pulse object-contain rounded-full shadow-[0_0_15px_rgba(204,255,0,0.3)] border-2 border-[#ccff00]" />
    </div>
  );
}
