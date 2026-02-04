import { Skeleton } from "@/components/ui/Skeleton";
import BottomNav from "@/components/BottomNav";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-md mx-auto pt-8 px-6 space-y-8">
        {/* Header Skeleton */}
        <header className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
          <div className="h-12 w-12">
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>
        </header>

        {/* Stats Summary Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-[140px] bg-card p-6 rounded-[2rem] shadow-sm border border-border">
            <div className="flex items-center space-x-2 mb-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-full" />
            </div>
            <div className="flex items-end space-x-1 mt-6">
              <Skeleton className="h-10 w-16 rounded-lg" />
              <Skeleton className="h-4 w-6 mb-1 rounded-full" />
            </div>
          </div>
          <div className="h-[140px] bg-card p-6 rounded-[2rem] shadow-sm border border-border">
            <div className="flex items-center space-x-2 mb-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-full" />
            </div>
            <div className="flex items-end space-x-1 mt-6">
              <Skeleton className="h-10 w-16 rounded-lg" />
              <Skeleton className="h-4 w-6 mb-1 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20 mt-3 rounded-full" />
          </div>
        </div>

        {/* Today's Log Skeleton */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>

          <div className="space-y-3">
             {[1, 2, 3].map((i) => (
               <Skeleton key={i} className="h-24 w-full rounded-2xl" />
             ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
