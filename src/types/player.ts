import WebSocket from "ws";

export interface Player {
  name: string;
  password: string;
  index: number;
  ws: WebSocket;
  wins: number;
}
