import WebSocket from "ws";
import { players } from "../server.ts";

export const handleConnection = (ws: WebSocket) => {
  console.log("New client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
    for (const [index, player] of players.entries()) {
      if (player.ws === ws) {
        players.delete(index);
        break;
      }
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
};
