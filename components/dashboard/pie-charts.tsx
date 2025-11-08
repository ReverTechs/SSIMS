"use client";

import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Users, GraduationCap } from "lucide-react";

// Mock data - in production, this would come from the database
const studentsData = [
  { name: "Boys", value: 78, fill: "var(--color-Boys)" },
  { name: "Girls", value: 42, fill: "var(--color-Girls)" },
];

const teachersData = [
  { name: "Males", value: 15, fill: "var(--color-Males)" },
  { name: "Females", value: 10, fill: "var(--color-Females)" },
];

const studentsChartConfig = {
  Boys: {
    label: "Boys",
    color: "hsl(221.2 83.2% 53.3%)",
  },
  Girls: {
    label: "Girls",
    color: "hsl(330.4 81.2% 60.4%)",
  },
} satisfies ChartConfig;

const teachersChartConfig = {
  Males: {
    label: "Males",
    color: "hsl(221.2 83.2% 53.3%)",
  },
  Females: {
    label: "Females",
    color: "hsl(330.4 81.2% 60.4%)",
  },
} satisfies ChartConfig;

export function PieCharts() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Students Pie Chart */}
      <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden flex-1">
        <CardHeader className="relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold mb-0.5">Students (360)</CardTitle>
              <CardDescription className="text-xs">
                Distribution by gender
              </CardDescription>
            </div>
            <div className="p-1.5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
              <Users className="h-4 w-4 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <ChartContainer config={studentsChartConfig} className="h-[250px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={studentsData}
                dataKey="value"
                nameKey="name"
                strokeWidth={5}
              >
                {studentsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-bottom-6"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Teachers Pie Chart */}
      <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden flex-1">
        <CardHeader className="relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold mb-0.5">Teachers (25)</CardTitle>
              <CardDescription className="text-xs">
                Distribution by gender
              </CardDescription>
            </div>
            <div className="p-1.5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <ChartContainer config={teachersChartConfig} className="h-[250px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={teachersData}
                dataKey="value"
                nameKey="name"
                strokeWidth={5}
              >
                {teachersData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-bottom-6"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

