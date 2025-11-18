"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// #region Sample data
const data = [
  {
    name: "Form 1",
    Term1: 40,
    Term2: 50,
    Term3: 60,
  },
  {
    name: "Form 2",
    Term1: 30,
    Term2: 35,
    Term3: 40,
  },
  {
    name: "Form 3",
    Term1: 25,
    Term2: 80,
    Term3: 90,
  },
  {
    name: "Form 4",
    Term1: 30,
    Term2: 55,
    Term3: 60,
  },
  {
    name: "Form 5",
    Term1: 35,
    Term2: 56,
    Term3: 57,
  },
  {
    name: "Form 6",
    Term1: 40,
    Term2: 60,
    Term3: 70,
  },
];

// #endregion
type Props = {
  height?: number;
  isAnimationActive?: boolean;
};

const COLORS = {
  term1: "#6366f1", // indigo-500
  term2: "#06b6d4", // cyan-500
  term3: "#f59e0b", // amber-500
};

const StudentPerformanceHistoryChart = ({
  height = 320,
  isAnimationActive = true,
}: Props) => {
  return (
    <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden">
      <CardHeader className="relative px-4 pt-4">
        <div className="flex items-start justify-between w-full">
          <div>
            <CardTitle>Performance History</CardTitle>
            <CardDescription>
              Student performance trend across terms
            </CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: COLORS.term1 }}
              />
              <span>Term 1</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: COLORS.term2 }}
              />
              <span>Term 2</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: COLORS.term3 }}
              />
              <span>Term 3</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 24,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorTerm1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.term1} stopOpacity={0.28} />
                <stop offset="95%" stopColor={COLORS.term1} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTerm2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.term2} stopOpacity={0.28} />
                <stop offset="95%" stopColor={COLORS.term2} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTerm3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.term3} stopOpacity={0.28} />
                <stop offset="95%" stopColor={COLORS.term3} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                padding: "8px 12px",
              }}
              labelStyle={{
                color: "hsl(var(--foreground))",
                fontWeight: 600,
                marginBottom: 4,
              }}
              formatter={(value: number) => value}
            />
            {/* keep legend light - Recharts Legend sometimes overlaps; keep manual legend in header */}

            <Area
              type="monotone"
              dataKey="Term1"
              name="Term 1"
              stroke={COLORS.term1}
              fill="url(#colorTerm1)"
              strokeWidth={2}
              isAnimationActive={isAnimationActive}
            />
            <Area
              type="monotone"
              dataKey="Term2"
              name="Term 2"
              stroke={COLORS.term2}
              fill="url(#colorTerm2)"
              strokeWidth={2}
              isAnimationActive={isAnimationActive}
            />
            <Area
              type="monotone"
              dataKey="Term3"
              name="Term 3"
              stroke={COLORS.term3}
              fill="url(#colorTerm3)"
              strokeWidth={2}
              isAnimationActive={isAnimationActive}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StudentPerformanceHistoryChart;
