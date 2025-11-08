"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";

export default function AcademicSettingsPage() {
  const [academicYear, setAcademicYear] = useState("2024");
  const [currentTerm, setCurrentTerm] = useState("term1");
  const [term1Start, setTerm1Start] = useState("2024-01-15");
  const [term1End, setTerm1End] = useState("2024-04-15");
  const [term2Start, setTerm2Start] = useState("2024-05-01");
  const [term2End, setTerm2End] = useState("2024-08-15");
  const [term3Start, setTerm3Start] = useState("2024-09-01");
  const [term3End, setTerm3End] = useState("2024-12-15");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">("idle");

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Year & Term</h1>
        <p className="text-muted-foreground">
          Manage academic year and term settings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Academic Settings</CardTitle>
            <CardDescription>
              Configure the current academic year and term
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="academic-year">Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger id="academic-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-term">Current Term</Label>
              <Select value={currentTerm} onValueChange={setCurrentTerm}>
                <SelectTrigger id="current-term">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term1">Term 1</SelectItem>
                  <SelectItem value="term2">Term 2</SelectItem>
                  <SelectItem value="term3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {saveStatus === "success" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Academic settings saved successfully!
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveStatus === "saving" ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Term Dates</CardTitle>
            <CardDescription>
              Set start and end dates for each term
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Term 1</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="term1-start" className="text-xs">Start Date</Label>
                  <Input
                    id="term1-start"
                    type="date"
                    value={term1Start}
                    onChange={(e) => setTerm1Start(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="term1-end" className="text-xs">End Date</Label>
                  <Input
                    id="term1-end"
                    type="date"
                    value={term1End}
                    onChange={(e) => setTerm1End(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Term 2</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="term2-start" className="text-xs">Start Date</Label>
                  <Input
                    id="term2-start"
                    type="date"
                    value={term2Start}
                    onChange={(e) => setTerm2Start(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="term2-end" className="text-xs">End Date</Label>
                  <Input
                    id="term2-end"
                    type="date"
                    value={term2End}
                    onChange={(e) => setTerm2End(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Term 3</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="term3-start" className="text-xs">Start Date</Label>
                  <Input
                    id="term3-start"
                    type="date"
                    value={term3Start}
                    onChange={(e) => setTerm3Start(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="term3-end" className="text-xs">End Date</Label>
                  <Input
                    id="term3-end"
                    type="date"
                    value={term3End}
                    onChange={(e) => setTerm3End(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



