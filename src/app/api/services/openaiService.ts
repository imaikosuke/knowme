import { ApiResponse } from "@/types";

export async function generateAnswers(correctAnswer: string): Promise<ApiResponse<string[]>> {
  try {
    const response = await fetch("/api/game/generate-answers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correctAnswer }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate answers");
    }

    const data = await response.json();
    return { data: data.fakeAnswers };
  } catch (error) {
    console.error("Error generating fake answers:", error);
    return { error: "Failed to generate fake answers" };
  }
}
