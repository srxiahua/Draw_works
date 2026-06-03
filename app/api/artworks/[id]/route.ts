import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getOwnerUserId } from "@/lib/owner";
import { db } from "@/lib/db";
import { artworks } from "@/lib/db/schema";
import { getArtworkWithDetails } from "@/lib/db/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ownerId = await getOwnerUserId();
  const artwork = await getArtworkWithDetails(id, ownerId);
  if (!artwork) {
    return NextResponse.json({ error: "作品不存在" }, { status: 404 });
  }
  return NextResponse.json({ artwork });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = await getOwnerUserId();
  const { id } = await params;
  const body = await request.json();

  const [existing] = await db
    .select()
    .from(artworks)
    .where(eq(artworks.id, id))
    .limit(1);

  if (!existing || existing.userId !== ownerId) {
    return NextResponse.json({ error: "作品不存在" }, { status: 404 });
  }

  const updates: Partial<typeof existing> = { updatedAt: new Date() };
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.note === "string") updates.note = body.note;
  if (typeof body.isPublic === "boolean") updates.isPublic = body.isPublic;

  const [updated] = await db
    .update(artworks)
    .set(updates)
    .where(eq(artworks.id, id))
    .returning();

  return NextResponse.json({ artwork: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = await getOwnerUserId();
  const { id } = await params;

  const [existing] = await db
    .select()
    .from(artworks)
    .where(eq(artworks.id, id))
    .limit(1);

  if (!existing || existing.userId !== ownerId) {
    return NextResponse.json({ error: "作品不存在" }, { status: 404 });
  }

  const { getStorage } = await import("@/lib/storage");
  const storage = getStorage();
  await storage.delete(existing.storageKey);
  await storage.delete(existing.thumbKey);

  await db.delete(artworks).where(eq(artworks.id, id));

  return NextResponse.json({ ok: true });
}
