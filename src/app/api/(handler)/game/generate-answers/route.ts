import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { correctAnswer } = await req.json();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates plausible but false answers for a game.",
        },
        {
          role: "user",
          content: `Given the correct answer "${correctAnswer}" to a personal question, generate 3 plausible but false answers that are different from each other and the correct answer. Provide only the 3 false answers, separated by newlines.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const generatedContent = response.choices[0]?.message?.content;
    const fakeAnswers = generatedContent
      ? generatedContent.split("\n").filter((answer) => answer.trim() !== "")
      : [];

    return NextResponse.json({ fakeAnswers });
  } catch (error) {
    console.error("Error generating fake answers:", error);
    return NextResponse.json({ error: "Failed to generate fake answers" }, { status: 500 });
  }
}
