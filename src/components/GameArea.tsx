import { useState, useEffect, useCallback } from "react";
import { Room, Player, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { submitGuess, moveToNextRound } from "@/app/api/services/gameService";
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
  const [guessSubmitted, setGuessSubmitted] = useState<boolean>(false);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [gameStatus, setGameStatus] = useState<"playing" | "finished" | "waiting">(room.status);
  const [winner, setWinner] = useState<string | null>(null);

  useFirebaseListener(`rooms/${room.id}`, (data) => {
    if (data) {
      setCurrentQuestion(data.currentQuestion || null);
      setAllAnswers(data.allAnswers?.[data.gameState.currentQuestionId] || []);
      setPlayers(data.players || {});
      setGameStatus(data.status);
      setWinner(data.winner || null);
    }
  });

  const handleMoveToNextRound = useCallback(async () => {
    if (gameStatus === "playing") {
      await moveToNextRound(room.id);
      setGuessResult(null);
      setGuessSubmitted(false);
    }
  }, [room.id, gameStatus]);

  useEffect(() => {
    const allPlayersGuessed = Object.values(players).every(
      (player) =>
        player.id === room.gameState.currentPlayerId || player.hasGuessed || player.isEliminated
    );
    if (allPlayersGuessed && Object.keys(players).length > 0 && gameStatus === "playing") {
      handleMoveToNextRound();
    }
  }, [players, room.gameState.currentPlayerId, handleMoveToNextRound, gameStatus]);

  const handleSubmitAnswer = useCallback(async () => {
    if (answer && currentQuestion && gameStatus === "playing") {
      await submitAnswer({
        roomId: room.id,
        playerId: currentPlayer.id,
        questionId: currentQuestion.id,
        answer,
      });
      setAnswer("");
    }
  }, [answer, currentQuestion, room.id, currentPlayer.id, gameStatus]);

  const handleSubmitGuess = useCallback(
    async (guessedAnswer: string) => {
      if (currentQuestion && !guessSubmitted && gameStatus === "playing") {
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
          setGuessSubmitted(true);
        }
      }
    },
    [
      currentQuestion,
      guessSubmitted,
      room.id,
      currentPlayer.id,
      room.gameState.currentPlayerId,
      gameStatus,
    ]
  );

  if (gameStatus === "finished") {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-2">Game Over!</h2>
        <p className="mb-4">Winner: {players[winner!]?.nickname}</p>
      </div>
    );
  }

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
        allAnswers.length > 0 &&
        !guessSubmitted && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Choose the correct answer:</h3>
            {allAnswers.map((ans, index) => (
              <Button key={index} onClick={() => handleSubmitGuess(ans)} className="mr-2 mb-2">
                {ans}
              </Button>
            ))}
          </div>
        )
      )}
      {guessResult && <p className="mt-4 font-bold">{guessResult}</p>}
      {guessSubmitted && <p className="mt-4">Waiting for other players to submit their guesses...</p>}
    </div>
  );
}
