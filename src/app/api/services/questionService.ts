import { database } from "@/lib/firebase";
import { ref, push, set, get, update } from "firebase/database";
import { Question, Answer, AnswerSubmit, ApiResponse } from "@/types";
import { generateAnswers } from "./openaiService";

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

export const getQuestions = async (roomId: string): Promise<ApiResponse<Question[]>> => {
  try {
    const questionsRef = ref(database, `rooms/${roomId}/questions`);
    const snapshot = await get(questionsRef);
    const questions = snapshot.val() as Record<string, Question> | null;

    if (!questions) {
      return { data: [] };
    }

    return { data: Object.values(questions) };
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
    const questionsResponse = await getQuestions(roomId);
    if (questionsResponse.error) {
      return { error: questionsResponse.error };
    }

    const questions = questionsResponse.data;
    if (questions?.length === 0) {
      return { error: "No questions available" };
    }

    const randomIndex = Math.floor(Math.random() * (questions?.length ?? 0));
    return { data: questions![randomIndex] };
  } catch (error) {
    console.error("Failed to get random question:", error);
    return { error: "Failed to get random question" };
  }
};
