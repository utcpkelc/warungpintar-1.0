"use client";

import { useEffect, useState } from "react";
import {
  IconTrendingDown,
  IconTrendingUp,
  IconBox,
  IconUsers,
  IconCash,
  IconShoppingCart,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

type Stats = {
  today: { revenue: number; orders: number };
  month: { revenue: number; orders: number };
  lastMonth: { revenue: number; orders: number };
  counts: { products: number; customers: number };
  lowStock: Array<{
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
  }>;
  dailySales: Array<{ day: string; revenue: number; orders: number }>;
  topProducts: Array<{
    productId: string | null;
    productName: string;
    qty: number;
    revenue: number;
  }>;
};

function pctChange(current: number, previous: number) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function OverviewCards({ stats }: { stats: Stats | null }) {
  const monthChange = stats
    ? pctChange(stats.month.revenue, stats.lastMonth.revenue)
    : 0;
  const ordersChange = stats
    ? pctChange(stats.month.orders, stats.lastMonth.orders)
    : 0;

  const trendUp = monthChange >= 0;
  const ordersTrendUp = ordersChange >= 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today&apos;s Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats?.today.revenue ?? 0)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCash className="size-3" />
              {stats?.today.orders ?? 0} orders
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Today&apos;s sales activity
          </div>
          <div className="text-muted-foreground">
            Revenue collected so far today
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Monthly Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats?.month.revenue ?? 0)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {trendUp ? (
                <IconTrendingUp className="size-3" />
              ) : (
                <IconTrendingDown className="size-3" />
              )}
              {monthChange.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {trendUp ? "Trending up" : "Trending down"} vs last month
          </div>
          <div className="text-muted-foreground">
            Compared with last month&apos;s revenue
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Orders this Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.month.orders ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {ordersTrendUp ? (
                <IconTrendingUp className="size-3" />
              ) : (
                <IconTrendingDown className="size-3" />
              )}
              {ordersChange.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconShoppingCart className="size-4" />
            Total orders this month
          </div>
          <div className="text-muted-foreground">
            Across all completed sales
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Catalog</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.counts.products ?? 0} products
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-3" />
              {stats?.counts.customers ?? 0} customers
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconBox className="size-4" />
            {stats?.lowStock.length ?? 0} low-stock items
          </div>
          <div className="text-muted-foreground">
            Restock soon to avoid stockouts
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export function useDashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/dashboard/stats", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load stats");
        const json = (await res.json()) as Stats;
        if (!cancelled) setStats(json);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading };
}
