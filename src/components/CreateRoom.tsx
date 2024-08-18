import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createRoom } from "@/lib/api";

export default function CreateRoom() {
  const [nickname, setNickname] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const room = await createRoom(nickname);
      router.push(`/room/${room.id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
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
      <Button type="submit">Create Room</Button>
    </form>
  );
}
