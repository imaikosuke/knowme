"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createRoom, joinRoom } from "@/app/api/services/roomService";
import { setCookie } from "@/lib/cookies";

export default function Home() {
  const [nickname, setNickname] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (!nickname) return;
    const result = await createRoom({ nickname });
    if (result.data) {
      setCookie("nickname", nickname);
      router.push(`/room/${result.data.id}`);
    }
  };

  const handleJoinRoom = async () => {
    if (!nickname || !roomId) return;
    const result = await joinRoom({ roomId, nickname });
    if (result.data) {
      setCookie("nickname", nickname);
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Game</h1>
      <Input
        type="text"
        placeholder="Enter your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="mb-4"
      />
      <div className="flex space-x-4">
        <Button onClick={handleCreateRoom}>Create Room</Button>
        <Input
          type="text"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <Button onClick={handleJoinRoom}>Join Room</Button>
      </div>
    </div>
  );
}
