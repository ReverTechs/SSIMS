import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Bug, Gauge, Server } from "lucide-react";

export default function SystemReportsPage() {
  const systemErrors = [
    {
      id: "1",
      type: "Performance",
      description: "Slow page load times on grades page",
      severity: "medium",
      reportedAt: "2024-03-01",
      status: "open",
    },
    {
      id: "2",
      type: "Bug",
      description: "Calendar events not displaying correctly",
      severity: "high",
      reportedAt: "2024-02-28",
      status: "in-progress",
    },
    {
      id: "3",
      type: "Performance",
      description: "Database query timeout on student search",
      severity: "high",
      reportedAt: "2024-02-25",
      status: "resolved",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500";
      case "in-progress":
        return "bg-yellow-500";
      case "open":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Bug":
        return <Bug className="h-4 w-4" />;
      case "Performance":
        return <Gauge className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          System Reports & Errors
        </h1>
        <p className="text-muted-foreground">
          Report system errors and monitor performance issues
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <CardTitle>Report System Error</CardTitle>
            </div>
            <CardDescription>
              Report bugs, performance issues, or system errors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="errorType">Error Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select error type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="performance">Performance Issue</SelectItem>
                  <SelectItem value="security">Security Concern</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the error or issue in detail..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="steps">Steps to Reproduce (if applicable)</Label>
              <Textarea
                id="steps"
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                rows={3}
              />
            </div>
            <Button className="w-full">
              <AlertCircle className="h-4 w-4 mr-2" />
              Submit Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>
              Current system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Uptime</span>
                <span className="text-sm font-semibold">99.9%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[99.9%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <span className="text-sm font-semibold">120ms</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[95%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Performance</span>
                <span className="text-sm font-semibold">Excellent</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[98%]" />
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">247</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reported Issues</CardTitle>
          <CardDescription>
            All system errors and performance issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemErrors.map((error) => (
                <TableRow key={error.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(error.type)}
                      <span>{error.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">{error.description}</TableCell>
                  <TableCell>
                    <Badge
                      className={getSeverityColor(error.severity)}
                      variant="default"
                    >
                      {error.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(error.reportedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(error.status)}
                      variant="default"
                    >
                      {error.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

