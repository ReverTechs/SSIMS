import {
  SkeletonGlassCard,
  SkeletonLineSet,
  SkeletonListTile,
  SkeletonPillRow,
} from "./primitives";

export function ReportsPageSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonGlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SkeletonLineSet lines={["w-48", "w-64"]} />
        <SkeletonPillRow count={1} className="sm:justify-end" />
      </SkeletonGlassCard>

      <SkeletonGlassCard className="space-y-4">
        <SkeletonLineSet lines={["w-40"]} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonGlassCard key={index} padding="p-3" glow={false}>
              <SkeletonLineSet lines={["w-24", "w-3/4"]} />
            </SkeletonGlassCard>
          ))}
        </div>
      </SkeletonGlassCard>

      <SkeletonGlassCard className="space-y-3">
        <SkeletonLineSet lines={["w-52", "w-72"]} />
        <SkeletonPillRow count={2} />
      </SkeletonGlassCard>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonGlassCard key={index} className="space-y-4">
            <div className="flex items-center justify-between">
              <SkeletonLineSet lines={["w-20"]} />
              <SkeletonPillRow count={1} />
            </div>
            <SkeletonLineSet lines={["w-3/4", "w-2/3"]} />
            <SkeletonGlassCard padding="p-3" glow={false}>
              <SkeletonLineSet lines={["w-32"]} />
              <SkeletonLineSet lines={["w-full"]} className="pt-2" />
            </SkeletonGlassCard>
          </SkeletonGlassCard>
        ))}
      </div>

      <SkeletonGlassCard className="space-y-4">
        <SkeletonLineSet lines={["w-40"]} />
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonListTile key={index} accent="from-primary/5 via-background to-transparent" showAction={false} />
        ))}
      </SkeletonGlassCard>
    </div>
  );
}

