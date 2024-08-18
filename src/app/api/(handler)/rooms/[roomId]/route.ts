import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "@/app/api/services/roomService";

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const result = await getRoom(params.roomId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("Failed to get room:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
