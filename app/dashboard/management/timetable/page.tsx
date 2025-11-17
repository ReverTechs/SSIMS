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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock4, RefreshCw, Shuffle, Trash2 } from "lucide-react";

const timetableSlots = [
  {
    day: "Monday",
    block: "08:00 - 09:20",
    subject: "Mathematics",
    classGroup: "Form 4A",
    room: "Lab 2",
    teacher: "Mr. Banda",
  },
  {
    day: "Monday",
    block: "09:30 - 10:50",
    subject: "English",
    classGroup: "Form 3B",
    room: "Room 12",
    teacher: "Mrs. Mwale",
  },
  {
    day: "Tuesday",
    block: "08:00 - 09:20",
    subject: "Physics",
    classGroup: "Form 4B",
    room: "Science Lab",
    teacher: "Mr. Phiri",
  },
];

export default function ManagementTimetablePage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Weekly blocks filled",
            value: "48 / 52",
            description: "Current timetable coverage",
          },
          {
            label: "Conflicts detected",
            value: "3",
            description: "Rooms or staff double-booked",
          },
          {
            label: "Pending swaps",
            value: "5",
            description: "Awaiting approval from HoDs",
          },
        ].map((item) => (
          <Card key={item.label} className="border border-border/60 bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {item.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.description}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Smart adjustments</CardTitle>
          <CardDescription>
            Swap allocations, free a teacher, or regenerate a block.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-lg border border-dashed p-4">
            <h3 className="text-base font-semibold">Swap subjects</h3>
            <p className="text-sm text-muted-foreground">
              Select two blocks to interchange instantly.
            </p>
            <Input placeholder="Type block ID" />
            <Input placeholder="Block to swap with" />
            <Button className="w-full" variant="outline">
              <Shuffle className="mr-2 h-4 w-4" />
              Request swap
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border border-dashed p-4">
            <h3 className="text-base font-semibold">Release teacher</h3>
            <p className="text-sm text-muted-foreground">
              Free-up a slot for meetings or interventions.
            </p>
            <Input placeholder="Teacher name" />
            <Input placeholder="Date or block" />
            <Button className="w-full" variant="outline">
              <Clock4 className="mr-2 h-4 w-4" />
              Hold slot
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border border-dashed p-4">
            <h3 className="text-base font-semibold">Regenerate block</h3>
            <p className="text-sm text-muted-foreground">
              Use AI suggestions to balance class loads.
            </p>
            <Input placeholder="e.g. Tuesday 08:00" />
            <Button className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timetable matrix</CardTitle>
          <CardDescription>
            Review and maintain every block with edit or delete controls.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timetableSlots.map((slot) => (
                <TableRow key={`${slot.day}-${slot.block}-${slot.classGroup}`}>
                  <TableCell>
                    <Badge variant="outline">{slot.day}</Badge>
                  </TableCell>
                  <TableCell>{slot.block}</TableCell>
                  <TableCell>{slot.subject}</TableCell>
                  <TableCell>{slot.classGroup}</TableCell>
                  <TableCell>{slot.room}</TableCell>
                  <TableCell>{slot.teacher}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Edit block
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit block</DialogTitle>
                            <DialogDescription>
                              Update allocation for {slot.classGroup}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">
                                Subject
                              </label>
                              <Input defaultValue={slot.subject} />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Room</label>
                              <Input defaultValue={slot.room} />
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
                            <DialogTitle>Delete block</DialogTitle>
                            <DialogDescription>
                              This removes the block for {slot.classGroup}. You
                              can regenerate it later.
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

