import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from "@/types";

interface AnswerSelectionProps {
  question: Question;
  answers: string[];
  onSubmit: (guessedAnswer: string) => void;
}

export default function AnswerSelection({ question, answers, onSubmit }: AnswerSelectionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedAnswer);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold">{question.text}</h3>
      <RadioGroup onValueChange={setSelectedAnswer}>
        {answers.map((answer, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={answer} id={`answer-${index}`} />
            <Label htmlFor={`answer-${index}`}>{answer}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button type="submit">Submit Guess</Button>
    </form>
  );
}
