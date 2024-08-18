import { NextRequest, NextResponse } from "next/server";
import { checkGameEnd } from "@/app/api/services/gameService";

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const result = await checkGameEnd(params.roomId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ winner: result.data }, { status: 200 });
  } catch (error) {
    console.error("Failed to check game end:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
