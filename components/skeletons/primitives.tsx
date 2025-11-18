import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonLineSpec = string;

export function SkeletonGlassCard({
  children,
  className,
  padding = "p-4",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-card",
        padding,
        className
      )}
    >
      {children}
    </div>
  );
}

export function SkeletonLineSet({
  lines,
  className,
}: {
  lines: SkeletonLineSpec[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {lines.map((widthClass, index) => (
        <Skeleton key={`${widthClass}-${index}`} className={cn("h-3", widthClass)} />
      ))}
    </div>
  );
}

export function SkeletonPillRow({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-8 w-24 rounded-full"
        />
      ))}
    </div>
  );
}

export function SkeletonStatCard({
  accent,
}: {
  accent?: string;
}) {
  return (
    <SkeletonGlassCard className="p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-6 rounded-md" />
      </div>
      <Skeleton className="mt-4 h-8 w-28" />
      <Skeleton className="mt-2 h-3 w-16" />
    </SkeletonGlassCard>
  );
}

export function SkeletonListTile({
  accent,
  metaLines = 2,
  showAction = true,
}: {
  accent?: string;
  metaLines?: number;
  showAction?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          {Array.from({ length: metaLines }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-32" />
          ))}
        </div>
        {showAction && <Skeleton className="h-6 w-6 rounded-full" />}
      </div>
    </div>
  );
}

export function SkeletonChartCard({
  heightClass = "h-56",
}: {
  heightClass?: string;
}) {
  return (
    <SkeletonGlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <Skeleton className={cn("w-full rounded-lg", heightClass)} />
    </SkeletonGlassCard>
  );
}

export function SkeletonProfileHeader() {
  return (
    <SkeletonGlassCard padding="p-4 sm:p-6" className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg" />
        <div className="flex-1 space-y-3 min-w-0">
          <SkeletonLineSet lines={["w-32", "w-48", "w-36"]} />
          <SkeletonPillRow count={3} className="pt-2" />
        </div>
      </div>
    </SkeletonGlassCard>
  );
}

