import { Player } from "@/types";

type PlayerListProps = {
  players: Record<string, Player>;
};

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="mb-4 bg-white bg-opacity-50 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-2">プレイヤー:</h2>
      <ul className="space-y-2">
        {Object.values(players).map((player) => (
          <li
            key={player.id}
            className={`${player.isEliminated ? "line-through text-gray-500" : "text-black font-bold"}`}
          >
            {player.nickname} {player.isOwner && "(ホスト)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
