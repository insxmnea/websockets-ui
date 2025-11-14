import { rooms, winners, wss } from "../server";
import { Message } from "../types/message";
import { Player } from "../types/player";

export function broadcastRooms() {
  const availableRooms = Array.from(rooms.values())
    .filter((room) => room.players.length === 1)
    .map((room) => ({
      roomId: room.roomId,
      roomUsers: room.players.map((player: Player) => ({
        name: player.name,
        index: player.index,
      })),
    }));

  const message = {
    type: "update_room",
    data: availableRooms,
    id: 0,
  };

  broadcastToAll(message);
}

export function broadcastWinners() {
  const winnersList = Array.from(winners.values()).map((player) => ({
    name: player.name,
    wins: player.wins || 0,
  }));

  const message = {
    type: "update_winners",
    data: winnersList,
    id: 0,
  };

  broadcastToAll(message);
}

function broadcastToAll(message: Message) {
  const messageString = JSON.stringify({
    type: message.type,
    data: JSON.stringify(message.data),
    id: message.id,
  });

  console.log("Broadcasting message:", messageString);

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(messageString);
    }
  });
}
