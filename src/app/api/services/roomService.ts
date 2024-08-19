import { database } from "@/lib/firebase";
import { ref, set, get, push, update } from "firebase/database";
import { Room, RoomCreate, RoomJoin, ApiResponse } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const createRoom = async (data: RoomCreate): Promise<ApiResponse<Room>> => {
  try {
    const roomsRef = ref(database, "rooms");
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key as string;
    const uniquePlayerId = uuidv4();

    const newRoom: Room = {
      id: roomId,
      status: "waiting",
      players: {
        [uniquePlayerId]: {
          id: uniquePlayerId,
          nickname: data.nickname,
          isOwner: true,
          hasGuessed: false,
          isEliminated: false,
        },
      },
      questions: [],
      answers: {},
      allAnswers: {},
      winner: null,
      gameState: {
        currentQuestionId: null,
        currentRound: 0,
        currentPlayerId: "",
      },
    };

    await set(newRoomRef, newRoom);
    return { data: newRoom };
  } catch (error) {
    console.error("Failed to create room:", error);
    return { error: "Failed to create room" };
  }
};

export const joinRoom = async (data: RoomJoin): Promise<ApiResponse<Room>> => {
  try {
    const roomRef = ref(database, `rooms/${data.roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      return { error: "Room not found" };
    }

    const room = roomSnapshot.val() as Room;

    if (room.status !== "waiting") {
      return { error: "Room is not accepting new players" };
    }

    const uniquePlayerId = uuidv4();
    const updatedPlayers = {
      ...room.players,
      [uniquePlayerId]: {
        id: uniquePlayerId,
        nickname: data.nickname,
        isOwner: false,
        isEliminated: false,
        hasGuessed: false,
      },
    };

    await update(roomRef, { players: updatedPlayers });

    return { data: { ...room, players: updatedPlayers } };
  } catch (error) {
    console.error("Failed to join room:", error);
    return { error: "Failed to join room" };
  }
};
