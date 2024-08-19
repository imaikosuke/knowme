// src/types/index.ts

export type RoomStatus = "waiting" | "playing" | "finished";

export interface Player {
  id: string;
  nickname: string;
  isOwner: boolean;
  isEliminated: boolean;
  hasGuessed: boolean;
}

export interface Question {
  id: string;
  text: string;
}

export interface Answer {
  id: string;
  playerId: string;
  questionId: string;
  text: string;
}

export interface Room {
  id: string;
  status: RoomStatus;
  winner: string | null;
  players: { [playerId: string]: Player };
  questions: Question[];
  answers: { [questionId: string]: { [playerId: string]: string } };
  allAnswers: { [questionId: string]: string[] };
}

export interface GameState {
  currentRound: number;
  currentPlayerId: string;
  currentQuestionId: string | null;
}

export interface PlayerUpdate {
  nickname?: string;
  isEliminated?: boolean;
}

export interface RoomCreate {
  nickname: string;
}

export interface RoomJoin {
  roomId: string;
  nickname: string;
}

export interface AnswerSubmit {
  roomId: string;
  playerId: string;
  questionId: string;
  answer: string;
}

export interface GuessSubmit {
  roomId: string;
  playerId: string;
  targetPlayerId: string;
  questionId: string;
  guessedAnswer: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// types/index.ts

export interface Player {
  id: string;
  nickname: string;
  isOwner: boolean;
  isEliminated: boolean;
}

export interface Question {
  id: string;
  text: string;
}

export interface Room {
  id: string;
  status: "waiting" | "playing" | "finished";
  players: Record<string, Player>;
  questions: Question[];
  answers: Record<string, Record<string, string>>;
  allAnswers: Record<string, string[]>;
  gameState: GameState;
}

export interface RoomCreate {
  nickname: string;
}

export interface RoomJoin {
  roomId: string;
  nickname: string;
}

export interface AnswerSubmit {
  roomId: string;
  playerId: string;
  questionId: string;
  answer: string;
}

export interface PlayerUpdate {
  isEliminated?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
