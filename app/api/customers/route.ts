import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { customer } from "@/db/schema/warung";
import { requireUser } from "@/lib/session";
import { badRequest, generateId, unauthorized } from "@/lib/api";

const customerInputSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const search = req.nextUrl.searchParams.get("search")?.trim();
  const where = search
    ? and(
        eq(customer.ownerId, user.id),
        or(
          ilike(customer.name, `%${search}%`),
          ilike(customer.phone, `%${search}%`),
          ilike(customer.email, `%${search}%`),
        ),
      )
    : eq(customer.ownerId, user.id);

  const items = await db
    .select()
    .from(customer)
    .where(where)
    .orderBy(desc(customer.createdAt));

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
  const parsed = customerInputSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid input", parsed.error.flatten());
  }
  const data = parsed.data;

  const [created] = await db
    .insert(customer)
    .values({
      id: generateId("cus"),
      ownerId: user.id,
      name: data.name,
      phone: data.phone || null,
      email: data.email ? data.email : null,
      address: data.address || null,
      notes: data.notes || null,
    })
    .returning();

  return NextResponse.json({ item: created }, { status: 201 });
}
