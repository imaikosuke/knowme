import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { correctAnswer, questionText } = await req.json();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates plausible but false answers for a game. Provide answers without any numbering, bullet points, or prefixes.",
        },
        {
          role: "user",
          content: `Given the question "${questionText}" and the correct answer "${correctAnswer}", generate 3 plausible but false answers that are different from each other and the correct answer. The false answers should be believable responses to the question. Provide only the 3 false answers, one per line, without any numbering or bullet points.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const generatedContent = response.choices[0]?.message?.content;
    let fakeAnswers = generatedContent
      ? generatedContent.split("\n").filter((answer) => answer.trim() !== "")
      : [];

    // 回答の後処理
    fakeAnswers = fakeAnswers.map(
      (answer) => answer.replace(/^[-\d\.\s]+/, "").trim() // 先頭の数字、ハイフン、ドットを削除
    );

    // 正解も含めて全ての回答を同じ形式に整える
    const allAnswers = [correctAnswer, ...fakeAnswers].map((answer) => answer.trim());

    return NextResponse.json({ fakeAnswers: allAnswers.slice(1) });
  } catch (error) {
    console.error("Error generating fake answers:", error);
    return NextResponse.json({ error: "Failed to generate fake answers" }, { status: 500 });
  }
}
