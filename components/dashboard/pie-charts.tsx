"use client";

import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Users, GraduationCap } from "lucide-react";

interface PieChartsProps {
  studentsData: {
    name: string;
    value: number;
    fill: string;
  }[];
  teachersData: {
    name: string;
    value: number;
    fill: string;
  }[];
}

const studentsChartConfig = {
  Boys: {
    label: "Total Boys",
    color: "hsl(221.2 83.2% 53.3%)",
  },
  Girls: {
    label: "Total Girls",
    color: "hsl(330.4 81.2% 60.4%)",
  },
} satisfies ChartConfig;

const teachersChartConfig = {
  Males: {
    label: "Total Males",
    color: "hsl(221.2 83.2% 53.3%)",
  },
  Females: {
    label: "Total Females",
    color: "hsl(330.4 81.2% 60.4%)",
  },
} satisfies ChartConfig;

export function PieCharts({ studentsData, teachersData }: PieChartsProps) {
  const totalStudents = studentsData.reduce((acc, curr) => acc + curr.value, 0);
  const totalTeachers = teachersData.reduce((acc, curr) => acc + curr.value, 0);

  // Custom legend content to show totals
  const StudentsLegendContent = ({ payload }: any) => {
    if (!payload?.length) return null;
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3">
        {payload.map((item: any) => {
          // item.value is the name (e.g., "Boys"), item.payload.value is the count
          const name = item.value;
          const value = item.payload?.value || 0;
          const label = name === "Boys" ? `Total Boys: ${value}` : `Total Girls: ${value}`;
          return (
            <div key={name} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs sm:text-sm">{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const TeachersLegendContent = ({ payload }: any) => {
    if (!payload?.length) return null;
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3">
        {payload.map((item: any) => {
          // item.value is the name (e.g., "Males"), item.payload.value is the count
          const name = item.value;
          const value = item.payload?.value || 0;
          const label = name === "Males" ? `Total Males: ${value}` : `Total Females: ${value}`;
          return (
            <div key={name} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs sm:text-sm">{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Students Pie Chart */}
      <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden flex-1 rounded-2xl">
        <CardHeader className="relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm sm:text-base font-semibold mb-0.5">Students ({totalStudents})</CardTitle>
              <CardDescription className="text-xs">
                Distribution by gender
              </CardDescription>
            </div>
            <div className="p-1.5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center">
          <ChartContainer config={studentsChartConfig} className="h-[200px] sm:h-[250px] w-full flex items-center justify-center">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={studentsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                strokeWidth={5}
              >
                {studentsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<StudentsLegendContent />}
                className="-bottom-2 sm:-bottom-6"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Teachers Pie Chart */}
      <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden flex-1 rounded-2xl">
        <CardHeader className="relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm sm:text-base font-semibold mb-0.5">Teachers ({totalTeachers})</CardTitle>
              <CardDescription className="text-xs">
                Distribution by gender
              </CardDescription>
            </div>
            <div className="p-1.5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center">
          <ChartContainer config={teachersChartConfig} className="h-[200px] sm:h-[250px] w-full flex items-center justify-center">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={teachersData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                strokeWidth={5}
              >
                {teachersData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<TeachersLegendContent />}
                className="-bottom-2 sm:-bottom-6"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

