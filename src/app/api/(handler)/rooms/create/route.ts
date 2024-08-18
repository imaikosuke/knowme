import { NextRequest, NextResponse } from "next/server";
import { createRoom } from "@/app/api/services/roomService";
import { RoomCreate } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: RoomCreate = await req.json();
    const result = await createRoom(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Failed to create room:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
