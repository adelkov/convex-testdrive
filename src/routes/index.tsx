import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper function to format month for display
const formatMonthDisplay = (month: string) => {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

// Helper function to format currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    month: (search.month as string) || '',
    filter: (search.filter as "ALL" | "IN" | "OUT") || "ALL",
  }),
  component: TransactionDashboard,
})

function TransactionDashboard() {
  const navigate = useNavigate({ from: '/' });
  const { month, filter } = Route.useSearch();

  // Queries
  const availableMonths = useQuery(api.transactionts.getAvailableMonths, {});
  
  // Auto-select most recent available month when data loads and no month in URL
  useEffect(() => {
    if (availableMonths && availableMonths.length > 0 && !month) {
      // availableMonths is sorted newest first, so take the first one
      navigate({
        search: { month: availableMonths[0], filter }
      });
    }
  }, [availableMonths, month, filter, navigate]);

  // Only query when we have a selected month
  const monthSummary = useQuery(api.transactionts.getMonthSummary, 
    month ? { month } : "skip"
  );
  
  // Only query based on current filter for better caching
  const allTransactions = useQuery(api.transactionts.listTransactionsByMonth, 
    filter === "ALL" && month ? { month } : "skip"
  );
  
  const filteredTransactions = useQuery(api.transactionts.listTransactionsByMonthAndDirection, 
    (filter === "IN" || filter === "OUT") && month ? { 
      month, 
      direction: filter as "IN" | "OUT" 
    } : "skip"
  );
  
  const transactions = filter === "ALL" ? allTransactions : filteredTransactions;

  // Month navigation
  const navigateMonth = (direction: "prev" | "next") => {
    if (!availableMonths || !month) return;
    
    const currentIndex = availableMonths.indexOf(month);
    if (direction === "prev" && currentIndex < availableMonths.length - 1) {
      navigate({
        search: { month: availableMonths[currentIndex + 1], filter }
      });
    } else if (direction === "next" && currentIndex > 0) {
      navigate({
        search: { month: availableMonths[currentIndex - 1], filter }
      });
    }
  };

  // Filter change
  const handleFilterChange = (value: string) => {
    const newFilter = value as "ALL" | "IN" | "OUT";
    navigate({
      search: { month, filter: newFilter }
    });
  };

  // Month change
  const handleMonthChange = (newMonth: string) => {
    navigate({
      search: { month: newMonth, filter }
    });
  };

  return (
    <>
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <SignedOut>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Transaction Dashboard</h1>
              <div className="flex gap-3">
                <SignInButton mode="modal">
                  <Button variant="outline">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Sign Up</Button>
                </SignUpButton>
              </div>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">Transaction Dashboard</h1>
                <Badge variant="secondary">Month by Month</Badge>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <SignedOut>
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Transaction Dashboard</CardTitle>
                <CardDescription>
                  Please sign in to view your transactions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </SignedOut>

        <SignedIn>
          {!month ? (
            <div className="text-center py-12">
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Loading your transaction history...</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Month Navigation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Timeline: {formatMonthDisplay(month)}
                      </CardTitle>
                      <CardDescription>
                        Navigate through your transaction history month by month
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigateMonth("prev")}
                        disabled={!availableMonths || availableMonths.indexOf(month) >= availableMonths.length - 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <Select value={month} onValueChange={handleMonthChange}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMonths?.map((availableMonth) => (
                            <SelectItem key={availableMonth} value={availableMonth}>
                              {formatMonthDisplay(availableMonth)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigateMonth("next")}
                        disabled={!availableMonths || availableMonths.indexOf(month) <= 0}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Month Summary */}
                {monthSummary && (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{monthSummary.totalTransactions}</p>
                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <p className="text-2xl font-bold text-green-600">{monthSummary.incomingCount}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Incoming</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <p className="text-2xl font-bold text-red-600">{monthSummary.outgoingCount}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Outgoing</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Minus className="h-4 w-4 text-gray-600" />
                          <p className="text-2xl font-bold text-gray-600">{monthSummary.neutralCount}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Neutral</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Transactions Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Transactions</CardTitle>
                      <CardDescription>
                        All transactions for {formatMonthDisplay(month)}
                      </CardDescription>
                    </div>
                    {transactions !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {!transactions ? "Loading..." : `${transactions.length} loaded`}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={filter} onValueChange={handleFilterChange}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="ALL">All Transactions</TabsTrigger>
                      <TabsTrigger value="IN" className="text-green-600">Incoming</TabsTrigger>
                      <TabsTrigger value="OUT" className="text-red-600">Outgoing</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={filter} className="mt-6">
                      {!transactions ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Loading transactions...</p>
                        </div>
                      ) : transactions.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            No {filter.toLowerCase()} transactions found for {formatMonthDisplay(month)}
                          </p>
                        </div>
                      ) : (
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Direction</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {transactions.map((transaction) => (
                                <TableRow key={transaction._id}>
                                  <TableCell className="font-medium">
                                    {new Date(transaction.created_on).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={
                                        transaction.direction === "IN" ? "default" : 
                                        transaction.direction === "OUT" ? "destructive" : "secondary"
                                      }
                                      className={
                                        transaction.direction === "IN" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                                        transaction.direction === "OUT" ? "bg-red-100 text-red-800 hover:bg-red-200" : ""
                                      }
                                    >
                                      {transaction.direction === "IN" && <TrendingUp className="w-3 h-3 mr-1" />}
                                      {transaction.direction === "OUT" && <TrendingDown className="w-3 h-3 mr-1" />}
                                      {transaction.direction === "NEUTRAL" && <Minus className="w-3 h-3 mr-1" />}
                                      {transaction.direction}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{transaction.source_name || "-"}</TableCell>
                                  <TableCell>{transaction.target_name || "-"}</TableCell>
                                  <TableCell className="text-right font-mono">
                                    <div>
                                      {formatCurrency(transaction.target_amount, transaction.target_currency)}
                                    </div>
                                    {transaction.target_currency !== transaction.source_currency && (
                                      <div className="text-xs text-muted-foreground">
                                        from {formatCurrency(transaction.source_amount, transaction.source_currency)}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={transaction.status === "COMPLETED" ? "default" : "secondary"}>
                                      {transaction.status || "Unknown"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </SignedIn>
      </main>
    </>
  );
}