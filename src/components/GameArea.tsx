import { useState, useEffect, useCallback } from "react";
import { Room, Player, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const handleRoomUpdate = useCallback((data: any) => {
    if (data) {
      setCurrentQuestion(data.currentQuestion?.data || null);
      setAllAnswers(data.allAnswers?.[data.gameState.currentQuestionId] || []);
      setPlayers(data.players || {});
      setGameStatus(data.status);
    }
  }, []);

  useFirebaseListener(`rooms/${room.id}`, handleRoomUpdate);

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
          setGuessResult(result.data ? "正解!" : "不正解...");
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

  if (!currentQuestion) {
    return <div>次のお題を待っています...</div>;
  }

  return (
    <div className="space-y-4">
      {currentQuestion && (
        <div className="bg-white bg-opacity-50 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">お題:</h2>
          <p className="mb-4 text-lg font-bold">{currentQuestion.text}</p>
        </div>
      )}
      {currentPlayer.id === room.gameState.currentPlayerId ? (
        <div className="space-y-2">
          <Input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="あなたの回答を入力"
            className="w-full font-bold"
          />
          <Button
            onClick={handleSubmitAnswer}
            className="w-full font-bold bg-[#FF7F7F] hover:bg-[#FF9999] text-white"
          >
            回答を送信
          </Button>
        </div>
      ) : (
        allAnswers.length > 0 &&
        !guessSubmitted && (
          <div className="space-y-2">
            <h3 className="text-lg font-bold mb-2">真実だと思う回答を選択:</h3>
            {allAnswers.map((ans, index) => (
              <Button
                key={index}
                onClick={() => handleSubmitGuess(ans)}
                className="w-full mb-2 font-bold bg-[#7FC8FF] hover:bg-[#99D6FF] text-white"
              >
                {ans}
              </Button>
            ))}
          </div>
        )
      )}
      {guessResult && <p className="mt-4 font-bold text-center">{guessResult}</p>}
      {guessSubmitted && (
        <p className="mt-4 text-center font-bold">他のプレイヤーが回答するのを待っています...</p>
      )}
    </div>
  );
}
