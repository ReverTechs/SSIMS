"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

// Mock financial data
const financeData = [
  { month: "Jan", revenue: 30000, expenses: 38000 },
  { month: "Feb", revenue: 10000, expenses: 35000 },
  { month: "Mar", revenue: 95000, expenses: 20000 },
  { month: "Apr", revenue: 40000, expenses: 30000 },
  { month: "May", revenue: 58000, expenses: 37000 },
  { month: "Jun", revenue: 67000, expenses: 41000 },
];

const COLORS = {
  revenue: "#3b82f6", // Blue
  expenses: "#ef4444", // Red
};

const AreaChartExample = ({ isAnimationActive = true, height = 320 }: { isAnimationActive?: boolean; height?: number }) => (
  <Card className="hidden md:block group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden rounded-2xl">
    <CardHeader className="relative">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-semibold mb-0.5">
            Financial Overview
          </CardTitle>
          <CardDescription className="text-xs">
            Monthly revenue and expenses trend
          </CardDescription>
          <CardDescription className="text-xs">
            Last 6 months (Jan - Jun 2025)
          </CardDescription>
        </div>
        <div className="p-1.5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={financeData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.expenses} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.expenses} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `MWK ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            labelStyle={{
              color: "hsl(var(--foreground))",
              fontWeight: 600,
              marginBottom: "4px",
            }}
            formatter={(value: number) => `MWK ${value.toLocaleString()}`}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
            iconType="line"
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={COLORS.revenue}
            fill="url(#colorRevenue)"
            strokeWidth={2}
            isAnimationActive={isAnimationActive}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke={COLORS.expenses}
            fill="url(#colorExpenses)"
            strokeWidth={2}
            isAnimationActive={isAnimationActive}
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default AreaChartExample;
