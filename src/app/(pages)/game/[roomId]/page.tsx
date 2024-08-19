"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Question from "@/components/Question";
import AnswerSelection from "@/components/AnswerSelection";
import ResultDisplay from "@/components/ResultDisplay";
import { getGameState, submitAnswer, submitGuess, checkGameEnd } from "@/lib/api";
import { GameState, Player, Question as QuestionType } from "@/types";
import { getCookie } from "@/lib/cookies";

interface GamePageProps {
  params: {
    roomId: string;
  };
}

export default function Game({ params }: GamePageProps) {
  const { roomId } = params;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedPlayerId = getCookie("playerId");
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else {
      setError("Player ID not found. Please join the game again.");
      router.push("/");
    }
  }, [router]);

  const handleSubmitAnswer = async (answer: string) => {
    if (!gameState || !currentQuestion || !playerId) return;

    try {
      await submitAnswer(roomId, playerId, currentQuestion.id, answer);
      // Firebase will automatically update the game state
    } catch (err) {
      setError("Failed to submit answer");
      console.error(err);
    }
  };

  const handleSubmitGuess = async (guess: string) => {
    if (!gameState || !currentQuestion || !playerId) return;

    try {
      const result = await submitGuess(
        roomId,
        playerId,
        gameState.currentPlayerId!,
        currentQuestion.id,
        guess
      );

      const endResult = await checkGameEnd(roomId);
      if (endResult.winner) {
        setWinner(endResult.winner);
      }
      // Firebase will automatically update the game state for the next round
    } catch (err) {
      setError("Failed to submit guess");
      console.error(err);
    }
  };

  const handlePlayAgain = () => {
    router.push("/");
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (winner) {
    return <ResultDisplay winner={winner} onPlayAgain={handlePlayAgain} />;
  }

  if (!gameState || !currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Game Room: {roomId}</h1>
      {gameState.currentPlayerId === playerId ? (
        <Question question={currentQuestion} onSubmit={handleSubmitAnswer} />
      ) : (
        <AnswerSelection
          question={currentQuestion}
          answers={answers}
          onSubmit={handleSubmitGuess}
        />
      )}
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Current Game State:</h2>
        <pre>{JSON.stringify(gameState, null, 2)}</pre>
        <h2 className="text-xl font-semibold mt-4">Current Answers:</h2>
        <pre>{JSON.stringify(answers, null, 2)}</pre>
      </div>
    </div>
  );
}
