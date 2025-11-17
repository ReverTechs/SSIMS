import { DashboardShellSkeleton } from "@/components/skeletons/dashboard";
import { ReportsPageSkeleton } from "@/components/skeletons/reports";

export default function Loading() {
  return (
    <DashboardShellSkeleton>
      <ReportsPageSkeleton />
    </DashboardShellSkeleton>
  );
}

