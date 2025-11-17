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

const statAccents = [
  "from-sky-500/30 via-sky-500/5 to-transparent",
  "from-emerald-500/30 via-emerald-500/5 to-transparent",
  "from-amber-500/30 via-amber-500/5 to-transparent",
  "from-fuchsia-500/30 via-fuchsia-500/5 to-transparent",
];

export function DashboardShellSkeleton({
  children,
}: DashboardShellSkeletonProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
      <header className="border-b bg-card/40 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <SkeletonLineSet lines={["w-32", "w-24"]} />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonPillRow count={1} />
            <Skeleton className="h-10 w-10 rounded-2xl" />
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden border-r bg-card/10 px-4 py-6 lg:flex lg:w-64 lg:flex-col lg:gap-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full rounded-full" variant="pulse" />
          ))}
        </aside>
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background/60 to-background">
          <div className="container mx-auto max-w-7xl px-6 py-6 space-y-6">
            {children ?? <DashboardOverviewSkeleton />}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonProfileHeader />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statAccents.map((accent) => (
          <SkeletonStatCard key={accent} accent={accent} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SkeletonGlassCard className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <SkeletonLineSet lines={["w-40", "w-24"]} />
            <Skeleton className="h-10 w-10 rounded-2xl" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonListTile key={index} accent="from-blue-500/5 via-background to-transparent" />
          ))}
        </SkeletonGlassCard>
        <SkeletonGlassCard className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <SkeletonLineSet lines={["w-40", "w-24"]} />
            <Skeleton className="h-10 w-10 rounded-2xl" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonListTile key={index} accent="from-emerald-500/5 via-background to-transparent" />
          ))}
        </SkeletonGlassCard>
      </section>

      <section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonGlassCard className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <SkeletonLineSet lines={["w-32", "w-24"]} />
              <Skeleton className="h-10 w-10 rounded-2xl" />
            </div>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonGlassCard
                key={index}
                padding="p-3"
                className="flex items-center justify-between bg-transparent"
                glow={false}
              >
                <SkeletonLineSet lines={["w-40", "w-24"]} className="w-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </SkeletonGlassCard>
            ))}
          </SkeletonGlassCard>
          <SkeletonGlassCard className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <SkeletonLineSet lines={["w-32", "w-24"]} />
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
            <SkeletonLineSet lines={["w-3/4", "w-2/3", "w-1/2"]} />
            <SkeletonPillRow count={4} />
          </SkeletonGlassCard>
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
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
      <Skeleton className="h-48 w-3/4 rounded-3xl" />
    </SkeletonGlassCard>
  );
}

