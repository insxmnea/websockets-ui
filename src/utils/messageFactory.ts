import { WebSocket } from "ws";
import { RegistrationData } from "../types/message";

export const sendRegistrationMessage = (
  ws: WebSocket,
  regData: RegistrationData
) => {
  ws.send(
    JSON.stringify({
      type: "reg",
      data: JSON.stringify(regData),
      id: 0,
    })
  );
};
