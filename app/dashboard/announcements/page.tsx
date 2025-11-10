"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Clock, Plus, Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    priority: "medium",
    expiresAt: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // Reset form and close dialog
    setFormData({
      title: "",
      content: "",
      author: "",
      priority: "medium",
      expiresAt: "",
    });
    setOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const announcements = [
    {
      id: "1",
      title: "End of Term Examinations",
      content:
        "Please be informed that end of term examinations will commence on March 15, 2024. All students are required to be present and prepared.",
      author: "Headteacher",
      createdAt: "2024-03-01",
      expiresAt: "2024-03-20",
      priority: "high",
    },
    {
      id: "2",
      title: "Parent-Teacher Meeting",
      content:
        "The annual parent-teacher meeting is scheduled for March 20, 2024, at 2:00 PM. All parents and guardians are encouraged to attend.",
      author: "Deputy Headteacher",
      createdAt: "2024-02-28",
      expiresAt: "2024-03-20",
      priority: "medium",
    },
    {
      id: "3",
      title: "Sports Day Registration",
      content:
        "Registration for the annual sports day is now open. Students interested in participating should register with their class teachers by March 10, 2024.",
      author: "Sports Coordinator",
      createdAt: "2024-02-25",
      expiresAt: "2024-03-10",
      priority: "low",
    },
    {
      id: "4",
      title: "Library Hours Extended",
      content:
        "The school library will now be open until 6:00 PM on weekdays to accommodate students who need extra study time.",
      author: "Librarian",
      createdAt: "2024-02-20",
      priority: "low",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest school news and announcements
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              <Plus className="h-4 w-4" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-semibold">Create New Announcement</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Share important information with the school community
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 -mr-2">
              <form id="announcement-form" onSubmit={handleSubmit} className="space-y-6 pb-6">
              <div className="space-y-5">
                {/* Title Field */}
                <div className="space-y-2.5">
                  <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                    <span>Title</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter announcement title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {/* Content Field */}
                <div className="space-y-2.5">
                  <Label htmlFor="content" className="text-sm font-medium flex items-center gap-2">
                    <span>Content</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Enter announcement details..."
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    required
                    rows={6}
                    className="w-full resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide clear and detailed information about the announcement
                  </p>
                </div>

                {/* Author and Priority Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Author Field */}
                  <div className="space-y-2.5">
                    <Label htmlFor="author" className="text-sm font-medium flex items-center gap-2">
                      <span>Author</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="author"
                      placeholder="e.g., Headteacher"
                      value={formData.author}
                      onChange={(e) => handleInputChange("author", e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>

                  {/* Priority Field */}
                  <div className="space-y-2.5">
                    <Label htmlFor="priority" className="text-sm font-medium flex items-center gap-2">
                      <span>Priority</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleInputChange("priority", value)}
                    >
                      <SelectTrigger id="priority" className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span>High</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            <span>Medium</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span>Low</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Expiration Date Field */}
                <div className="space-y-2.5">
                  <Label htmlFor="expiresAt" className="text-sm font-medium">
                    Expiration Date <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => handleInputChange("expiresAt", e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Set when this announcement should no longer be displayed
                  </p>
                </div>
              </div>
              </form>
            </div>
            <DialogFooter className="flex-shrink-0 gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="announcement-form"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Publish Announcement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>{announcement.title}</CardTitle>
                    <Badge
                      className={getPriorityColor(announcement.priority)}
                      variant="default"
                    >
                      {announcement.priority}
                    </Badge>
                  </div>
                  <CardDescription>
                    By {announcement.author} •{" "}
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed mb-4">
                {announcement.content}
              </p>
              {announcement.expiresAt && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}





