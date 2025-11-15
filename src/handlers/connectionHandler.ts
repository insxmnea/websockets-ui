import WebSocket from "ws";
import { players } from "../server";
import { Message } from "../types/message";
import { handleMessage } from "./messageHandler";
import { sendRegistrationMessage } from "../utils/messageFactory";

export const handleConnection = (ws: WebSocket) => {
  console.log("New client connected");

  ws.on("message", (data) => {
    try {
      const message: Message = JSON.parse(data.toString());
      handleMessage(ws, message);
    } catch (error) {
      console.error("Error parsing message:", error);

      sendRegistrationMessage(ws, {
        name: "",
        index: "",
        error: true,
        errorText: "Invalid JSON format",
      });
    }
  });

  ws.on("close", () => {
    let playerName = "";
    for (const [index, player] of players.entries()) {
      if (player.ws === ws) {
        playerName = player.name;
        break;
      }
    }
    console.log(`Client disconnected: ${playerName || "Unknown"}`);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
};
