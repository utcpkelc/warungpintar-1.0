import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { category } from "@/db/schema/warung";
import { requireUser } from "@/lib/session";
import { badRequest, generateId, unauthorized } from "@/lib/api";

const categoryInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  const items = await db
    .select()
    .from(category)
    .where(eq(category.ownerId, user.id))
    .orderBy(asc(category.name));

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

  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid input", parsed.error.flatten());
  }

  try {
    const [created] = await db
      .insert(category)
      .values({
        id: generateId("cat"),
        ownerId: user.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
      })
      .returning();
    return NextResponse.json({ item: created }, { status: 201 });
  } catch {
    return badRequest("Category name must be unique");
  }
}
