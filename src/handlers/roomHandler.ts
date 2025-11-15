import { WebSocket } from "ws";
import { Player } from "../types/player";
import { Room } from "../types/room";
import { broadcastRooms } from "./broadcastHandler";
import { players, rooms } from "../server";

let roomIdCounter = 1;
let gameIdCounter = 1;

export function handleRoomOperations(
  ws: WebSocket,
  operation: string,
  roomId: string
) {
  const player: Player | undefined = Array.from(players.values()).find(
    (p) => p.ws === ws
  );

  if (!player) {
    console.log("Player not registered");
    return;
  }

  switch (operation) {
    case "create":
      createRoom(player);
      break;
    case "join":
      joinRoom(player, roomId);
      break;
  }
}

function createRoom(player: Player) {
  const roomId = roomIdCounter++;
  const room = {
    roomId,
    players: [player],
    gameId: null,
  };
  rooms.set(roomId, room);

  console.log(`Room ${roomId} created by player ${player.name}`);
  broadcastRooms();
}

function joinRoom(player: Player, roomId: string) {
  const room = rooms.get(Number(roomId));

  if (!room) {
    console.log(`Room ${roomId} not found`);
    return;
  }

  if (room.players.length >= 2) {
    console.log(`Room ${roomId} is full`);
    return;
  }

  room.players.push(player);
  console.log(`Player ${player.name} joined room ${roomId}`);

  if (room.players.length === 2) {
    createGame(room);
  }

  broadcastRooms();
}

function createGame(room: Room) {
  const gameId = gameIdCounter++;
  room.gameId = gameId;

  room.players.forEach((player: Player) => {
    const response = {
      type: "create_game",
      data: JSON.stringify({
        idGame: gameId,
        idPlayer: player.index,
      }),
      id: 0,
    };
    player.ws.send(JSON.stringify(response));
  });

  console.log(`Game ${gameId} created for room ${room.roomId}`);
}
