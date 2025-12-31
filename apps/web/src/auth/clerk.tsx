import { ClerkProvider, useUser, useAuth } from "@clerk/clerk-react";
import * as React from "react";

export function ClerkWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
}

export function useClerkAuth() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return {
    isAuthenticated: isSignedIn,
    user: user
      ? {
          id: user.id,
          username:
            user.username || user.primaryEmailAddress?.emailAddress || "",
          email: user.primaryEmailAddress?.emailAddress || "",
        }
      : null,
    isLoading: !isLoaded,
  };
}
