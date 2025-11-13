import { WebSocketServer } from "ws";
import { handleConnection } from "./handlers/connectionHandler.ts";

const PORT = 3000;

export const players = new Map();

export const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server started on port ${PORT}`);

wss.on("connection", (ws) => {
  handleConnection(ws);
});
