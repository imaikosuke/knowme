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

export default function RoomPage() {
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useFirebaseListener(`rooms/${roomId}`, (data) => {
    setRoom(data);
  });

  useEffect(() => {
    // Set current player based on playerId in cookie
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ルーム: {roomId}</h1>
      <PlayerList players={room.players} />
      {room.status === "waiting" && currentPlayer?.isOwner && (
        <Button onClick={handleStartGame}>ゲームを開始</Button>
      )}
      {room.status === "playing" && currentPlayer && (
        <GameArea room={room} currentPlayer={currentPlayer} />
      )}
    </div>
  );
}
