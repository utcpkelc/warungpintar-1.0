import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { customer } from "@/db/schema/warung";
import { requireUser } from "@/lib/session";
import { badRequest, notFound, unauthorized } from "@/lib/api";

const customerUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

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
  const parsed = customerUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid input", parsed.error.flatten());
  }
  const data = parsed.data;
  const updateValues: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateValues.name = data.name;
  if (data.phone !== undefined) updateValues.phone = data.phone || null;
  if (data.email !== undefined)
    updateValues.email = data.email ? data.email : null;
  if (data.address !== undefined) updateValues.address = data.address || null;
  if (data.notes !== undefined) updateValues.notes = data.notes || null;

  const [updated] = await db
    .update(customer)
    .set(updateValues)
    .where(and(eq(customer.id, id), eq(customer.ownerId, user.id)))
    .returning();

  if (!updated) return notFound("Customer not found");
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
    .delete(customer)
    .where(and(eq(customer.id, id), eq(customer.ownerId, user.id)))
    .returning();

  if (!deleted) return notFound("Customer not found");
  return NextResponse.json({ ok: true });
}
