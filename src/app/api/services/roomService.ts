import { database } from "@/lib/firebase";
import { ref, set, get, push, update } from "firebase/database";
import { Room, RoomCreate, RoomJoin, ApiResponse, RoomStatus } from "@/types";

export const createRoom = async (data: RoomCreate): Promise<ApiResponse<Room>> => {
  try {
    const roomsRef = ref(database, "rooms");
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key as string;

    const newRoom: Room = {
      id: roomId,
      status: "waiting",
      players: {
        [data.nickname]: {
          id: data.nickname,
          nickname: data.nickname,
          isOwner: true,
          isEliminated: false,
        },
      },
      questions: [],
      answers: {},
      allAnswers: {},
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

    const updatedPlayers = {
      ...room.players,
      [data.nickname]: {
        id: data.nickname,
        nickname: data.nickname,
        isOwner: false,
        isEliminated: false,
      },
    };

    await update(roomRef, { players: updatedPlayers });

    return { data: { ...room, players: updatedPlayers } };
  } catch (error) {
    console.error("Failed to join room:", error);
    return { error: "Failed to join room" };
  }
};

export const updateRoomStatus = async (
  roomId: string,
  status: RoomStatus
): Promise<ApiResponse<null>> => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    await update(roomRef, { status });
    return { data: null };
  } catch (error) {
    console.error("Failed to update room status:", error);
    return { error: "Failed to update room status" };
  }
};

export const getRoom = async (roomId: string): Promise<ApiResponse<Room>> => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      return { error: "Room not found" };
    }

    const room = roomSnapshot.val() as Room;
    return { data: room };
  } catch (error) {
    console.error("Failed to get room:", error);
    return { error: "Failed to get room" };
  }
};
