import { Button } from "@/components/ui/button";
import { Player } from "@/types";
import { startGame } from "@/lib/api";

interface WaitingRoomProps {
  roomId: string;
  players: Player[];
  isOwner: boolean;
}

export default function WaitingRoom({ roomId, players, isOwner }: WaitingRoomProps) {
  const handleStartGame = async () => {
    try {
      await startGame(roomId);
      // ゲーム開始後の処理（例：ゲームページへのリダイレクト）は
      // 親コンポーネントで useEffect を使って処理します
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Waiting Room</h2>
      <p>
        Room ID: <span className="font-semibold">{roomId}</span>
      </p>
      <div>
        <h3 className="text-xl font-semibold">Players:</h3>
        <ul className="list-disc list-inside">
          {players.map((player) => (
            <li key={player.id}>
              {player.nickname} {player.isOwner ? "(Owner)" : ""}
            </li>
          ))}
        </ul>
      </div>
      {isOwner && players.length >= 2 && <Button onClick={handleStartGame}>Start Game</Button>}
      {isOwner && players.length < 2 && <p>Waiting for more players to join...</p>}
      {!isOwner && <p>Waiting for the room owner to start the game...</p>}
    </div>
  );
}
