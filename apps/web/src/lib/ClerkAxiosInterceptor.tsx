import React, { useEffect } from "react";
import { api } from "@/lib/axios.ts";
import { useSession } from "@clerk/clerk-react";

const ClerkAxiosInterceptor = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSession();

  useEffect(() => {
    // Interceptor to add the JWT to requests
    const interceptorId = api.interceptors.request.use(
      async (config) => {
        // If a session exists, retrieve the session token
        if (session) {
          const token = await session.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Cleanup function to remove the interceptor when the component unmounts or session changes
    return () => {
      api.interceptors.request.eject(interceptorId);
    };
  }, [session]); // Re-run effect if the session object changes

  return <>{children}</>;
};

export default ClerkAxiosInterceptor;
