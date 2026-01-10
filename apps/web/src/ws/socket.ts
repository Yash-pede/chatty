import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export async function connectSocket(getToken: () => Promise<string | null>) {
  console.log("[WS] connectSocket called");

  const token = await getToken();
  console.log("[WS] token exists:", !!token);

  if (!token) {
    throw new Error("No Clerk token available");
  }

  socket = io(import.meta.env.VITE_WS_URL, {
    path: "/ws/chat",
    transports: ["websocket"],
    auth: {
      token,
    },
    withCredentials: true,
  });
  socket.on("connect", () => {
    console.log("[WS] connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("[WS] connect_error:", err.message);
  });
  return socket;
}

export function getSocket() {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
}
