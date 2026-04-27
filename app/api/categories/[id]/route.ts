import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { category } from "@/db/schema/warung";
import { requireUser } from "@/lib/session";
import { badRequest, notFound, unauthorized } from "@/lib/api";

const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
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

  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid input", parsed.error.flatten());
  }
  const data = parsed.data;
  const updateValues: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateValues.name = data.name;
  if (data.description !== undefined)
    updateValues.description = data.description || null;

  const [updated] = await db
    .update(category)
    .set(updateValues)
    .where(and(eq(category.id, id), eq(category.ownerId, user.id)))
    .returning();

  if (!updated) return notFound("Category not found");
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
    .delete(category)
    .where(and(eq(category.id, id), eq(category.ownerId, user.id)))
    .returning();

  if (!deleted) return notFound("Category not found");
  return NextResponse.json({ ok: true });
}
