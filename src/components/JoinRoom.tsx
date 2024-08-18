import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { joinRoom } from "@/lib/api";

export default function JoinRoom() {
  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinRoom(roomId, nickname);
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Enter your nickname"
        required
      />
      <Input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter room ID"
        required
      />
      <Button type="submit">Join Room</Button>
    </form>
  );
}
