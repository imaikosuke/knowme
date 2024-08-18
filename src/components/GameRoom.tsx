import React from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import Question from "./Question";
import AnswerSelection from "./AnswerSelection";
import ResultDisplay from "./ResultDisplay";
import { Question as QuestionType } from "@/types";

interface GameRoomProps {
  roomId: string;
  playerId: string;
}

export default function GameRoom({ roomId, playerId }: GameRoomProps) {
  const router = useRouter();
  const {
    gameState,
    currentPlayer,
    currentQuestion,
    answers,
    submitAnswer,
    submitGuess,
    isLoading,
    error,
    winner,
  } = useGame(roomId);

  if (isLoading) {
    return <div className="text-center p-4">Loading game...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  if (!gameState || !currentQuestion) {
    return <div className="text-center p-4">Waiting for game to start...</div>;
  }

  const handleSubmitAnswer = (answer: string) => {
    submitAnswer(answer).catch((err) => {
      console.error("Failed to submit answer:", err);
      // ここでユーザーにエラーを表示することもできます
    });
  };

  const handleSubmitGuess = (guessedAnswer: string) => {
    submitGuess(guessedAnswer).catch((err) => {
      console.error("Failed to submit guess:", err);
      // ここでユーザーにエラーを表示することもできます
    });
  };

  const handlePlayAgain = () => {
    router.push("/"); // ホームページにリダイレクト
  };

  if (winner) {
    return <ResultDisplay winner={winner} onPlayAgain={handlePlayAgain} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Game Room: {roomId}</h1>
      {gameState.currentPlayerId === playerId ? (
        <Question question={currentQuestion} onSubmit={handleSubmitAnswer} />
      ) : (
        <AnswerSelection question={currentQuestion} answers={answers} onSubmit={handleSubmitGuess} />
      )}
    </div>
  );
}
