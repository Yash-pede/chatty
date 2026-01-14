import React, { createContext, useContext, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket, disconnectSocket } from "./socket";
import { useAuth } from "@clerk/clerk-react";

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let active = true;

    async function init() {
      const token = await getToken();
      if (!token || !active) return;

      const s = createSocket(token);

      s.connect();

      s.on("connect", () => {
        console.log("[WS] Connected");
        setIsConnected(true);
      });

      s.on("disconnect", () => {
        console.log("[WS] Disconnected");
        setIsConnected(false);
      });

      setSocket(s);
    }

    init();

    return () => {
      active = false;
      disconnectSocket();
    };
  }, [getToken]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocketContext must be used inside SocketProvider");
  }
  return ctx;
}
