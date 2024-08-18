import { NextRequest, NextResponse } from "next/server";
import { submitGuess } from "@/app/api/services/gameService";
import { GuessSubmit } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: GuessSubmit = await req.json();
    if (!body.questionId) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }
    const result = await submitGuess(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ isCorrect: result.data }, { status: 200 });
  } catch (error) {
    console.error("Failed to submit guess:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
