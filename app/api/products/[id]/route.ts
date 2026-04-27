import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { product } from "@/db/schema/warung";
import { requireUser } from "@/lib/session";
import { badRequest, notFound, unauthorized } from "@/lib/api";

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  unit: z.string().min(1).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  sellingPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  imageUrl: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await params;

  const [item] = await db
    .select()
    .from(product)
    .where(and(eq(product.id, id), eq(product.ownerId, user.id)))
    .limit(1);

  if (!item) return notFound("Product not found");
  return NextResponse.json({ item });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid input", parsed.error.flatten());
  }

  const data = parsed.data;
  const updateValues: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateValues.name = data.name;
  if (data.sku !== undefined) updateValues.sku = data.sku || null;
  if (data.description !== undefined)
    updateValues.description = data.description || null;
  if (data.categoryId !== undefined)
    updateValues.categoryId = data.categoryId || null;
  if (data.unit !== undefined) updateValues.unit = data.unit;
  if (data.costPrice !== undefined)
    updateValues.costPrice = data.costPrice.toFixed(2);
  if (data.sellingPrice !== undefined)
    updateValues.sellingPrice = data.sellingPrice.toFixed(2);
  if (data.stock !== undefined) updateValues.stock = data.stock;
  if (data.lowStockThreshold !== undefined)
    updateValues.lowStockThreshold = data.lowStockThreshold;
  if (data.imageUrl !== undefined)
    updateValues.imageUrl = data.imageUrl || null;

  const [updated] = await db
    .update(product)
    .set(updateValues)
    .where(and(eq(product.id, id), eq(product.ownerId, user.id)))
    .returning();

  if (!updated) return notFound("Product not found");
  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await params;

  const [deleted] = await db
    .delete(product)
    .where(and(eq(product.id, id), eq(product.ownerId, user.id)))
    .returning();

  if (!deleted) return notFound("Product not found");
  return NextResponse.json({ ok: true });
}
