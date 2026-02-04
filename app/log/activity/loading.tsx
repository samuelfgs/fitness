import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft } from "lucide-react";

export default function LogActivityLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <div className="p-2 -ml-2 text-foreground bg-muted rounded-xl">
          <ArrowLeft size={24} className="opacity-50" />
        </div>
        <Skeleton className="h-7 w-48 rounded-lg" />
        <div className="w-10" /> 
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="py-4 px-4 rounded-2xl flex flex-row items-center gap-4 border-2 bg-card border-border">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
