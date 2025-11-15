import { WebSocket } from "ws";
import { games, rooms } from "../server";
import { Player } from "../types/player";
import { ShipData } from "../types/message";
import { Ship } from "../types/ship";
import { Room } from "../types/room";

export function handleShips(ws: WebSocket, data: ShipData) {
  const { gameId, ships, indexPlayer } = data;

  let game = games.get(Number(gameId));

  if (!game) {
    game = {
      id: Number(gameId),
      players: {},
      boards: {},
      currentPlayer: null,
      started: false,
    };
    games.set(Number(gameId), game);
  }

  game.players[indexPlayer] = { ships, ready: true };
  game.boards[indexPlayer] = createBoard(ships);

  const room = Array.from(rooms.values()).find(
    (r) => r.gameId === Number(gameId)
  );
  if (room && room.players.length === 2) {
    const bothReady = room.players.every(
      (player: Player) =>
        game.players[player.index] && game.players[player.index].ready
    );

    if (bothReady && !game.started) {
      startGame(game, room);
    }
  }
}

function createBoard(ships: Ship[]) {
  const board = Array(10)
    .fill(null)
    .map(() => Array(10).fill(0));

  ships.forEach((ship) => {
    const { position, direction, length } = ship;
    const { x, y } = position;

    for (let i = 0; i < length; i++) {
      if (direction) {
        board[y + i][x] = 1;
      } else {
        board[y][x + i] = 1;
      }
    }
  });

  return board;
}

function startGame(game: any, room: Room) {
  game.started = true;
  game.currentPlayer = room.players[0].index;

  room.players.forEach((player) => {
    const response = {
      type: "start_game",
      data: JSON.stringify({
        ships: game.players[player.index].ships,
        currentPlayerIndex: player.index,
      }),
      id: 0,
    };

    player.ws.send(JSON.stringify(response));
  });

  sendTurn(game, room);
}

function sendTurn(game: any, room: Room) {
  room.players.forEach((player) => {
    const response = {
      type: "turn",
      data: JSON.stringify({
        currentPlayer: game.currentPlayer,
      }),
      id: 0,
    };

    player.ws.send(JSON.stringify(response));
  });
}
