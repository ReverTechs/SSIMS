import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  CalendarDays,
  CalendarPlus,
  Clock,
  Edit3,
  Trash2,
} from "lucide-react";

const events = [
  {
    id: "EVT-2024-01",
    title: "Mock Examinations",
    date: "12 Oct 2025",
    owner: "Academics",
    status: "Published",
  },
  {
    id: "EVT-2024-02",
    title: "Parent & Teacher Conference",
    date: "22 Oct 2025",
    owner: "Administration",
    status: "Draft",
  },
  {
    id: "EVT-2024-03",
    title: "Sports Day",
    date: "30 Oct 2025",
    owner: "Sports Desk",
    status: "Published",
  },
];

export default function ManagementCalendarPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Live events",
            value: "12",
            description: "Visible across the dashboard",
            icon: CalendarDays,
          },
          {
            label: "Awaiting approval",
            value: "4",
            description: "Draft events needing review",
            icon: Clock,
          },
          {
            label: "Templates ready",
            value: "8",
            description: "Reusable term date presets",
            icon: CalendarPlus,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border border-border/60 bg-card/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{item.label}</CardDescription>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-semibold">
                  {item.value}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create or schedule event</CardTitle>
          <CardDescription>
            Publish instantly or save as draft for your leadership team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Event name</label>
              <Input placeholder="e.g. Form 4 Graduation" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Target date</label>
              <Input type="date" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Share agenda, logistics, or reminders…"
              className="mt-1"
            />
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <Button className="w-full md:w-auto">Publish event</Button>
            <Button variant="outline" className="w-full md:w-auto">
              Save as draft
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming events</CardTitle>
          <CardDescription>
            Edit, duplicate, or retire entries with one click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.id}</TableCell>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>{event.owner}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        event.status === "Published"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }
                    >
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit3 className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit event</DialogTitle>
                            <DialogDescription>
                              Update the details for {event.title}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">
                                Event name
                              </label>
                              <Input defaultValue={event.title} />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Date</label>
                              <Input type="date" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button>Save changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete event</DialogTitle>
                            <DialogDescription>
                              Deleting {event.title} removes it from the calendar.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button variant="destructive">Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
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

