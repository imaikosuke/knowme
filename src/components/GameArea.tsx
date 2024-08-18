import { useState, useEffect } from "react";
import { Room, Player, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { submitGuess } from "@/app/api/services/gameService";
import { submitAnswer } from "@/app/api/services/questionService";
import { useFirebaseListener } from "@/hooks/useFirebaseListener";

type GameAreaProps = {
  room: Room;
  currentPlayer: Player;
};

export default function GameArea({ room, currentPlayer }: GameAreaProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState<string[]>([]);
  const [guessResult, setGuessResult] = useState<string | null>(null);

  useFirebaseListener(`rooms/${room.id}/currentQuestion`, setCurrentQuestion);
  useFirebaseListener(`rooms/${room.id}/allAnswers/${room.gameState.currentQuestionId}`, (data) => {
    setAllAnswers(data || []); // データがnullの場合は空の配列を設定
  });

  const handleSubmitAnswer = async () => {
    if (answer && currentQuestion) {
      await submitAnswer({
        roomId: room.id,
        playerId: currentPlayer.id,
        questionId: currentQuestion.id,
        answer,
      });
      setAnswer("");
    }
  };

  const handleSubmitGuess = async (guessedAnswer: string) => {
    console.log("Submitting guess:", guessedAnswer);
    if (currentQuestion) {
      console.log("room.id", room.id);
      console.log("currentPlayer.id", currentPlayer.id);
      console.log("room.gameState.currentPlayerId", room.gameState.currentPlayerId);
      console.log("currentQuestion.id", currentQuestion.id);
      console.log("guessedAnswer", guessedAnswer);
      const result = await submitGuess({
        roomId: room.id,
        playerId: currentPlayer.id,
        targetPlayerId: room.gameState.currentPlayerId,
        questionId: currentQuestion.id,
        guessedAnswer,
      });

      if (result.error) {
        setGuessResult(`Error: ${result.error}`);
      } else {
        setGuessResult(result.data ? "Correct guess!" : "Incorrect guess. You're eliminated.");
      }
    } else {
      console.log("currentQuestion No");
    }
  };

  if (!currentQuestion) {
    return <div>Waiting for the next question...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Current Question:</h2>
      <p className="mb-4">{currentQuestion.text}</p>
      {currentPlayer.id === room.gameState.currentPlayerId ? (
        <>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="border p-2 mb-2"
          />
          <Button onClick={handleSubmitAnswer}>Submit Answer</Button>
        </>
      ) : (
        allAnswers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Choose the correct answer:</h3>
            {allAnswers.map((ans, index) => (
              <Button key={index} onClick={() => handleSubmitGuess(ans)} className="mr-2 mb-2">
                {ans}
              </Button>
            ))}
            {guessResult && <p className="mt-4 font-bold">{guessResult}</p>}
          </div>
        )
      )}
    </div>
  );
}
