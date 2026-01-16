import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function createSocket(token: string): Socket {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_WS_URL, {
    path: "/ws/chat",
    transports: ["websocket"],
    auth: {
      token,
    },
    autoConnect: false,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
