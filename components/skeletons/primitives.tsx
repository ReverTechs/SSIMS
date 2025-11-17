import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonLineSpec = string;

export function SkeletonGlassCard({
  children,
  className,
  padding = "p-4",
  glow = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/5 bg-gradient-to-br from-background/90 via-background/70 to-primary/5 dark:from-background/40 dark:via-background/20 dark:to-primary/10 backdrop-blur-2xl",
        "shadow-lg shadow-primary/5",
        glow && "ring-1 ring-primary/10",
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
    <div className={cn("flex flex-wrap gap-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-9 w-28 rounded-full border border-white/5 bg-white/10 dark:bg-white/5"
        />
      ))}
    </div>
  );
}

export function SkeletonStatCard({
  accent = "from-sky-500/20 via-transparent to-transparent",
}: {
  accent?: string;
}) {
  return (
    <SkeletonGlassCard className={cn("relative overflow-hidden p-4", `bg-gradient-to-br ${accent}`)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" variant="pulse" />
        <div className="rounded-xl border border-white/10 p-1.5">
          <Skeleton className="h-6 w-6 rounded-lg" variant="pulse" />
        </div>
      </div>
      <Skeleton className="mt-4 h-10 w-28" />
      <Skeleton className="mt-2 h-3 w-16" variant="pulse" />
    </SkeletonGlassCard>
  );
}

export function SkeletonListTile({
  accent = "from-primary/10 to-primary/5",
  metaLines = 2,
  showAction = true,
}: {
  accent?: string;
  metaLines?: number;
  showAction?: boolean;
}) {
  return (
    <SkeletonGlassCard
      className={cn(
        "group relative overflow-hidden p-3 transition",
        "bg-gradient-to-r",
        accent
      )}
      glow={false}
    >
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          {Array.from({ length: metaLines }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-32" variant="pulse" />
          ))}
        </div>
        {showAction && <Skeleton className="h-6 w-6 rounded-full" />}
      </div>
    </SkeletonGlassCard>
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
        <Skeleton className="h-10 w-10 rounded-2xl" />
      </div>
      <Skeleton className={cn("w-full rounded-2xl", heightClass)} />
    </SkeletonGlassCard>
  );
}

export function SkeletonProfileHeader() {
  return (
    <SkeletonGlassCard padding="p-6" className="space-y-4">
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative">
          <Skeleton className="h-24 w-24 rounded-3xl" />
          <div className="absolute inset-0 rounded-3xl border border-white/10" />
        </div>
        <div className="flex-1 space-y-3">
          <SkeletonLineSet lines={["w-32", "w-48", "w-36"]} />
          <SkeletonPillRow count={3} className="pt-2" />
        </div>
      </div>
    </SkeletonGlassCard>
  );
}

