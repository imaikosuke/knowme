import { NextRequest, NextResponse } from "next/server";
import { selectRandomPlayer } from "@/app/api/services/playerService";

export async function POST(req: NextRequest) {
  try {
    const { roomId } = await req.json();
    const result = await selectRandomPlayer(roomId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("Failed to select random player:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
