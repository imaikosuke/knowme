import { NextRequest, NextResponse } from "next/server";
import { getPlayers, updatePlayer, removePlayer } from "@/app/api/services/playerService";
import { PlayerUpdate } from "@/types";

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const result = await getPlayers(params.roomId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("Failed to get players:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { playerId, updates }: { playerId: string; updates: PlayerUpdate } = await req.json();
    const result = await updatePlayer(params.roomId, playerId, updates);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Player updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to update player:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { playerId } = await req.json();
    const result = await removePlayer(params.roomId, playerId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Player removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to remove player:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
