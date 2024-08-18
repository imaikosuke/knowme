import { NextRequest, NextResponse } from "next/server";
import { joinRoom } from "@/app/api/services/roomService";
import { RoomJoin } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: RoomJoin = await req.json();
    const result = await joinRoom(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("Failed to join room:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
