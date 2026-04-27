import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  product as productTable,
  sale,
  saleItem,
  stockMovement,
} from "@/db/schema/warung";
import { requireUser } from "@/lib/session";
import {
  badRequest,
  generateId,
  generateInvoiceNumber,
  unauthorized,
} from "@/lib/api";

const saleItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0).optional(),
});

const saleInputSchema = z.object({
  customerId: z.string().optional().nullable(),
  paymentMethod: z
    .enum(["cash", "qris", "transfer", "ewallet", "credit"])
    .default("cash"),
  discount: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  amountPaid: z.coerce.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1),
});

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = Math.min(
    Math.max(parseInt(limitParam || "50", 10) || 50, 1),
    200,
  );

  const items = await db
    .select()
    .from(sale)
    .where(eq(sale.ownerId, user.id))
    .orderBy(desc(sale.createdAt))
    .limit(limit);

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = saleInputSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid input", parsed.error.flatten());
  }
  const data = parsed.data;

  const productIds = Array.from(new Set(data.items.map((i) => i.productId)));
  const products = await db
    .select()
    .from(productTable)
    .where(
      and(
        eq(productTable.ownerId, user.id),
        sql`${productTable.id} = ANY(${productIds})`,
      ),
    );

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of data.items) {
    const p = productMap.get(item.productId);
    if (!p) {
      return badRequest(`Product ${item.productId} not found`);
    }
    if (p.stock < item.quantity) {
      return badRequest(
        `Not enough stock for "${p.name}" (available: ${p.stock})`,
      );
    }
  }

  let subtotal = 0;
  const computedItems = data.items.map((item) => {
    const p = productMap.get(item.productId)!;
    const unitPrice =
      item.unitPrice !== undefined ? item.unitPrice : Number(p.sellingPrice);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    return {
      productId: p.id,
      productName: p.name,
      unitPrice,
      quantity: item.quantity,
      lineTotal,
    };
  });

  const total = Math.max(0, subtotal - data.discount + data.tax);
  const amountPaid = data.amountPaid ?? total;

  const saleId = generateId("sale");
  const invoiceNumber = generateInvoiceNumber();

  const result = await db.transaction(async (tx) => {
    const [createdSale] = await tx
      .insert(sale)
      .values({
        id: saleId,
        ownerId: user.id,
        customerId: data.customerId || null,
        invoiceNumber,
        status: "completed",
        paymentMethod: data.paymentMethod,
        subtotal: subtotal.toFixed(2),
        discount: data.discount.toFixed(2),
        tax: data.tax.toFixed(2),
        total: total.toFixed(2),
        amountPaid: amountPaid.toFixed(2),
        notes: data.notes || null,
      })
      .returning();

    const insertedItems = await tx
      .insert(saleItem)
      .values(
        computedItems.map((item) => ({
          id: generateId("si"),
          saleId,
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice.toFixed(2),
          quantity: item.quantity,
          lineTotal: item.lineTotal.toFixed(2),
        })),
      )
      .returning();

    for (const item of computedItems) {
      await tx
        .update(productTable)
        .set({
          stock: sql`${productTable.stock} - ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(productTable.id, item.productId));

      await tx.insert(stockMovement).values({
        id: generateId("mv"),
        ownerId: user.id,
        productId: item.productId,
        type: "sale",
        quantity: -item.quantity,
        reference: invoiceNumber,
      });
    }

    return { sale: createdSale, items: insertedItems };
  });

  return NextResponse.json(result, { status: 201 });
}
