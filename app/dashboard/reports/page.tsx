"use client";

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
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from "@/components/dashboard/overview-cards";
import { SalesAreaChart } from "@/components/dashboard/sales-chart";
import { formatCurrency } from "@/lib/format";

export default function ReportsPage() {
  const { stats, loading } = useDashboardStats();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-semibold">Reports</h2>
        <p className="text-sm text-muted-foreground">
          Business insights for your warung
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Today</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatCurrency(stats?.today.revenue ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {stats?.today.orders ?? 0} orders today
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>This month</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatCurrency(stats?.month.revenue ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {stats?.month.orders ?? 0} orders this month
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Last month</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatCurrency(stats?.lastMonth.revenue ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {stats?.lastMonth.orders ?? 0} orders last month
          </CardContent>
        </Card>
      </div>

      <SalesAreaChart data={stats?.dailySales ?? []} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top products this month</CardTitle>
            <CardDescription>By units sold</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : !stats?.topProducts.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No sales recorded this month yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.topProducts.map((p) => (
                    <TableRow key={p.productId ?? p.productName}>
                      <TableCell className="font-medium">
                        {p.productName}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {p.qty}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(p.revenue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Threshold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : !stats?.lowStock.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      All products are above their threshold.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.lowStock.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">{p.stock}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {p.lowStockThreshold}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
