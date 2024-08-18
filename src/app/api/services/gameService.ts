import { database } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import { GameState, Player, GuessSubmit, ApiResponse, Question, Room } from "@/types";
import { getPlayers, selectRandomPlayer, updatePlayer } from "./playerService";
import { createQuestion, getAnswers, getRandomQuestion } from "./questionService";

export const startGame = async (roomId: string): Promise<ApiResponse<null>> => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
    const currentQuestionRef = ref(database, `rooms/${roomId}/currentQuestion`);

    // 最初の質問を選択（この関数は別途実装が必要）
    const firstQuestion = await selectRandomQuestion();

    const questions = [
      "What is your favorite color?",
      "What is your favorite food?",
      "What is your dream vacation destination?",
      "If you could have any superpower, what would it be?",
      "What's your favorite book or movie?",
    ];

    for (const questionText of questions) {
      await createQuestion(roomId, questionText);
    }

    // 最初のプレイヤーを選択（この関数は別途実装が必要）
    const firstPlayer = await selectFirstPlayer(roomId);

    const initialGameState: GameState = {
      currentRound: 1,
      currentPlayerId: firstPlayer.id,
      currentQuestionId: firstQuestion.id,
    };

    await update(roomRef, { status: "playing" });
    await set(gameStateRef, initialGameState);
    await set(currentQuestionRef, firstQuestion);

    return { data: null };
  } catch (error) {
    console.error("Failed to start game:", error);
    return { error: "Failed to start game" };
  }
};

async function selectRandomQuestion(): Promise<Question> {
  // ここに質問を選択するロジックを実装
  // 例：
  return {
    id: "question1",
    text: "What is your favorite color?",
  };
}

async function selectFirstPlayer(roomId: string): Promise<{ id: string }> {
  const playersRef = ref(database, `rooms/${roomId}/players`);
  const snapshot = await get(playersRef);
  const players = snapshot.val();
  const playerIds = Object.keys(players);
  const randomIndex = Math.floor(Math.random() * playerIds.length);
  return { id: playerIds[randomIndex] };
}

export const getGameState = async (roomId: string): Promise<ApiResponse<GameState>> => {
  try {
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
    const snapshot = await get(gameStateRef);
    const gameState = snapshot.val() as GameState | null;

    if (!gameState) {
      return { error: "Game state not found" };
    }

    return { data: gameState };
  } catch (error) {
    console.error("Failed to get game state:", error);
    return { error: "Failed to get game state" };
  }
};

export const updateGameState = async (
  roomId: string,
  newState: Partial<GameState>
): Promise<ApiResponse<null>> => {
  try {
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
    await update(gameStateRef, newState);
    return { data: null };
  } catch (error) {
    console.error("Failed to update game state:", error);
    return { error: "Failed to update game state" };
  }
};

export const submitGuess = async (data: GuessSubmit): Promise<ApiResponse<boolean>> => {
  try {
    const { roomId, playerId, targetPlayerId, guessedAnswer } = data;

    const answersResponse = await getAnswers(roomId, data.questionId);
    if (answersResponse.error) {
      return { error: answersResponse.error };
    }

    const answers = answersResponse.data;
    const correctAnswer = answers![targetPlayerId];

    if (correctAnswer === undefined) {
      return { error: "Correct answer not found" };
    }

    const isCorrect = guessedAnswer.toLowerCase() === correctAnswer.toLowerCase();

    const updates: { [key: string]: any } = {
      [`players/${playerId}/hasGuessed`]: true,
    };

    if (!isCorrect) {
      updates[`players/${playerId}/isEliminated`] = true;
    }

    await update(ref(database, `rooms/${roomId}`), updates);

    // Check if the game has ended
    const roomSnapshot = await get(ref(database, `rooms/${roomId}`));
    const room: Room = roomSnapshot.val();
    const activePlayers = Object.values(room.players).filter((p: Player) => !p.isEliminated);

    if (activePlayers.length === 1) {
      // Game has ended
      await update(ref(database, `rooms/${roomId}`), {
        status: "finished",
        winner: activePlayers[0].id,
      });
    }

    return { data: isCorrect };
  } catch (error) {
    console.error("Failed to submit guess:", error);
    return { error: "Failed to submit guess" };
  }
};

export const checkGameEnd = async (roomId: string): Promise<ApiResponse<Player | null>> => {
  try {
    const playersResponse = await getPlayers(roomId);
    if (playersResponse.error) {
      return { error: playersResponse.error };
    }

    const players = Object.values(playersResponse.data!);
    const activePlayers = players.filter((player) => !player.isEliminated);

    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      await update(ref(database, `rooms/${roomId}`), { status: "finished" });
      return { data: winner };
    }

    return { data: null };
  } catch (error) {
    console.error("Failed to check game end:", error);
    return { error: "Failed to check game end" };
  }
};

export const moveToNextRound = async (roomId: string): Promise<ApiResponse<null>> => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);
    const room = roomSnapshot.val();

    if (room.status === "finished") {
      return { data: null }; // Game has already ended, do nothing
    }

    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
    const playersRef = ref(database, `rooms/${roomId}/players`);

    const gameStateSnapshot = await get(gameStateRef);
    const currentGameState = gameStateSnapshot.val() as GameState;

    const nextPlayer = await selectRandomPlayer(roomId);
    const nextQuestion = await getRandomQuestion(roomId);

    if (nextQuestion.error || !nextQuestion.data) {
      return { error: "No more questions available. Game over." };
    }

    const newGameState: GameState = {
      currentRound: currentGameState.currentRound + 1,
      currentPlayerId: nextPlayer.data!.id,
      currentQuestionId: nextQuestion.data.id,
    };

    const playersSnapshot = await get(playersRef);
    const players = playersSnapshot.val();
    Object.keys(players).forEach((playerId) => {
      players[playerId].hasGuessed = false;
    });

    await update(roomRef, {
      gameState: newGameState,
      currentQuestion: nextQuestion.data,
      players: players,
    });

    return { data: null };
  } catch (error) {
    console.error("Failed to move to next round:", error);
    return { error: "Failed to move to next round" };
  }
};
