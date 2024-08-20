"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startGame } from "@/app/api/services/gameService";
import { useFirebaseListener } from "@/hooks/useFirebaseListener";
import PlayerList from "@/components/PlayerList";
import GameArea from "@/components/GameArea";
import { Player, Room } from "@/types";
import { getCookie } from "@/lib/cookies";
import Image from "next/image";

export default function RoomPage() {
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useFirebaseListener(`rooms/${roomId}`, (data) => {
    setRoom(data);
  });

  useEffect(() => {
    const playerId = getCookie("playerId");
    if (room && room.players && playerId) {
      setCurrentPlayer(room.players[playerId]);
    }
  }, [room]);

  const handleStartGame = async () => {
    if (roomId) {
      await startGame(roomId);
    }
  };

  if (!roomId) {
    return <div>Error: Room ID not found</div>;
  }

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-cover bg-center">
      <div className="w-full max-w-4xl p-6">
        <Image
          src="/knowme-logo.png"
          alt="KnowMe Logo"
          width={150}
          height={75}
          className="mb-8 mx-auto"
        />
        <div className="bg-white bg-opacity-80 rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">ルーム: {roomId}</h1>
          <PlayerList players={room.players} />
          {room.status === "waiting" && currentPlayer?.isOwner && (
            <Button
              onClick={handleStartGame}
              className="w-full bg-[#FF7F7F] hover:bg-[#FF9999] text-white mb-4"
            >
              ゲームを開始
            </Button>
          )}
          {room.status === "playing" && currentPlayer && (
            <GameArea room={room} currentPlayer={currentPlayer} />
          )}
          {room.status === "finished" && room.winner && (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">ゲーム終了</h2>
              <p className="mb-4">勝者: {room.players[room.winner]?.nickname}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
