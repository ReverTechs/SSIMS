import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export default function CalendarPage() {
  const events = [
    {
      id: "1",
      title: "End of Term Examinations",
      date: "2024-03-15",
      type: "exam",
      description: "Term 1 examinations begin",
    },
    {
      id: "2",
      title: "Parent-Teacher Meeting",
      date: "2024-03-20",
      type: "meeting",
      description: "Annual parent-teacher meeting at 2:00 PM",
    },
    {
      id: "3",
      title: "Independence Day",
      date: "2024-07-06",
      type: "holiday",
      description: "National holiday - school closed",
    },
    {
      id: "4",
      title: "Sports Day",
      date: "2024-04-15",
      type: "event",
      description: "Annual school sports day",
    },
    {
      id: "5",
      title: "Mid-Term Break",
      date: "2024-05-01",
      type: "holiday",
      description: "Mid-term break - school closed",
    },
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-red-500";
      case "holiday":
        return "bg-blue-500";
      case "event":
        return "bg-green-500";
      case "meeting":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "exam":
        return "Exam";
      case "holiday":
        return "Holiday";
      case "event":
        return "Event";
      case "meeting":
        return "Meeting";
      default:
        return type;
    }
  };

  // Group events by month
  const eventsByMonth = events.reduce((acc, event) => {
    const date = new Date(event.date);
    const monthKey = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">School Calendar</h1>
        <p className="text-muted-foreground">
          View important dates and events for the academic year
        </p>
      </div>

      {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
        <Card key={month}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {month}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col items-center min-w-[60px]">
                    <div className="text-2xl font-bold">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleString("default", {
                        month: "short",
                      })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge
                        className={getEventTypeColor(event.type)}
                        variant="default"
                      >
                        {getEventTypeLabel(event.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}





