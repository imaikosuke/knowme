import { useEffect } from "react";
import { Player } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

interface GameResultProps {
  winner: Player;
  players: Record<string, Player>;
}

const GameResult: React.FC<GameResultProps> = ({ winner, players }) => {
  const router = useRouter();

  // 紙吹雪アニメーション
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6">ゲーム終了！</h2>
      <div className="mb-8">
        <Image src="/trophy.png" alt="Trophy" width={150} height={150} className="mx-auto" />
      </div>
      <p className="text-2xl font-semibold mb-4">\ {winner.nickname} /</p>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">最終結果</h3>
        <ul>
          {Object.values(players).map((player) => (
            <li key={player.id} className="mb-2">
              {player.nickname}:{" "}
              {player.isEliminated ? "脱落" : player.id === winner.id ? "勝利" : "敗北"}
            </li>
          ))}
        </ul>
      </div>
      <Button
        onClick={() => {
          router.push("/");
        }}
        className="bg-[#FF7F7F] hover:bg-[#FF9999] text-white"
      >
        トップに戻る
      </Button>
    </div>
  );
};

export default GameResult;
