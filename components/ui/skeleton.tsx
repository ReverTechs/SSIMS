import { cn } from "@/lib/utils";

type SkeletonVariant = "pulse" | "shine";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: SkeletonVariant;
};

export function Skeleton({
  className,
  variant = "shine",
  ...props
}: SkeletonProps) {
  return (
    <div
      data-variant={variant}
      className={cn("skeleton-surface rounded-xl", className)}
      {...props}
    />
  );
}

