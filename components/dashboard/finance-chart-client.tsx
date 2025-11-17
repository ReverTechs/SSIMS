"use client";

import dynamic from "next/dynamic";

const AreaChartExample = dynamic(
  () => import("./finance-chart"),
  { ssr: false }
);

export default function FinanceChartClient(props: any) {
  return <AreaChartExample {...props} />;
}
