import { NextResponse } from "next/server";
import { getOwnerUserId } from "@/lib/owner";
import { getUserArtworks } from "@/lib/db/queries";

export async function GET() {
  const userId = await getOwnerUserId();
  const artworks = await getUserArtworks(userId);
  return NextResponse.json({ artworks });
}
