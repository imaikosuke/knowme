import { NextRequest, NextResponse } from "next/server";
import { getQuestions, createQuestion } from "@/app/api/services/questionService";

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const result = await getQuestions(params.roomId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("Failed to get questions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { questionText } = await req.json();
    const result = await createQuestion(params.roomId, questionText);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Failed to create question:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
