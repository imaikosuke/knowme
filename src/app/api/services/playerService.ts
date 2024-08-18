import { database } from "@/lib/firebase";
import { ref, get, update, remove } from "firebase/database";
import { Player, PlayerUpdate, ApiResponse } from "@/types";

export const getPlayers = async (roomId: string): Promise<ApiResponse<Record<string, Player>>> => {
  try {
    const playersRef = ref(database, `rooms/${roomId}/players`);
    const snapshot = await get(playersRef);
    const players = snapshot.val() as Record<string, Player> | null;

    if (!players) {
      return { data: {} };
    }

    return { data: players };
  } catch (error) {
    console.error("Failed to get players:", error);
    return { error: "Failed to get players" };
  }
};

export const getPlayer = async (roomId: string, playerId: string): Promise<ApiResponse<Player>> => {
  try {
    const playerRef = ref(database, `rooms/${roomId}/players/${playerId}`);
    const snapshot = await get(playerRef);

    if (!snapshot.exists()) {
      return { error: "Player not found" };
    }

    const player = snapshot.val() as Player;
    return { data: player };
  } catch (error) {
    console.error("Failed to get player:", error);
    return { error: "Failed to get player" };
  }
};

export const updatePlayer = async (
  roomId: string,
  playerId: string,
  updates: PlayerUpdate
): Promise<ApiResponse<null>> => {
  try {
    const playerRef = ref(database, `rooms/${roomId}/players/${playerId}`);
    await update(playerRef, updates);
    return { data: null };
  } catch (error) {
    console.error("Failed to update player:", error);
    return { error: "Failed to update player" };
  }
};

export const removePlayer = async (roomId: string, playerId: string): Promise<ApiResponse<null>> => {
  try {
    const playerRef = ref(database, `rooms/${roomId}/players/${playerId}`);
    await remove(playerRef);
    return { data: null };
  } catch (error) {
    console.error("Failed to remove player:", error);
    return { error: "Failed to remove player" };
  }
};

export const selectRandomPlayer = async (roomId: string): Promise<ApiResponse<Player>> => {
  try {
    const playersResponse = await getPlayers(roomId);
    if (playersResponse.error) {
      return { error: playersResponse.error };
    }

    const players = Object.values(playersResponse.data ?? {});
    const activePlayers = players.filter((player) => !player.isEliminated);

    if (activePlayers.length === 0) {
      return { error: "No active players found" };
    }

    const randomIndex = Math.floor(Math.random() * activePlayers.length);
    return { data: activePlayers[randomIndex] };
  } catch (error) {
    console.error("Failed to select random player:", error);
    return { error: "Failed to select random player" };
  }
};

