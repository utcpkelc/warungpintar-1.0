import { NextResponse } from "next/server";
import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import {
  customer,
  product,
  sale,
  saleItem,
} from "@/db/schema/warung";
import { requireUser } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const start30DaysAgo = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
  start30DaysAgo.setHours(0, 0, 0, 0);

  const [todayAgg] = await db
    .select({
      revenue: sum(sale.total),
      orders: count(sale.id),
    })
    .from(sale)
    .where(
      and(
        eq(sale.ownerId, user.id),
        eq(sale.status, "completed"),
        gte(sale.createdAt, startOfToday),
      ),
    );

  const [monthAgg] = await db
    .select({
      revenue: sum(sale.total),
      orders: count(sale.id),
    })
    .from(sale)
    .where(
      and(
        eq(sale.ownerId, user.id),
        eq(sale.status, "completed"),
        gte(sale.createdAt, startOfMonth),
      ),
    );

  const [lastMonthAgg] = await db
    .select({
      revenue: sum(sale.total),
      orders: count(sale.id),
    })
    .from(sale)
    .where(
      and(
        eq(sale.ownerId, user.id),
        eq(sale.status, "completed"),
        gte(sale.createdAt, startOfLastMonth),
        lte(sale.createdAt, endOfLastMonth),
      ),
    );

  const [productCount] = await db
    .select({ count: count(product.id) })
    .from(product)
    .where(eq(product.ownerId, user.id));

  const [customerCount] = await db
    .select({ count: count(customer.id) })
    .from(customer)
    .where(eq(customer.ownerId, user.id));

  const lowStockProducts = await db
    .select()
    .from(product)
    .where(
      and(
        eq(product.ownerId, user.id),
        sql`${product.stock} <= ${product.lowStockThreshold}`,
      ),
    )
    .orderBy(product.stock)
    .limit(5);

  const dailySales = await db
    .select({
      day: sql<string>`to_char(${sale.createdAt}, 'YYYY-MM-DD')`,
      revenue: sql<string>`COALESCE(SUM(${sale.total}), 0)`,
      orders: count(sale.id),
    })
    .from(sale)
    .where(
      and(
        eq(sale.ownerId, user.id),
        eq(sale.status, "completed"),
        gte(sale.createdAt, start30DaysAgo),
      ),
    )
    .groupBy(sql`to_char(${sale.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${sale.createdAt}, 'YYYY-MM-DD')`);

  const topProducts = await db
    .select({
      productId: saleItem.productId,
      productName: saleItem.productName,
      qty: sql<string>`COALESCE(SUM(${saleItem.quantity}), 0)`,
      revenue: sql<string>`COALESCE(SUM(${saleItem.lineTotal}), 0)`,
    })
    .from(saleItem)
    .innerJoin(sale, eq(saleItem.saleId, sale.id))
    .where(
      and(
        eq(sale.ownerId, user.id),
        eq(sale.status, "completed"),
        gte(sale.createdAt, startOfMonth),
      ),
    )
    .groupBy(saleItem.productId, saleItem.productName)
    .orderBy(desc(sql`SUM(${saleItem.quantity})`))
    .limit(5);

  return NextResponse.json({
    today: {
      revenue: Number(todayAgg?.revenue ?? 0),
      orders: Number(todayAgg?.orders ?? 0),
    },
    month: {
      revenue: Number(monthAgg?.revenue ?? 0),
      orders: Number(monthAgg?.orders ?? 0),
    },
    lastMonth: {
      revenue: Number(lastMonthAgg?.revenue ?? 0),
      orders: Number(lastMonthAgg?.orders ?? 0),
    },
    counts: {
      products: Number(productCount?.count ?? 0),
      customers: Number(customerCount?.count ?? 0),
    },
    lowStock: lowStockProducts,
    dailySales: dailySales.map((d) => ({
      day: d.day,
      revenue: Number(d.revenue),
      orders: Number(d.orders),
    })),
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      qty: Number(p.qty),
      revenue: Number(p.revenue),
    })),
  });
}
