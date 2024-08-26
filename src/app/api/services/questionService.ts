import { database } from "@/lib/firebase";
import { ref, set, get, update } from "firebase/database";
import { AnswerSubmit, ApiResponse } from "@/types";
import { generateAnswers } from "./openaiService";

export const submitAnswer = async (data: AnswerSubmit): Promise<ApiResponse<null>> => {
  try {
    const { roomId, playerId, questionId, answer } = data;
    const answerRef = ref(database, `rooms/${roomId}/answers/${questionId}`);

    await update(answerRef, { [playerId]: answer });

    // 質問文を取得
    const questionRef = ref(database, `rooms/${roomId}/currentQuestion/data`);
    const questionSnapshot = await get(questionRef);
    const questionText: string = questionSnapshot.val().text;

    const fakeAnswersResponse = await generateAnswers(answer, questionText);
    if (fakeAnswersResponse.error) {
      return { error: fakeAnswersResponse.error };
    }

    const fakeAnswers = fakeAnswersResponse.data;
    const allAnswers = [answer, ...fakeAnswers!].sort(() => Math.random() - 0.5);

    const allAnswersRef = ref(database, `rooms/${roomId}/allAnswers/${questionId}`);
    await set(allAnswersRef, allAnswers);

    return { data: null };
  } catch (error) {
    console.error("Failed to submit answer:", error);
    return { error: "Failed to submit answer" };
  }
};

export const getAnswers = async (
  roomId: string,
  questionId: string
): Promise<ApiResponse<Record<string, string>>> => {
  try {
    const answersRef = ref(database, `rooms/${roomId}/answers/${questionId}`);
    const snapshot = await get(answersRef);
    const answers = snapshot.val() as Record<string, string> | null;

    if (!answers) {
      return { data: {} };
    }

    return { data: answers };
  } catch (error) {
    console.error("Failed to get answers:", error);
    return { error: "Failed to get answers" };
  }
};
