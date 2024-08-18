import { NextRequest, NextResponse } from "next/server";
import { submitAnswer, getAnswers, getAllAnswers } from "@/app/api/services/questionService";
import { AnswerSubmit } from "@/types";

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const body: AnswerSubmit = await req.json();
    const result = await submitAnswer({ ...body, roomId: params.roomId });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Answer submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to submit answer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const questionId = req.nextUrl.searchParams.get("questionId");
    if (!questionId) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    const answersResult = await getAnswers(params.roomId, questionId);
    const allAnswersResult = await getAllAnswers(params.roomId, questionId);

    if (answersResult.error || allAnswersResult.error) {
      return NextResponse.json(
        { error: answersResult.error || allAnswersResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        answers: answersResult.data,
        allAnswers: allAnswersResult.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to get answers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
