import { database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Player, ApiResponse } from "@/types";

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
