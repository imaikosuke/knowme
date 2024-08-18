import { Player } from "@/types";

type PlayerListProps = {
  players: Record<string, Player>;
};

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Players:</h2>
      <ul>
        {Object.values(players).map((player) => (
          <li key={player.id} className={player.isEliminated ? "line-through" : ""}>
            {player.nickname} {player.isOwner && "(Owner)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
