import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { sale, saleItem } from "@/db/schema/warung";
import { requireUser } from "@/lib/session";
import { notFound, unauthorized } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await params;

  const [item] = await db
    .select()
    .from(sale)
    .where(and(eq(sale.id, id), eq(sale.ownerId, user.id)))
    .limit(1);
  if (!item) return notFound("Sale not found");

  const items = await db
    .select()
    .from(saleItem)
    .where(eq(saleItem.saleId, id));

  return NextResponse.json({ sale: item, items });
}
