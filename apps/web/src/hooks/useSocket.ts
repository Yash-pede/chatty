import { useEffect } from "react";
import { connectSocket } from "@/ws/socket";
import { useClerkAuth } from "@/auth/clerk.tsx";

export function useSocket() {
  const { getToken, isAuthenticated } = useClerkAuth();
  console.log("[WS] useSocket effect", { isAuthenticated });
  useEffect(() => {
    if (!isAuthenticated) return;

    connectSocket(getToken).catch(console.error);
  }, [getToken, isAuthenticated]);
}
