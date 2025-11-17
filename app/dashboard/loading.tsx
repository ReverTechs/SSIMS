import {
  DashboardOverviewSkeleton,
  DashboardShellSkeleton,
} from "@/components/skeletons/dashboard";

export default function Loading() {
  return (
    <DashboardShellSkeleton>
      <DashboardOverviewSkeleton />
    </DashboardShellSkeleton>
  );
}

