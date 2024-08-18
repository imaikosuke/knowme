import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/app/api/services/playerService";

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string; playerId: string } }
) {
  const { roomId, playerId } = params;

  try {
    const playerResponse = await getPlayer(roomId, playerId);
    if (playerResponse.error) {
      return NextResponse.json({ error: playerResponse.error }, { status: 400 });
    }

    return NextResponse.json(playerResponse.data, { status: 200 });
  } catch (error) {
    console.error("Failed to get player:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
