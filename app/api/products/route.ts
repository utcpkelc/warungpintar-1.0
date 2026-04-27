import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { product } from "@/db/schema/warung";
import { requireUser } from "@/lib/session";
import { badRequest, generateId, unauthorized } from "@/lib/api";

const productInputSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  unit: z.string().min(1).default("pcs"),
  costPrice: z.coerce.number().min(0).default(0),
  sellingPrice: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  imageUrl: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const search = req.nextUrl.searchParams.get("search")?.trim();

  const where = search
    ? and(
        eq(product.ownerId, user.id),
        or(
          ilike(product.name, `%${search}%`),
          ilike(product.sku, `%${search}%`),
        ),
      )
    : eq(product.ownerId, user.id);

  const items = await db
    .select()
    .from(product)
    .where(where)
    .orderBy(desc(product.createdAt));

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

  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid input", parsed.error.flatten());
  }

  const data = parsed.data;
  const [created] = await db
    .insert(product)
    .values({
      id: generateId("prod"),
      ownerId: user.id,
      name: data.name,
      sku: data.sku || null,
      description: data.description || null,
      categoryId: data.categoryId || null,
      unit: data.unit,
      costPrice: data.costPrice.toFixed(2),
      sellingPrice: data.sellingPrice.toFixed(2),
      stock: data.stock,
      lowStockThreshold: data.lowStockThreshold,
      imageUrl: data.imageUrl || null,
    })
    .returning();

  return NextResponse.json({ item: created }, { status: 201 });
}
