import { NextRequest, NextResponse } from "next/server";
import { startGame } from "@/app/api/services/gameService";

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const result = await startGame(params.roomId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Game started successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to start game:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
