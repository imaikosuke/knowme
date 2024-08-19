import { database } from "@/lib/firebase";
import { ref, push, set, get, update } from "firebase/database";
import { Question, Answer, AnswerSubmit, ApiResponse } from "@/types";
import { generateAnswers } from "./openaiService";
import { questions } from "@/types/questions";

export const createQuestion = async (
  roomId: string,
  questionText: string
): Promise<ApiResponse<Question>> => {
  try {
    const questionsRef = ref(database, `rooms/${roomId}/questions`);
    const newQuestionRef = push(questionsRef);
    const questionId = newQuestionRef.key as string;

    const newQuestion: Question = {
      id: questionId,
      text: questionText,
    };

    await set(newQuestionRef, newQuestion);
    return { data: newQuestion };
  } catch (error) {
    console.error("Failed to create question:", error);
    return { error: "Failed to create question" };
  }
};

export const getQuestions = async (): Promise<ApiResponse<Question[]>> => {
  try {
    return { data: questions.map((q, index) => ({ id: `q${index}`, text: q })) };
  } catch (error) {
    console.error("Failed to get questions:", error);
    return { error: "Failed to get questions" };
  }
};

export const submitAnswer = async (data: AnswerSubmit): Promise<ApiResponse<null>> => {
  try {
    const { roomId, playerId, questionId, answer } = data;
    const answerRef = ref(database, `rooms/${roomId}/answers/${questionId}`);

    await update(answerRef, { [playerId]: answer });

    const fakeAnswersResponse = await generateAnswers(answer);
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

export const getAllAnswers = async (
  roomId: string,
  questionId: string
): Promise<ApiResponse<string[]>> => {
  try {
    const allAnswersRef = ref(database, `rooms/${roomId}/allAnswers/${questionId}`);
    const snapshot = await get(allAnswersRef);
    const allAnswers = snapshot.val() as string[] | null;

    if (!allAnswers) {
      return { data: [] };
    }

    return { data: allAnswers };
  } catch (error) {
    console.error("Failed to get all answers:", error);
    return { error: "Failed to get all answers" };
  }
};

export const getRandomQuestion = async (roomId: string): Promise<ApiResponse<Question>> => {
  try {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[randomIndex];
    const newQuestion: Question = {
      id: `q${randomIndex}`,
      text: randomQuestion,
    };

    // データベースに質問を保存
    const questionRef = ref(database, `rooms/${roomId}/currentQuestion`);
    await set(questionRef, newQuestion);

    return { data: newQuestion };
  } catch (error) {
    console.error("Failed to get random question:", error);
    return { error: "Failed to get random question" };
  }
};
