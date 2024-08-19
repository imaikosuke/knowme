import { database } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import { GameState, Player, GuessSubmit, ApiResponse, Question, Room } from "@/types";
import { getPlayers, selectRandomPlayer, updatePlayer } from "./playerService";
import { createQuestion, getAnswers, getRandomQuestion } from "./questionService";
import { questions } from "@/types/questions";

export const startGame = async (roomId: string): Promise<ApiResponse<null>> => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
    const currentQuestionRef = ref(database, `rooms/${roomId}/currentQuestion`);

    // ランダムに質問を選択
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const firstQuestion: Question = {
      id: `q${Date.now()}`, // ユニークなIDを生成
      text: randomQuestion,
    };

    const firstPlayer = await selectFirstPlayer(roomId);

    const initialGameState: GameState = {
      currentRound: 1,
      currentPlayerId: firstPlayer.id,
      currentQuestionId: firstQuestion.id,
    };

    const updates = {
      status: "playing",
      gameState: initialGameState,
      currentQuestion: { data: firstQuestion },
    };

    await update(roomRef, updates);

    return { data: null };
  } catch (error) {
    console.error("Failed to start game:", error);
    return { error: "Failed to start game" };
  }
};

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

    const roomRef = ref(database, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);
    const room: Room = roomSnapshot.val();

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

    await update(roomRef, updates);

    // ゲーム終了チェック
    const updatedPlayersSnapshot = await get(ref(database, `rooms/${roomId}/players`));
    const updatedPlayers: Player[] = updatedPlayersSnapshot.val();
    const activePlayers = Object.values(updatedPlayers).filter((p) => !p.isEliminated);

    if (activePlayers.length === 1) {
      // ゲーム終了
      await update(roomRef, {
        status: "finished",
        winner: activePlayers[0].id,
      });
    } else if (Object.values(updatedPlayers).every((p: Player) => p.hasGuessed || p.isEliminated)) {
      // 全プレイヤーが推測したか脱落した場合、次のラウンドへ
      await moveToNextRound(roomId);
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
      return { data: null }; // ゲームが既に終了している場合は何もしない
    }

    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
    const playersRef = ref(database, `rooms/${roomId}/players`);

    const gameStateSnapshot = await get(gameStateRef);
    const currentGameState = gameStateSnapshot.val() as GameState;

    const playersSnapshot = await get(playersRef);
    const players: Record<string, Player> = playersSnapshot.val();

    // アクティブなプレイヤーのみを選択
    const activePlayers: Player[] = Object.values(players).filter((p: Player) => !p.isEliminated);

    if (activePlayers.length < 2) {
      // アクティブなプレイヤーが1人以下の場合、ゲーム終了
      await update(roomRef, {
        status: "finished",
        winner: activePlayers[0]?.id,
      });
      return { data: null };
    }

    const nextPlayer: Player = activePlayers[Math.floor(Math.random() * activePlayers.length)];

    // ランダムに新しい質問を選択
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const nextQuestion: Question = {
      id: `q${Date.now()}`, // ユニークなIDを生成
      text: randomQuestion,
    };

    const newGameState: GameState = {
      currentRound: currentGameState.currentRound + 1,
      currentPlayerId: nextPlayer.id,
      currentQuestionId: nextQuestion.id,
    };

    // プレイヤーの hasGuessed をリセット
    const updatedPlayers = Object.fromEntries(
      Object.entries(players).map(([id, player]) => [id, { ...player, hasGuessed: false }])
    );

    const updates = {
      gameState: newGameState,
      currentQuestion: { data: nextQuestion },
      players: updatedPlayers,
    };

    await update(roomRef, updates);

    return { data: null };
  } catch (error) {
    console.error("Failed to move to next round:", error);
    return { error: "Failed to move to next round" };
  }
};
