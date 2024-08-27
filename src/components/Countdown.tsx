import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";

interface CountdownProps {
  onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const countdown = setInterval(() => {
      setCount((prevCount) => prevCount - 1);
    }, 1000);

    if (count === 0) {
      clearInterval(countdown);
      onComplete();
    }

    return () => clearInterval(countdown);
  }, [count, onComplete]);

  return (
    <div className="relative w-40 h-40 mx-auto">
      <ClipLoader size={160} color="#3B82F6" speedMultiplier={0.75} className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white">
        {count > 0 ? count : ""}
      </div>
    </div>
  );
};

export default Countdown;
