import { Button } from "@/components/ui/button";

interface ResultDisplayProps {
  winner: { nickname: string };
  onPlayAgain: () => void;
}

export default function ResultDisplay({ winner, onPlayAgain }: ResultDisplayProps) {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-3xl font-bold">Game Over!</h2>
      <p className="text-xl">The winner is: {winner.nickname}</p>
      <Button onClick={onPlayAgain}>Play Again</Button>
    </div>
  );
}
