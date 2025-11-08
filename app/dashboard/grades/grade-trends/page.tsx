"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GradeTrendsPage() {
  const trends = [
    {
      subject: "Mathematics",
      term1: 80,
      term2: 82,
      term3: 85,
      trend: "improving" as const,
      change: +5,
    },
    {
      subject: "English",
      term1: 75,
      term2: 78,
      term3: 80,
      trend: "improving" as const,
      change: +5,
    },
    {
      subject: "Physics",
      term1: 88,
      term2: 85,
      term3: 87,
      trend: "stable" as const,
      change: -1,
    },
    {
      subject: "Chemistry",
      term1: 82,
      term2: 80,
      term3: 78,
      trend: "declining" as const,
      change: -4,
    },
  ];

  const getTrendIcon = (trend: "improving" | "stable" | "declining") => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-emerald-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: "improving" | "stable" | "declining") => {
    switch (trend) {
      case "improving":
        return "text-emerald-600 dark:text-emerald-400";
      case "declining":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grade Trends</h1>
        <p className="text-muted-foreground">
          Analyze grade trends and student performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select defaultValue="2024">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select defaultValue="form3a">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="form3a">Form 3A</SelectItem>
                <SelectItem value="form3b">Form 3B</SelectItem>
                <SelectItem value="form4a">Form 4A</SelectItem>
                <SelectItem value="form4b">Form 4B</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subject</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {trends.map((item) => (
          <Card key={item.subject}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.subject}</CardTitle>
                {getTrendIcon(item.trend)}
              </div>
              <CardDescription>Performance across terms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Term 1</p>
                  <p className="text-xl font-bold">{item.term1}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Term 2</p>
                  <p className="text-xl font-bold">{item.term2}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Term 3</p>
                  <p className="text-xl font-bold">{item.term3}%</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Change</span>
                  <div className="flex items-center gap-1">
                    {item.change > 0 ? (
                      <ArrowUp className="h-4 w-4 text-emerald-600" />
                    ) : item.change < 0 ? (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "text-sm font-semibold",
                      getTrendColor(item.trend)
                    )}>
                      {item.change > 0 ? "+" : ""}{item.change}%
                    </span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "mt-2",
                    item.trend === "improving" && "border-emerald-500 text-emerald-700 dark:text-emerald-400",
                    item.trend === "declining" && "border-red-500 text-red-700 dark:text-red-400",
                    item.trend === "stable" && "border-muted-foreground"
                  )}
                >
                  {item.trend.charAt(0).toUpperCase() + item.trend.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}



