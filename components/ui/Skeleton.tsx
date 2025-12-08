import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton rounded bg-slate-200",
        className
      )}
    />
  );
}

/** Pre-built skeleton for chat message loading */
export function MessageSkeleton() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full skeleton" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

/** Pre-built skeleton for citation loading */
export function CitationSkeleton() {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden animate-fade-in">
      <Skeleton className="h-48 w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

