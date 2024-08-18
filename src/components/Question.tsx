import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Question } from "@/types";

interface QuestionProps {
  question: Question;
  onSubmit: (answer: string) => void;
}

export default function Question({ question, onSubmit }: QuestionProps) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answer);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold">{question.text}</h3>
      <Input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer"
        required
      />
      <Button type="submit">Submit Answer</Button>
    </form>
  );
}
