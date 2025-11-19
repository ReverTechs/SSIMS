import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import BigCalendar from "@/components/dashboard/big-calendar";

export default function TimetablePage() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const timetable = {
    Monday: [
      {
        period: 1,
        subject: "Mathematics",
        teacher: "Mr. Banda",
        time: "08:00-09:00",
        room: "Room 101",
      },
      {
        period: 2,
        subject: "English",
        teacher: "Mrs. Mwale",
        time: "09:00-10:00",
        room: "Room 102",
      },
      {
        period: 3,
        subject: "Physics",
        teacher: "Mr. Phiri",
        time: "10:30-11:30",
        room: "Lab 1",
      },
      {
        period: 4,
        subject: "Chemistry",
        teacher: "Mrs. Kachale",
        time: "11:30-12:30",
        room: "Lab 2",
      },
      {
        period: 5,
        subject: "Biology",
        teacher: "Mr. Mbewe",
        time: "14:00-15:00",
        room: "Room 103",
      },
    ],
    Tuesday: [
      {
        period: 1,
        subject: "English",
        teacher: "Mrs. Mwale",
        time: "08:00-09:00",
        room: "Room 102",
      },
      {
        period: 2,
        subject: "Mathematics",
        teacher: "Mr. Banda",
        time: "09:00-10:00",
        room: "Room 101",
      },
      {
        period: 3,
        subject: "History",
        teacher: "Mr. Jere",
        time: "10:30-11:30",
        room: "Room 104",
      },
      {
        period: 4,
        subject: "Geography",
        teacher: "Mrs. Tembo",
        time: "11:30-12:30",
        room: "Room 105",
      },
      {
        period: 5,
        subject: "Physical Education",
        teacher: "Mr. Ngoma",
        time: "14:00-15:00",
        room: "Field",
      },
    ],
    Wednesday: [
      {
        period: 1,
        subject: "Physics",
        teacher: "Mr. Phiri",
        time: "08:00-09:00",
        room: "Lab 1",
      },
      {
        period: 2,
        subject: "Chemistry",
        teacher: "Mrs. Kachale",
        time: "09:00-10:00",
        room: "Lab 2",
      },
      {
        period: 3,
        subject: "Mathematics",
        teacher: "Mr. Banda",
        time: "10:30-11:30",
        room: "Room 101",
      },
      {
        period: 4,
        subject: "English",
        teacher: "Mrs. Mwale",
        time: "11:30-12:30",
        room: "Room 102",
      },
      {
        period: 5,
        subject: "Computer Studies",
        teacher: "Mr. Msiska",
        time: "14:00-15:00",
        room: "Lab 3",
      },
    ],
    Thursday: [
      {
        period: 1,
        subject: "Biology",
        teacher: "Mr. Mbewe",
        time: "08:00-09:00",
        room: "Room 103",
      },
      {
        period: 2,
        subject: "Mathematics",
        teacher: "Mr. Banda",
        time: "09:00-10:00",
        room: "Room 101",
      },
      {
        period: 3,
        subject: "English",
        teacher: "Mrs. Mwale",
        time: "10:30-11:30",
        room: "Room 102",
      },
      {
        period: 4,
        subject: "Physics",
        teacher: "Mr. Phiri",
        time: "11:30-12:30",
        room: "Lab 1",
      },
      {
        period: 5,
        subject: "Chemistry",
        teacher: "Mrs. Kachale",
        time: "14:00-15:00",
        room: "Lab 2",
      },
    ],
    Friday: [
      {
        period: 1,
        subject: "English",
        teacher: "Mrs. Mwale",
        time: "08:00-09:00",
        room: "Room 102",
      },
      {
        period: 2,
        subject: "Mathematics",
        teacher: "Mr. Banda",
        time: "09:00-10:00",
        room: "Room 101",
      },
      {
        period: 3,
        subject: "Biology",
        teacher: "Mr. Mbewe",
        time: "10:30-11:30",
        room: "Room 103",
      },
      {
        period: 4,
        subject: "History",
        teacher: "Mr. Jere",
        time: "11:30-12:30",
        room: "Room 104",
      },
      {
        period: 5,
        subject: "Assembly",
        teacher: "All Staff",
        time: "14:00-15:00",
        room: "Hall",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">School Timetable</h1>
        <p className="text-muted-foreground">
          View your class schedule for the week
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form 4A Timetable</CardTitle>
          <CardDescription>Weekly schedule for all subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Monday" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {days.map((day) => (
                <TabsTrigger key={day} value={day}>
                  {day.slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>

            {days.map((day) => (
              <TabsContent key={day} value={day} className="mt-4">
                <div className="space-y-3">
                  {timetable[day as keyof typeof timetable].map((item) => (
                    <div
                      key={item.period}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold">
                        {item.period}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.subject}</h3>
                          <Badge variant="outline">{item.room}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{item.teacher}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      <BigCalendar />
    </div>
  );
}
