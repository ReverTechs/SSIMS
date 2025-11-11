import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { CreateAnnouncementDialog } from "@/components/announcements/create-announcement-dialog";
import { hasPermission } from "@/lib/auth/authz";

export default async function AnnouncementsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  const hasCreatePermission = hasPermission(user, "announcements:create");
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
        {hasCreatePermission && <CreateAnnouncementDialog />}
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





