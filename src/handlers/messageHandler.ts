import WebSocket from "ws";
import { handleRegistration } from "./registrationHandler";
import { Message } from "../types/message";
import { handleRoomOperations } from "./roomHandler";
import { handleShips } from "./shipsHandler";

export function handleMessage(ws: WebSocket, message: Message) {
  console.log("Received message:", message);

  switch (message.type) {
    case "reg":
      handleRegistration(ws, JSON.parse(message.data));
      break;
    case "create_room":
      handleRoomOperations(ws, "create", "");
      break;
    case "add_user_to_room":
      handleRoomOperations(ws, "join", JSON.parse(message.data).indexRoom);
      break;
    case "add_ships":
      handleShips(ws, JSON.parse(message.data));
      break;
    default:
      console.log("Unknown message type:", message.type);
  }
}
