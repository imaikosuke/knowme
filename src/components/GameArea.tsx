import { useState, useEffect, useCallback } from "react";
import { Room, Player, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitGuess, moveToNextRound } from "@/app/api/services/gameService";
import { submitAnswer } from "@/app/api/services/questionService";
import { useFirebaseListener } from "@/hooks/useFirebaseListener";
import Countdown from "./Countdown";
import { waitFor } from "@/utils/waitFor";
import toast from "react-hot-toast";
import Image from "next/image";
import { User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type GameAreaProps = {
  room: Room;
  currentPlayer: Player;
};

export default function GameArea({ room, currentPlayer }: GameAreaProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [guessSubmitted, setGuessSubmitted] = useState<boolean>(false);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [gameStatus, setGameStatus] = useState<"playing" | "finished" | "waiting">(room.status);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [isAllPlayersGuessed, setIsAllPlayersGuessed] = useState<boolean>(false);
  const [isNowEliminated, setIsNowEliminated] = useState<boolean>(false);
  const [wasEliminatedInPreviousRound, setWasEliminatedInPreviousRound] = useState<boolean>(false);
  const [showEliminationMessage, setShowEliminationMessage] = useState<boolean>(false);
  const [remainingPlayers, setRemainingPlayers] = useState<number>(0);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [pendingPlayerCount, setPendingPlayerCount] = useState<number | null>(null);
  const [displayedPlayerCount, setDisplayedPlayerCount] = useState<number>(0);
  const [actualPlayerCount, setActualPlayerCount] = useState<number>(0);
  const [shouldUpdatePlayerCount, setShouldUpdatePlayerCount] = useState<boolean>(false);
  const [isGameJustStarted, setIsGameJustStarted] = useState<boolean>(true);
  const [isSubmitedAnswer, setIsSubmitedAnswer] = useState<boolean>(false);

  const handleRoomUpdate = useCallback((data: any) => {
    if (data) {
      setCurrentQuestion(data.currentQuestion?.data || null);
      setAllAnswers(data.allAnswers?.[data.gameState.currentQuestionId] || []);
      setPlayers(data.players || {});
      setGameStatus(data.status);
    }
  }, []);

  useFirebaseListener(`rooms/${room.id}`, handleRoomUpdate);

  useEffect(() => {
    const activePlayers = Object.values(players).filter((player) => !player.isEliminated);
    const newActualCount = activePlayers.length;
    setActualPlayerCount(newActualCount);

    if (isGameJustStarted) {
      setDisplayedPlayerCount(newActualCount);
      setIsGameJustStarted(false);
    }

    // ゲームが終了状態になった場合、表示を「？」にする
    if (gameStatus === "finished") {
      setDisplayedPlayerCount(-1); // -1 を「？」表示のフラグとして使用
    }
  }, [players, isGameJustStarted, gameStatus]);

  useEffect(() => {
    const allPlayersGuessed = Object.values(players).every(
      (player) =>
        player.id === room.gameState.currentPlayerId || player.hasGuessed || player.isEliminated
    );

    if (allPlayersGuessed && gameStatus === "playing" && actualPlayerCount > 1) {
      setDisplayedPlayerCount(actualPlayerCount);
    }
  }, [players, room.gameState.currentPlayerId, gameStatus, actualPlayerCount]);

  useEffect(() => {
    if (shouldUpdatePlayerCount) {
      setDisplayedPlayerCount(actualPlayerCount);
    }
  }, [shouldUpdatePlayerCount, actualPlayerCount]);

  const handleMoveToNextRound = useCallback(async () => {
    if (gameStatus === "playing") {
      setShowCountdown(true);
      await waitFor(3);
      setShowCountdown(false);
      setIsAllPlayersGuessed(true);
      if (actualPlayerCount > 1) {
        setDisplayedPlayerCount(actualPlayerCount);
      } else {
        setDisplayedPlayerCount(-1); // 最後の1人になったら「？」を表示
      }
      await waitFor(3);
      setIsAllPlayersGuessed(false);
      setWasEliminatedInPreviousRound(isNowEliminated);
      await moveToNextRound(room.id);
      setIsCorrect(false);
      setGuessSubmitted(false);
      setIsSubmitedAnswer(false);
    }
  }, [room.id, gameStatus, isNowEliminated, actualPlayerCount]);

  useEffect(() => {
    const allPlayersGuessed = Object.values(players).every(
      (player) =>
        player.id === room.gameState.currentPlayerId || player.hasGuessed || player.isEliminated
    );
    if (allPlayersGuessed && Object.keys(players).length > 0 && gameStatus === "playing") {
      handleCountdownStart();
      setShowCountdown(true);
      handleMoveToNextRound();
    }
  }, [players, room.gameState.currentPlayerId, handleMoveToNextRound, gameStatus]);

  useEffect(() => {
    const activePlayers = Object.values(players).filter((player) => !player.isEliminated);
    setRemainingPlayers(activePlayers.length);
  }, [players, remainingPlayers]);

  useEffect(() => {
    const activePlayers = Object.values(players).filter((player) => !player.isEliminated);
    const newCount = activePlayers.length;

    if (isCountingDown) {
      setPendingPlayerCount(newCount);
    } else {
      setRemainingPlayers(newCount);
      setPendingPlayerCount(null);
    }
  }, [players, isCountingDown, remainingPlayers]);

  const handleCountdownStart = () => {
    setIsCountingDown(true);
  };

  const handleSubmitAnswer = useCallback(async () => {
    if (answer && currentQuestion && gameStatus === "playing") {
      await submitAnswer({
        roomId: room.id,
        playerId: currentPlayer.id,
        questionId: currentQuestion.id,
        answer,
      });
      setIsSubmitedAnswer(true);
      setAnswer("");
    } else {
      toast.error("回答を入力してください");
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
          toast.error("エラーが発生しました。もう一度お試しください。");
        } else {
          if (result.data) {
            setIsCorrect(true);
          } else {
            setIsNowEliminated(true);
          }
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

  useEffect(() => {
    if (wasEliminatedInPreviousRound || (isAllPlayersGuessed && isNowEliminated)) {
      setShowEliminationMessage(true);
    } else {
      setShowEliminationMessage(false);
    }
  }, [isAllPlayersGuessed, isNowEliminated, wasEliminatedInPreviousRound]);

  const handleCountdownEnd = useCallback(() => {
    setIsCountingDown(false);
    if (pendingPlayerCount !== null) {
      setRemainingPlayers(pendingPlayerCount);
    }
    setShowCountdown(false);
  }, [pendingPlayerCount]);

  const getCurrentAnswerer = useCallback(() => {
    const currentAnswererId = room.gameState.currentPlayerId;
    return players[currentAnswererId]?.nickname || "Unknown";
  }, [players, room.gameState.currentPlayerId]);

  if (!currentQuestion) {
    return <div>次のお題を待っています...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white bg-opacity-50 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="font-semibold whitespace-nowrap">回答者:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full max-w-[150px] truncate">
                  {getCurrentAnswerer()}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getCurrentAnswerer()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="w-full sm:w-auto flex justify-end">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 inline-flex">
            <span>残り</span>
            {showCountdown || isAllPlayersGuessed || displayedPlayerCount < 2 ? (
              <p className="font-bold mx-1">？</p>
            ) : (
              <p className="font-bold mx-1">{displayedPlayerCount}</p>
            )}
            <span>人</span>
            <User size={16} className="ml-1" />
          </div>
        </div>
      </div>

      {currentQuestion && (
        <div className="bg-white bg-opacity-70 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">お題:</h2>
          <p className="text-lg">{currentQuestion.text}</p>
        </div>
      )}
      {isAllPlayersGuessed &&
        currentPlayer.id != room.gameState.currentPlayerId &&
        isCorrect &&
        !showEliminationMessage && (
          <div className="mt-4 flex justify-center items-center">
            <Image src="/correct.png" alt="correct" width={100} height={100} className="mx-auto" />
          </div>
        )}
      {showEliminationMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">あなたは脱落しました</p>
          <p>引き続きゲームを観戦できますが、回答はできません。</p>
        </div>
      )}
      {currentPlayer.id === room.gameState.currentPlayerId && !currentPlayer.isEliminated && (
        <div className="space-y-2">
          <Input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="あなたの回答を入力"
            className="w-full"
          />
          <Button
            onClick={handleSubmitAnswer}
            className="w-full bg-[#FF7F7F] hover:bg-[#FF9999] text-white"
            disabled={isSubmitedAnswer}
          >
            回答を送信
          </Button>
        </div>
      )}
      {allAnswers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-2">
            {currentPlayer.id === room.gameState.currentPlayerId
              ? "生成された選択肢:"
              : currentPlayer.isEliminated
              ? "現在の選択肢:"
              : "真実だと思う回答を選択:"}
          </h3>
          {allAnswers.map((ans, index) => (
            <Button
              key={index}
              onClick={() => !currentPlayer.isEliminated && !guessSubmitted && handleSubmitGuess(ans)}
              className={`w-full mb-2 ${
                showCountdown
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#7FC8FF] hover:bg-[#99D6FF] text-white"
              }`}
              disabled={
                currentPlayer.isEliminated ||
                guessSubmitted ||
                currentPlayer.id === room.gameState.currentPlayerId
              }
            >
              {ans}
            </Button>
          ))}
        </div>
      )}
      {showCountdown && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <Countdown onComplete={handleCountdownEnd} />
        </div>
      )}
      {!isAllPlayersGuessed && currentPlayer.id !== room.gameState.currentPlayerId && guessSubmitted && (
        <p className="mt-4 text-center">他のプレイヤーが回答するのを待っています...</p>
      )}
    </div>
  );
}
