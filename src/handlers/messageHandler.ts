import WebSocket from "ws";
import { handleRegistration } from "./registrationHandler";
import { Message } from "../types/message";

export function handleMessage(ws: WebSocket, message: Message) {
  console.log("Received message:", message);

  switch (message.type) {
    case "reg":
      handleRegistration(ws, JSON.parse(message.data));
      break;
    default:
      console.log("Unknown message type:", message.type);
  }
}
