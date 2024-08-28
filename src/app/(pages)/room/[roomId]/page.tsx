"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startGame } from "@/app/api/services/gameService";
import { useFirebaseListener } from "@/hooks/useFirebaseListener";
import PlayerList from "@/components/PlayerList";
import GameArea from "@/components/GameArea";
import { Player, Room } from "@/types";
import { getCookie } from "@/lib/cookies";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import GameResult from "@/components/GameResult";
import Countdown from "@/components/Countdown";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);

  useFirebaseListener(`rooms/${roomId}`, (data) => {
    if (data) {
      setRoom(data);
      // ゲームが終了状態になった場合、カウントダウンを開始
      if (data.status === "finished" && !showCountdown && !showResult) {
        setShowCountdown(true);
      }
    } else {
      toast.error("ルームが見つかりません");
      router.push("/");
    }
  });

  useEffect(() => {
    const playerId = getCookie("playerId");
    if (room && room.players && playerId) {
      if (playerId in room.players) {
        setCurrentPlayer(room.players[playerId]);
      } else {
        toast.error("このルームに参加する権限がありません");
        router.push("/");
      }
    }
  }, [room, router]);

  const handleStartGame = async () => {
    if (roomId) {
      try {
        await startGame(roomId);
        toast.success("ゲームが開始されました");
      } catch (error) {
        toast.error("ゲームの開始に失敗しました");
      }
    }
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setShowResult(true);
  };

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-cover bg-center">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-4xl p-6">
        <Image
          src="/knowme-logo.png"
          alt="KnowMe Logo"
          width={150}
          height={75}
          className="mb-8 mx-auto"
        />
        <div className="bg-white bg-opacity-80 rounded-lg p-6 shadow-lg">
          {room.status === "waiting" && (
            <>
              <h1 className="text-2xl font-bold mb-4 text-center">Room ID: {roomId}</h1>
              <PlayerList players={room.players} />
              {currentPlayer?.isOwner && (
                <Button
                  onClick={handleStartGame}
                  className="w-full font-bold bg-[#FF7F7F] hover:bg-[#FF9999] text-white mb-4"
                >
                  ゲームを開始
                </Button>
              )}
            </>
          )}
          {room.status === "playing" && currentPlayer && (
            <GameArea room={room} currentPlayer={currentPlayer} />
          )}
          {showCountdown && currentPlayer && (
            <div>
              <GameArea room={room} currentPlayer={currentPlayer} />
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                <Countdown onComplete={handleCountdownComplete} />
              </div>
            </div>
          )}
          {showResult && room.status === "finished" && room.winner && (
            <GameResult winner={room.players[room.winner]} players={room.players} />
          )}
        </div>
      </div>
    </div>
  );
}
