import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonChartCard,
  SkeletonGlassCard,
  SkeletonLineSet,
  SkeletonListTile,
  SkeletonPillRow,
  SkeletonProfileHeader,
  SkeletonStatCard,
} from "./primitives";

type DashboardShellSkeletonProps = {
  children?: React.ReactNode;
};


export function DashboardShellSkeleton({
  children,
}: DashboardShellSkeletonProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
            <SkeletonLineSet lines={["w-32", "w-24"]} />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonPillRow count={1} />
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden border-r bg-card px-3 py-4 lg:flex lg:w-64 lg:flex-col lg:gap-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full rounded-md" />
          ))}
        </aside>
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 space-y-3 sm:space-y-4">
            {children ?? <DashboardOverviewSkeleton />}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <SkeletonProfileHeader />

      <section className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatCard key={index} />
        ))}
      </section>

      <section className="grid gap-2.5 sm:gap-3 lg:grid-cols-2">
        <SkeletonGlassCard className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <SkeletonLineSet lines={["w-40", "w-24"]} />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonListTile key={index} />
          ))}
        </SkeletonGlassCard>
        <SkeletonGlassCard className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <SkeletonLineSet lines={["w-40", "w-24"]} />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonListTile key={index} />
          ))}
        </SkeletonGlassCard>
      </section>

      <section className="space-y-2.5 sm:space-y-3">
        <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-2">
          <SkeletonGlassCard className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <SkeletonLineSet lines={["w-32", "w-24"]} />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-3"
              >
                <SkeletonLineSet lines={["w-40", "w-24"]} className="w-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            ))}
          </SkeletonGlassCard>
          <SkeletonGlassCard className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <SkeletonLineSet lines={["w-32", "w-24"]} />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <SkeletonLineSet lines={["w-3/4", "w-2/3", "w-1/2"]} />
            <SkeletonPillRow count={4} />
          </SkeletonGlassCard>
        </div>
      </section>

      <section className="space-y-2.5 sm:space-y-3">
        <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-2">
          <SkeletonChartCard heightClass="h-64" />
          <SkeletonChartCard heightClass="h-64" />
        </div>
        <SkeletonChartCard heightClass="h-72" />
      </section>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <SkeletonGlassCard className="flex h-64 w-full items-center justify-center">
      <Skeleton className="h-48 w-3/4 rounded-lg" />
    </SkeletonGlassCard>
  );
}

