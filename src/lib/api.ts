import { setCookie } from "./cookies";
import { database } from "@/lib/firebase";
import { ref, get, set, push, update } from "firebase/database";
import { Room, RoomCreate, RoomJoin, ApiResponse, GameState, Question, Player } from "@/types";

const API_BASE_URL = "/api";

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response.json();
}

export const createRoom = async (nickname: string): Promise<Room> => {
  const response = await fetch("/api/rooms/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  if (!response.ok) {
    throw new Error("Failed to create room");
  }
  const room: Room = await response.json();
  const playerId = Object.keys(room.players)[0];
  setCookie("playerId", playerId, { maxAge: 86400 }); // 24時間有効
  return room;
};

export const joinRoom = async (roomId: string, nickname: string): Promise<Room> => {
  const response = await fetch("/api/rooms/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, nickname }),
  });
  if (!response.ok) {
    throw new Error("Failed to join room");
  }
  const room = await response.json();
  const playerId = Object.keys(room.players).find((id) => room.players[id].nickname === nickname);
  if (playerId) {
    setCookie("playerId", playerId, { maxAge: 86400 }); // 24時間有効
  }
  return room;
};

export const getRoom = (roomId: string) => fetchApi(`/rooms/${roomId}`);

export const getPlayers = async (roomId: string): Promise<Player[]> => {
  const response = await fetch(`/api/rooms/${roomId}/players`);
  if (!response.ok) {
    throw new Error("Failed to fetch players");
  }
  const data = await response.json();
  // データがオブジェクトの場合、配列に変換する
  return Array.isArray(data) ? data : Object.values(data);
};

export const getQuestions = async (roomId: string): Promise<Question[]> => {
  try {
    const questionsRef = ref(database, `rooms/${roomId}/questions`);
    const snapshot = await get(questionsRef);
    const questions = snapshot.val();
    return questions ? Object.values(questions) : [];
  } catch (error) {
    console.error("Failed to get questions:", error);
    throw error;
  }
};

export const getAllAnswers = async (roomId: string, questionId: string): Promise<string[]> => {
  try {
    const answersRef = ref(database, `rooms/${roomId}/allAnswers/${questionId}`);
    const snapshot = await get(answersRef);
    const answers = snapshot.val();
    return answers ? Object.values(answers) : [];
  } catch (error) {
    console.error("Failed to get all answers:", error);
    throw error;
  }
};

export const startGame = (roomId: string) => fetchApi(`/rooms/${roomId}/start`, { method: "POST" });

export const getGameState = async (roomId: string): Promise<GameState> => {
  try {
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
    const snapshot = await get(gameStateRef);
    return snapshot.val();
  } catch (error) {
    console.error("Failed to get game state:", error);
    throw error;
  }
};

export const submitAnswer = async (
  roomId: string,
  playerId: string,
  questionId: string,
  answer: string
): Promise<void> => {
  try {
    const answerRef = ref(database, `rooms/${roomId}/answers/${questionId}/${playerId}`);
    await set(answerRef, answer);
  } catch (error) {
    console.error("Failed to submit answer:", error);
    throw error;
  }
};

export const submitGuess = async (
  roomId: string,
  playerId: string,
  targetPlayerId: string,
  questionId: string,
  guessedAnswer: string
): Promise<boolean> => {
  try {
    const correctAnswerRef = ref(database, `rooms/${roomId}/answers/${questionId}/${targetPlayerId}`);
    const snapshot = await get(correctAnswerRef);
    const correctAnswer = snapshot.val();
    const isCorrect = guessedAnswer === correctAnswer;

    if (!isCorrect) {
      const playerRef = ref(database, `rooms/${roomId}/players/${playerId}`);
      await update(playerRef, { isEliminated: true });
    }

    const guessRef = ref(database, `rooms/${roomId}/players/${playerId}`);
    await update(guessRef, { hasGuessed: true });

    return isCorrect;
  } catch (error) {
    console.error("Failed to submit guess:", error);
    throw error;
  }
};

export const checkGameEnd = (roomId: string) =>
  fetchApi(`/game/${roomId}/check-end`, { method: "POST" });
