"use client";

import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconShoppingCart,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  OverviewCards,
  useDashboardStats,
} from "@/components/dashboard/overview-cards";
import { SalesAreaChart } from "@/components/dashboard/sales-chart";
import { formatCurrency } from "@/lib/format";

export default function DashboardPage() {
  const { stats, loading } = useDashboardStats();

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <OverviewCards stats={stats} />

        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SalesAreaChart data={stats?.dailySales ?? []} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top products this month</CardTitle>
              <CardDescription>By units sold</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : !stats?.topProducts.length ? (
                <div className="text-sm text-muted-foreground">
                  No sales yet. Record a sale to see your bestsellers.
                </div>
              ) : (
                <ul className="space-y-3">
                  {stats.topProducts.map((p, idx) => (
                    <li
                      key={p.productId ?? p.productName}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-medium leading-tight">
                            {p.productName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {p.qty} sold
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium tabular-nums">
                        {formatCurrency(p.revenue)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IconAlertTriangle className="size-5 text-amber-500" />
                  Low stock alerts
                </CardTitle>
                <CardDescription>
                  Products at or below their threshold
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/products">
                  Manage
                  <IconArrowRight className="size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : !stats?.lowStock.length ? (
                <div className="text-sm text-muted-foreground">
                  All products are above their low-stock threshold. Nice!
                </div>
              ) : (
                <ul className="divide-y">
                  {stats.lowStock.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="font-medium">{p.name}</div>
                      <Badge variant="destructive">
                        {p.stock} / {p.lowStockThreshold} {p.stock === 0 && "· out"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Run your shop in seconds</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/dashboard/sales/new">
                  <IconShoppingCart className="size-4" />
                  Record a sale
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/products/new">Add product</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/customers">Manage customers</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/dashboard/reports">View reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
