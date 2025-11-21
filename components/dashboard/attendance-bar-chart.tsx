"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

// Mock data - in production, this would come from the database
const attendanceData = [
  { day: "Monday", boys: 85, girls: 92 },
  { day: "Tuesday", boys: 88, girls: 90 },
  { day: "Wednesday", boys: 82, girls: 95 },
  { day: "Thursday", boys: 90, girls: 88 },
  { day: "Friday", boys: 87, girls: 93 },
];

const COLORS = {
  boys: "#3b82f6", // Blue
  girls: "#ec4899", // Pink
};

export function AttendanceBarChart({ height = 320 }: { height?: number }) {
  return (
    <Card className="hidden md:block group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden">
      <CardHeader className="relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold mb-0.5">Weekly Attendance</CardTitle>
            <CardDescription className="text-xs">
              Student attendance by day of the week
            </CardDescription>
            <CardDescription className="text-xs">
              Week 13 of Term 3 (2025/2026)
            </CardDescription>
          </div>
          <div className="p-1.5 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex-shrink-0">
            <Calendar className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={attendanceData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
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
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
              iconType="circle"
            />
            <Bar
              dataKey="boys"
              name="Boys"
              fill={COLORS.boys}
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="girls"
              name="Girls"
              fill={COLORS.girls}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

