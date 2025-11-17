import { DashboardShellSkeleton } from "@/components/skeletons/dashboard";
import { ProfilePageSkeleton } from "@/components/skeletons/profile";

export default function Loading() {
  return (
    <DashboardShellSkeleton>
      <ProfilePageSkeleton />
    </DashboardShellSkeleton>
  );
}

