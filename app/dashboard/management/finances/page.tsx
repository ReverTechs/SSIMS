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
import { PiggyBank, TrendingUp, Wallet } from "lucide-react";

const funds = [
  {
    id: "FIN-01",
    name: "Tuition Term 3",
    budget: "MK 48M",
    collected: "72%",
    owner: "Finance Desk",
    status: "Open",
  },
  {
    id: "FIN-02",
    name: "Library Upgrade",
    budget: "MK 8M",
    collected: "64%",
    owner: "Projects",
    status: "Pending approval",
  },
  {
    id: "FIN-03",
    name: "Feeding Programme",
    budget: "MK 12M",
    collected: "58%",
    owner: "Welfare",
    status: "Open",
  },
];

export default function ManagementFinancesPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Collections this term",
            value: "MK 32M",
            description: "72% of expected inflows",
            icon: Wallet,
          },
          {
            label: "Expenses committed",
            value: "MK 21M",
            description: "Across 5 active projects",
            icon: PiggyBank,
          },
          {
            label: "Approvals pending",
            value: "6",
            description: "Awaiting finance head sign-off",
            icon: TrendingUp,
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
          <CardTitle>Adjust budget line</CardTitle>
          <CardDescription>
            Update allocations, approvals, or ledger codes instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Vote head</label>
            <Input placeholder="e.g. Tuition collections" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Current cap (MWK)</label>
            <Input type="number" className="mt-1" placeholder="5000000" />
          </div>
          <div>
            <label className="text-sm font-medium">Effective date</label>
            <Input type="date" className="mt-1" />
          </div>
          <div className="md:col-span-3 flex flex-col gap-3 md:flex-row">
            <Button className="w-full md:w-auto">Submit adjustment</Button>
            <Button variant="outline" className="w-full md:w-auto">
              Download as PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funding streams</CardTitle>
          <CardDescription>
            Track progress, approvals, and take action on each line.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Line item</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funds.map((fund) => (
                <TableRow key={fund.id}>
                  <TableCell className="font-medium">{fund.id}</TableCell>
                  <TableCell>{fund.name}</TableCell>
                  <TableCell>{fund.budget}</TableCell>
                  <TableCell>{fund.collected}</TableCell>
                  <TableCell>{fund.owner}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        fund.status === "Open"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }
                    >
                      {fund.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update funding line</DialogTitle>
                            <DialogDescription>
                              Modify allocation for {fund.name}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">
                                Budget figure
                              </label>
                              <Input defaultValue={fund.budget.replace("MK ", "")} />
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Status
                              </label>
                              <Input defaultValue={fund.status} />
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
                            Close line
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Close funding line</DialogTitle>
                            <DialogDescription>
                              Confirm closing {fund.name}. This archives the
                              stream and releases unspent funds.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button variant="destructive">Confirm</Button>
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

