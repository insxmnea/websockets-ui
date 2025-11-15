import { WebSocket } from "ws";
import { games, rooms, players, winners } from "../server";
import { broadcastWinners } from "./broadcastHandler";
import { Player } from "../types/player";
import { Room } from "../types/room";

export function handleGame(ws: WebSocket, operation: string, data: any) {
  const { gameId, indexPlayer } = data;
  const game = games.get(Number(gameId));

  console.log(
    `Received ${operation} for game ${gameId} by player ${indexPlayer}`
  );

  if (!game || !game.started) {
    console.log("Game not found or not started");
    return;
  }

  if (game.currentPlayer !== indexPlayer) {
    console.log("Not your turn");
    return;
  }

  const room = Array.from(rooms.values()).find(
    (r) => r.gameId === Number(gameId)
  );
  if (!room) return;

  const enemyPlayer: Player = room.players.find(
    (p) => p.index !== indexPlayer
  ) as Player;
  const enemyBoard = game.boards[enemyPlayer.index];

  let x, y;

  if (operation === "attack") {
    ({ x, y } = data);
  } else {
    ({ x, y } = getRandomAttack(enemyBoard));
  }

  console.log(typeof x);
  console.log(typeof y);

  const attackResult = processAttack(enemyBoard, x, y);

  broadcastAttack(room, x, y, indexPlayer, attackResult.status);

  if (attackResult.status === "miss") {
    game.currentPlayer = enemyPlayer.index;
    sendTurn(game, room);
  } else if (attackResult.status === "killed") {
    if (isGameFinished(enemyBoard)) {
      finishGame(game, room, indexPlayer);
      return;
    }
    sendTurn(game, room);
  }
}

function getRandomAttack(board: number[][]) {
  let x, y;
  do {
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);
  } while (board[y][x] === 2 || board[y][x] === 3); // 2 = miss, 3 = hit

  return { x, y };
}

function processAttack(board: number[][], x: number, y: number) {
  if (x < 0 || x >= 10 || y < 0 || y >= 10) {
    return { status: "miss" };
  }

  if (board[y][x] === 1) {
    board[y][x] = 3; // Mark as hit

    if (isShipKilled(board, x, y)) {
      markAroundShip(board, x, y);
      return { status: "killed" };
    }

    return { status: "shot" };
  } else {
    board[y][x] = 2; // Mark as miss
    return { status: "miss" };
  }
}

function isShipKilled(board: number[][], x: number, y: number) {
  let i = x;
  while (i >= 0 && (board[y][i] === 1 || board[y][i] === 3)) {
    if (board[y][i] === 1) return false;
    i--;
  }

  i = x + 1;
  while (i < 10 && (board[y][i] === 1 || board[y][i] === 3)) {
    if (board[y][i] === 1) return false;
    i++;
  }

  let j = y;
  while (j >= 0 && (board[j][x] === 1 || board[j][x] === 3)) {
    if (board[j][x] === 1) return false;
    j--;
  }

  j = y + 1;
  while (j < 10 && (board[j][x] === 1 || board[j][x] === 3)) {
    if (board[j][x] === 1) return false;
    j++;
  }

  return true;
}

function markAroundShip(board: number[][], x: number, y: number) {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  directions.forEach(([dx, dy]) => {
    const newX = x + dx;
    const newY = y + dy;

    if (
      newX >= 0 &&
      newX < 10 &&
      newY >= 0 &&
      newY < 10 &&
      board[newY][newX] === 0
    ) {
      board[newY][newX] = 2; // Mark as miss
    }
  });
}

function isGameFinished(board: number[][]) {
  return board.flat().every((cell) => cell !== 1); // No ship cells left
}

function broadcastAttack(
  room: Room,
  x: number,
  y: number,
  currentPlayer: number,
  status: string
) {
  room.players.forEach((player) => {
    const response = {
      type: "attack",
      data: JSON.stringify({
        position: { x, y },
        currentPlayer,
        status,
      }),
      id: 0,
    };
    player.ws.send(JSON.stringify(response));
  });
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

function finishGame(game: any, room: Room, winnerIndex: number) {
  const winner = players.get(winnerIndex);
  if (winner) {
    winner.wins = (winner.wins || 0) + 1;
    winners.set(winnerIndex, winner);
  }

  room.players.forEach((player) => {
    const response = {
      type: "finish",
      data: JSON.stringify({
        winPlayer: winnerIndex,
      }),
      id: 0,
    };
    player.ws.send(JSON.stringify(response));
  });

  broadcastWinners();

  games.delete(game.id);
  rooms.delete(room.roomId);
}
