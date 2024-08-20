"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createRoom, joinRoom } from "@/app/api/services/roomService";
import { setCookie } from "@/lib/cookies";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [nickname, setNickname] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (!nickname) {
      toast.error("ニックネームを入力してください");
      return;
    }
    const result = await createRoom({ nickname });
    if (result.data) {
      const playerId = Object.keys(result.data.players)[0];
      setCookie("playerId", playerId);
      router.push(`/room/${result.data.id}`);
    }
  };

  const handleJoinRoom = async () => {
    if (!nickname || !roomId) {
      toast.error("ニックネームとIDを入力してください");
      return;
    }
    const result = await joinRoom({ roomId, nickname });
    if (result.data) {
      const playerId = Object.keys(result.data.players).find(
        (id) => result.data!.players[id].nickname === nickname
      );
      if (playerId) {
        setCookie("playerId", playerId);
      }
      router.push(`/room/${roomId}`);
    } else if (result.error === "Room not found") {
      setRoomId("");
      toast.error("ルームが見つかりませんでした");
    } else if (result.error === "Room is not accepting new players") {
      setRoomId("");
      toast.error("ルームは新しいプレイヤーを受け付けていません");
    } else {
      toast.error("予期せぬエラーが発生しました");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-md p-6 flex flex-col items-center">
        <Image src="/knowme-logo.png" alt="KnowMe Logo" width={300} height={150} className="mb-16" />
        <Input
          type="text"
          placeholder="ニックネームを入力"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="mb-8 w-full font-bold"
        />
        <Button
          onClick={handleCreateRoom}
          className="mb-8 w-full font-bold bg-[#FF7F7F] hover:bg-[#FF9999] text-white"
        >
          ルームを作成
        </Button>
        <Input
          type="text"
          placeholder="ルームIDを入力"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="mb-8 w-full font-bold"
        />
        <Button
          onClick={handleJoinRoom}
          className="w-full font-bold bg-[#7FC8FF] hover:bg-[#99D6FF] text-white"
        >
          ルームに参加
        </Button>
      </div>
    </div>
  );
}
