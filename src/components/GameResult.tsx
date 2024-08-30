import { useEffect } from "react";
import { Player } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

const XLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface GameResultProps {
  winner: Player;
}

const GameResult: React.FC<GameResultProps> = ({ winner }) => {
  const router = useRouter();

  // 紙吹雪アニメーション
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const handleShareOnX = () => {
    const tweetText = `🏆 ${winner.nickname} さんが勝利しました！\n\n#KnowMeGame`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, "_blank");
  };

  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6">ゲーム終了！</h2>
      <div className="mb-8">
        <Image src="/trophy.png" alt="Trophy" width={150} height={150} className="mx-auto" />
      </div>
      <p className="text-2xl font-semibold mb-4">\ {winner.nickname} /</p>
      <h3 className="text-xl font-semibold mb-8">優勝おめでとう！</h3>
      <div className="flex justify-center space-x-4">
        <Button
          onClick={() => {
            router.push("/");
          }}
          className="bg-[#FF7F7F] font-bold hover:bg-[#FF9999] text-white"
        >
          トップに戻る
        </Button>
        <Button onClick={handleShareOnX} className="bg-gray-700 font-bold hover:bg-gray-600 text-white">
          <XLogo />
          <span className="ml-2">共有</span>
        </Button>
      </div>
    </div>
  );
};

export default GameResult;
