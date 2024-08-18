import { NextRequest, NextResponse } from "next/server";
import { getGameState, updateGameState } from "@/app/api/services/gameService";
import { selectRandomPlayer } from "@/app/api/services/playerService";
import { getRandomQuestion } from "@/app/api/services/questionService";

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  const { roomId } = params;

  try {
    const gameStateResponse = await getGameState(roomId);
    if (gameStateResponse.error) {
      return NextResponse.json({ error: gameStateResponse.error }, { status: 400 });
    }

    const currentGameState = gameStateResponse.data;

    const randomPlayerResponse = await selectRandomPlayer(roomId);
    if (randomPlayerResponse.error) {
      return NextResponse.json({ error: randomPlayerResponse.error }, { status: 400 });
    }

    const randomQuestionResponse = await getRandomQuestion(roomId);
    if (randomQuestionResponse.error) {
      return NextResponse.json({ error: randomQuestionResponse.error }, { status: 400 });
    }

    const newGameState = {
      ...currentGameState,
      currentRound: currentGameState!.currentRound + 1,
      currentPlayerId: randomPlayerResponse.data!.id,
      currentQuestionId: randomQuestionResponse.data!.id,
    };

    const updateResult = await updateGameState(roomId, newGameState);
    if (updateResult.error) {
      return NextResponse.json({ error: updateResult.error }, { status: 400 });
    }

    return NextResponse.json(newGameState, { status: 200 });
  } catch (error) {
    console.error("Failed to start next round:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
