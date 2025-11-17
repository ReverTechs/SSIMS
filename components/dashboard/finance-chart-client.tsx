"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/skeletons/dashboard";

const AreaChartExample = dynamic(() => import("./finance-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export default function FinanceChartClient(props: any) {
  return <AreaChartExample {...props} />;
}
