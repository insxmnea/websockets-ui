import WebSocket from "ws";
import { players } from "../server";
import { RegistrationDataCmd } from "../types/message";
import { sendRegistrationMessage } from "../utils/messageFactory";
import { broadcastWinners } from "./broadcastHandler";

let playerIndexCounter = 1;

export function handleRegistration(ws: WebSocket, data: RegistrationDataCmd) {
  const { name, password } = data;

  let player = Array.from(players.values()).find((p) => p.name === name);

  if (player) {
    if (player.password !== password) {
      sendRegistrationMessage(ws, {
        name,
        index: "",
        error: true,
        errorText: "Invalid password",
      });
      return;
    }

    player.ws = ws;
    player.index = player.index || playerIndexCounter++;
  } else {
    const index = playerIndexCounter++;

    player = {
      name,
      password,
      index,
      ws,
      wins: 0,
    };

    players.set(index, player);
  }

  sendRegistrationMessage(ws, {
    name,
    index: player.index,
    error: false,
    errorText: "",
  });
  broadcastWinners();
}
