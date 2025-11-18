import {
  SkeletonGlassCard,
  SkeletonLineSet,
  SkeletonPillRow,
  SkeletonProfileHeader,
} from "./primitives";

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <SkeletonProfileHeader />

      <SkeletonGlassCard className="space-y-4 p-4">
        <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonGlassCard
              key={index}
              padding="p-4"
            >
              <SkeletonLineSet lines={["w-24", "w-16"]} />
            </SkeletonGlassCard>
          ))}
        </div>
      </SkeletonGlassCard>

      <section className="grid gap-2.5 sm:gap-3 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <SkeletonGlassCard key={index} className="space-y-3 p-4">
            <SkeletonLineSet lines={["w-32"]} />
            {Array.from({ length: 4 }).map((__, detailIndex) => (
              <div
                key={detailIndex}
                className="rounded-lg border border-border/50 bg-card p-3"
              >
                <SkeletonLineSet lines={["w-24", "w-full"]} />
              </div>
            ))}
          </SkeletonGlassCard>
        ))}
      </section>

      <SkeletonGlassCard className="space-y-3 p-4">
        <SkeletonLineSet lines={["w-44", "w-32"]} />
        <SkeletonPillRow count={4} />
        <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonGlassCard key={index} padding="p-4">
              <SkeletonLineSet lines={["w-28"]} />
              <SkeletonLineSet lines={["w-full"]} className="pt-2" />
            </SkeletonGlassCard>
          ))}
        </div>
      </SkeletonGlassCard>
    </div>
  );
}

