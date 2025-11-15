import { Player } from "./types/player";
import { WebSocketServer } from "ws";
import { handleConnection } from "./handlers/connectionHandler";
import { broadcastRooms, broadcastWinners } from "./handlers/broadcastHandler";
import { Room } from "./types/room";

const PORT = 3000;

export const players = new Map<number, Player>();
export const rooms = new Map<number, Room>();
export const winners = new Map();
export const games = new Map();

export const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server started on port ${PORT}`);

wss.on("connection", (ws) => {
  handleConnection(ws);
});

setImmediate(() => {
  broadcastRooms();
  broadcastWinners();
});
