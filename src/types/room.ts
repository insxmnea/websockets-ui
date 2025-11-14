import { Player } from "./player";

export interface Room {
  roomId: number;
  players: Player[];
  gameId: number | null;
}
