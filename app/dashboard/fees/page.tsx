import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Download } from "lucide-react";

export default function FeesPage() {
  const fees = [
    {
      id: "1",
      description: "Term 1 Tuition Fees",
      amount: 50000,
      paid: 50000,
      balance: 0,
      dueDate: "2024-01-31",
      status: "paid" as const,
    },
    {
      id: "2",
      description: "Term 2 Tuition Fees",
      amount: 50000,
      paid: 35000,
      balance: 15000,
      dueDate: "2024-04-30",
      status: "partial" as const,
    },
    {
      id: "3",
      description: "Term 3 Tuition Fees",
      amount: 50000,
      paid: 0,
      balance: 50000,
      dueDate: "2024-07-31",
      status: "unpaid" as const,
    },
    {
      id: "4",
      description: "Library Fees",
      amount: 5000,
      paid: 5000,
      balance: 0,
      dueDate: "2024-02-15",
      status: "paid" as const,
    },
  ];

  const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paid, 0);
  const totalBalance = fees.reduce((sum, fee) => sum + fee.balance, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500">Partial</Badge>;
      case "unpaid":
        return <Badge className="bg-red-500">Unpaid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `MK ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fees</h1>
        <p className="text-muted-foreground">
          View your fee balance and payment history
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              For academic year 2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalPaid / totalAmount) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Due for payment
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Details</CardTitle>
          <CardDescription>
            Complete breakdown of all fees and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">
                    {fee.description}
                  </TableCell>
                  <TableCell>{formatCurrency(fee.amount)}</TableCell>
                  <TableCell className="text-green-600">
                    {formatCurrency(fee.paid)}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {formatCurrency(fee.balance)}
                  </TableCell>
                  <TableCell>
                    {new Date(fee.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(fee.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Receipts</CardTitle>
          <CardDescription>
            Download receipts for your payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fees
              .filter((fee) => fee.paid > 0)
              .map((fee) => (
                <div
                  key={fee.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{fee.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Paid: {formatCurrency(fee.paid)} on{" "}
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





